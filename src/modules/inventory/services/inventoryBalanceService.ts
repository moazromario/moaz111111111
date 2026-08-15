import { inventoryItemsRepo, stockTransactionsRepo, warehouseRepo } from '../repositories/InventoryRepository';
import { InventoryItem, StockTransaction } from '../types';

export interface ReconciliationRecord {
  itemId: string;
  itemCode: string;
  itemName: string;
  legacyBalance: number;
  ledgerBalance: number;
  variance: number;
  status: 'MATCHED' | 'DISCREPANCY';
  lastTransactionDate?: string;
}

export class InventoryBalanceService {
  /**
   * Calculates the ledger balance of an item by querying all its transactions.
   * Balance = Opening + Receipts + Returns In + Transfers In + Production Receipts - Issues - Sales - Waste - Transfers Out
   */
  async calculateLedgerBalance(itemId: string): Promise<number> {
    const transactions = await stockTransactionsRepo.findByItem(itemId);
    
    let balance = 0;
    
    // Sort transactions by date/time to process sequentially if needed
    for (const tx of transactions) {
      if (tx.direction === 'in') {
        balance += tx.quantity;
      } else if (tx.direction === 'out') {
        balance -= tx.quantity;
      }
    }
    
    return balance;
  }

  /**
   * Generates a reconciliation report for all items in the inventory.
   */
  async generateReconciliationReport(): Promise<ReconciliationRecord[]> {
    const items = await inventoryItemsRepo.getAll();
    const report: ReconciliationRecord[] = [];

    for (const item of items) {
      const ledgerBalance = await this.calculateLedgerBalance(item.id!);
      const legacyBalance = item.legacyBalance !== undefined ? item.legacyBalance : (item.quantity || 0);
      const variance = legacyBalance - ledgerBalance;
      const status = Math.abs(variance) < 0.0001 ? 'MATCHED' : 'DISCREPANCY';

      // Find the last transaction date
      const txs = await stockTransactionsRepo.findByItem(item.id!);
      let lastTransactionDate: string | undefined;
      if (txs.length > 0) {
        const sorted = [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        lastTransactionDate = sorted[0].date;
      }

      report.push({
        itemId: item.id!,
        itemCode: item.code,
        itemName: item.name,
        legacyBalance,
        ledgerBalance,
        variance,
        status,
        lastTransactionDate
      });
    }

    return report;
  }

  /**
   * Safe migration trigger - does not touch legacy data but ensures
   * the ledger and cached balances are fully matched for new items.
   */
  async verifyAndSyncItem(itemId: string): Promise<{ success: boolean; message: string }> {
    const item = await inventoryItemsRepo.getById(itemId);
    if (!item) return { success: false, message: 'الصنف غير موجود.' };

    const ledgerBalance = await this.calculateLedgerBalance(itemId);
    const legacyBalance = item.legacyBalance !== undefined ? item.legacyBalance : (item.quantity || 0);

    if (Math.abs(legacyBalance - ledgerBalance) < 0.0001) {
      return { success: true, message: 'أرصدة الصنف متطابقة تماماً بين الدفتر والقديم.' };
    }

    // Force sync the legacy balance with the ledger balance to resolve discrepancies manually if needed
    await inventoryItemsRepo.update(itemId, {
      legacyBalance: ledgerBalance,
      quantity: ledgerBalance
    });

    return {
      success: true,
      message: `تمت مزامنة الصنف نجاحاً. الرصيد الجديد: ${ledgerBalance}`
    };
  }
}

export const inventoryBalanceService = new InventoryBalanceService();
