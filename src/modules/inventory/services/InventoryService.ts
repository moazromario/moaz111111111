import { inventoryItemsRepo, stockIssuanceRepo, warehouseRepo, stockTransactionsRepo } from '../repositories/InventoryRepository';
import { InventoryItem, StockIssuance, Warehouse, StockTransaction, StockTransactionType } from '../types';
import { validateInventoryItem, validateStockIssuance, validateStockTransaction } from '../schemas';
import { InsufficientStockError, ValidationError } from '../../../core/errors/AppError';
import { validateStockTransactionSchema } from '../schemas/inventorySchemas';
import { inventoryBalanceService } from './inventoryBalanceService';

export class InventoryService {
  async getItems(): Promise<InventoryItem[]> {
    return await inventoryItemsRepo.getAll();
  }

  async addItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    validateInventoryItem(item);

    const initialQty = item.quantity || 0;
    const payload: Omit<InventoryItem, 'id'> = {
      ...item,
      openingBalance: item.openingBalance || initialQty,
      inward: 0,
      outward: 0,
      returned: 0,
      wasted: 0,
      currentBalance: initialQty,
      legacyBalance: initialQty,
      totalValue: initialQty * (item.costPrice || 0)
    };

    const createdItem = await inventoryItemsRepo.create(payload);

    // Create an opening stock transaction if quantity > 0
    if (payload.openingBalance && payload.openingBalance > 0) {
      await stockTransactionsRepo.create({
        transactionNo: `TX-OPN-${Date.now()}-${createdItem.code}`,
        date: new Date().toISOString().split('T')[0],
        itemId: createdItem.id!,
        warehouseId: createdItem.warehouseId || 'default',
        transactionType: 'OPENING',
        quantity: payload.openingBalance,
        unitCost: createdItem.costPrice || 0,
        totalCost: payload.openingBalance * (createdItem.costPrice || 0),
        direction: 'in',
        referenceType: 'manual',
        createdAt: new Date().toISOString()
      });
      // Recalculate to ensure everything is perfectly synced
      await this.recalculateItemBalance(createdItem.id!);
    }

    return createdItem;
  }

  async recalculateItemBalance(itemId: string): Promise<InventoryItem> {
    const item = await inventoryItemsRepo.getById(itemId);
    if (!item) throw new Error('الصنف غير موجود لحساب الرصيد.');

    const transactions = await stockTransactionsRepo.findByItem(itemId);

    let openingBalance = item.openingBalance || 0;
    let receipts = 0;
    let returnsIn = 0;
    let transfersIn = 0;
    let productionReceipts = 0;
    let issues = 0;
    let sales = 0;
    let waste = 0;
    let transfersOut = 0;

    for (const tx of transactions) {
      const q = tx.quantity || 0;
      const typeUpper = (tx.transactionType || '').toUpperCase();
      switch (typeUpper) {
        case 'OPENING':
          openingBalance = q;
          break;
        case 'RECEIPT':
        case 'PURCHASE_RECEIPT':
          receipts += q;
          break;
        case 'RETURN_IN':
        case 'PURCHASE_RETURN':
          returnsIn += q;
          break;
        case 'TRANSFER_IN':
          transfersIn += q;
          break;
        case 'PRODUCTION_RECEIPT':
          productionReceipts += q;
          break;
        case 'ISSUE':
          issues += q;
          break;
        case 'SALE':
        case 'SALES_ISSUE':
          sales += q;
          break;
        case 'WASTE':
          waste += q;
          break;
        case 'TRANSFER_OUT':
          transfersOut += q;
          break;
      }
    }

    const inward = receipts + returnsIn + transfersIn + productionReceipts;
    const outward = issues + sales + waste + transfersOut;
    const currentBalance = openingBalance + inward - outward;
    const totalValue = currentBalance * (item.costPrice || 0);

    const updatedFields: Partial<InventoryItem> = {
      openingBalance,
      inward,
      outward,
      returned: returnsIn,
      wasted: waste,
      currentBalance,
      quantity: currentBalance,
      totalValue
    };

    await inventoryItemsRepo.update(itemId, updatedFields);
    return { ...item, ...updatedFields };
  }

  async addStockTransaction(tx: Omit<StockTransaction, 'id'>): Promise<StockTransaction> {
    validateStockTransaction(tx);
    const createdTx = await stockTransactionsRepo.create(tx);
    await this.recalculateItemBalance(tx.itemId);
    return createdTx;
  }

  async updateItemQuantity(
    id: string,
    delta: number,
    transactionType: StockTransactionType = 'PURCHASE_RECEIPT',
    referenceType: 'purchase' | 'sale' | 'production' | 'issuance' | 'transfer' | 'adjustment' | 'manual' = 'manual',
    referenceId?: string
  ): Promise<void> {
    const item = await inventoryItemsRepo.getById(id);
    if (!item) throw new Error('الصنف غير موجود.');

    const direction = delta >= 0 ? 'in' : 'out';
    const quantity = Math.abs(delta);

    if (direction === 'out' && (item.quantity || 0) < quantity) {
      throw new InsufficientStockError(item.name, item.quantity || 0, quantity);
    }

    // Update the legacy direct accumulator
    const currentLegacy = item.legacyBalance !== undefined ? item.legacyBalance : (item.quantity || 0);
    const newLegacy = currentLegacy + delta;
    await inventoryItemsRepo.update(id, { legacyBalance: newLegacy });

    const computedTxType: StockTransactionType = direction === 'in' ? transactionType : 'ISSUE';

    await this.addStockTransaction({
      transactionNo: `TX-QTY-${Date.now()}-${item.code}`,
      date: new Date().toISOString().split('T')[0],
      itemId: id,
      warehouseId: item.warehouseId || 'default',
      transactionType: computedTxType,
      quantity: quantity,
      unitCost: item.costPrice || 0,
      totalCost: quantity * (item.costPrice || 0),
      direction,
      referenceType,
      referenceId,
      createdAt: new Date().toISOString()
    });
  }

  async createIssuance(issuance: Omit<StockIssuance, 'id'>): Promise<StockIssuance> {
    validateStockIssuance(issuance);

    // Verify stock availability
    for (const line of issuance.items) {
      const item = await inventoryItemsRepo.getById(line.itemId);
      if (!item || (item.quantity || 0) < line.quantity) {
        throw new InsufficientStockError(line.itemName, item?.quantity || 0, line.quantity);
      }
    }

    const created = await stockIssuanceRepo.create(issuance);

    // Create stock transactions and recalculate balance, and update legacyBalance
    for (const line of issuance.items) {
      const item = await inventoryItemsRepo.getById(line.itemId);
      if (item) {
        const currentLegacy = item.legacyBalance !== undefined ? item.legacyBalance : (item.quantity || 0);
        const newLegacy = currentLegacy - line.quantity;
        await inventoryItemsRepo.update(line.itemId, { legacyBalance: newLegacy });
      }

      await this.addStockTransaction({
        transactionNo: `TX-ISS-${Date.now()}-${line.itemCode}`,
        date: issuance.date,
        itemId: line.itemId,
        warehouseId: item?.warehouseId || 'default',
        transactionType: 'ISSUE',
        quantity: line.quantity,
        unitCost: line.unitPrice,
        totalCost: line.totalPrice,
        direction: 'out',
        referenceType: 'issuance',
        referenceId: created.id,
        createdAt: new Date().toISOString()
      });
    }

    return created;
  }

  async getDualReadStatus(itemId: string): Promise<any> {
    const item = await inventoryItemsRepo.getById(itemId);
    if (!item) throw new Error('الصنف غير موجود.');

    const legacyBalance = item.legacyBalance !== undefined ? item.legacyBalance : (item.quantity || 0);

    const transactions = await stockTransactionsRepo.findByItem(itemId);
    let openingBalance = item.openingBalance || 0;
    let receipts = 0;
    let returnsIn = 0;
    let transfersIn = 0;
    let productionReceipts = 0;
    let issues = 0;
    let sales = 0;
    let waste = 0;
    let transfersOut = 0;

    for (const tx of transactions) {
      const q = tx.quantity || 0;
      const typeUpper = (tx.transactionType || '').toUpperCase();
      switch (typeUpper) {
        case 'OPENING':
          openingBalance = q;
          break;
        case 'RECEIPT':
        case 'PURCHASE_RECEIPT':
          receipts += q;
          break;
        case 'RETURN_IN':
        case 'PURCHASE_RETURN':
          returnsIn += q;
          break;
        case 'TRANSFER_IN':
          transfersIn += q;
          break;
        case 'PRODUCTION_RECEIPT':
          productionReceipts += q;
          break;
        case 'ISSUE':
          issues += q;
          break;
        case 'SALE':
        case 'SALES_ISSUE':
          sales += q;
          break;
        case 'WASTE':
          waste += q;
          break;
        case 'TRANSFER_OUT':
          transfersOut += q;
          break;
      }
    }

    const inward = receipts + returnsIn + transfersIn + productionReceipts;
    const outward = issues + sales + waste + transfersOut;
    const ledgerBalance = openingBalance + inward - outward;

    const diff = Math.abs(legacyBalance - ledgerBalance);
    const status = diff === 0 ? 'PASS' : 'FAIL';

    return {
      itemId,
      itemCode: item.code,
      itemName: item.name,
      legacyBalance,
      ledgerBalance,
      diff,
      status
    };
  }

  async getAllDualReadStatuses(): Promise<any[]> {
    const items = await inventoryItemsRepo.getAll();
    const results = [];
    for (const item of items) {
      const res = await this.getDualReadStatus(item.id!);
      results.push(res);
    }
    return results;
  }

  async getWarehouses(): Promise<Warehouse[]> {
    return await warehouseRepo.getAll();
  }

  async getStockTransactions(): Promise<StockTransaction[]> {
    return await stockTransactionsRepo.getAll();
  }

  async getTransactionsByItem(itemId: string): Promise<StockTransaction[]> {
    return await stockTransactionsRepo.findByItem(itemId);
  }

  async createStockTransaction(tx: Omit<StockTransaction, 'id'>): Promise<StockTransaction> {
    // 1. Schema-level validation (types, range check, quantity > 0, unitCost >= 0)
    validateStockTransactionSchema(tx);

    // 2. Validate Item exists
    const item = await inventoryItemsRepo.getById(tx.itemId);
    if (!item) {
      throw new ValidationError(`الصنف ذو المعرّف "${tx.itemId}" غير موجود في النظام.`);
    }

    // 3. Validate Warehouse exists
    if (tx.warehouseId !== 'default') {
      const warehouse = await warehouseRepo.getById(tx.warehouseId);
      if (!warehouse) {
        throw new ValidationError(`المستودع ذو المعرّف "${tx.warehouseId}" غير موجود في النظام.`);
      }
    }

    // 4. Validate Sufficient Stock where required
    if (tx.direction === 'out') {
      const currentBalance = item.legacyBalance !== undefined ? item.legacyBalance : (item.quantity || 0);
      if (currentBalance < tx.quantity) {
        throw new InsufficientStockError(
          item.name,
          currentBalance,
          tx.quantity
        );
      }
    }

    // 5. Authorization Validation (CreatedBy verification)
    if (!tx.createdBy || tx.createdBy === 'SYSTEM_UNAUTHORIZED') {
      throw new ValidationError('عملية غير مصرح بها. مستخدم الحركة مطلوب لإتمام القيد الدفتري.');
    }

    // 6. Record transaction in the new ledger
    const createdTx = await stockTransactionsRepo.create(tx);

    // 7. Dual Update: update legacyBalance and currentBalance on item
    const delta = tx.direction === 'in' ? tx.quantity : -tx.quantity;
    const currentLegacy = item.legacyBalance !== undefined ? item.legacyBalance : (item.quantity || 0);
    const newLegacy = currentLegacy + delta;

    const ledgerBalance = await inventoryBalanceService.calculateLedgerBalance(tx.itemId);

    await inventoryItemsRepo.update(tx.itemId, {
      legacyBalance: newLegacy,
      quantity: ledgerBalance,
      currentBalance: ledgerBalance
    });

    return createdTx;
  }
}

export const inventoryService = new InventoryService();
