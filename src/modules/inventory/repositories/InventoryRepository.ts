import { BaseRepository } from '../../shared/BaseRepository';
import { InventoryItem, StockIssuance, Warehouse, StockTransaction } from '../types';

export class InventoryItemsRepository extends BaseRepository<InventoryItem> {
  constructor() {
    super('items');
  }

  async findByCode(code: string): Promise<InventoryItem | null> {
    const res = await this.findWhere('code', '==', code);
    return res.length > 0 ? res[0] : null;
  }
}

export class StockIssuanceRepository extends BaseRepository<StockIssuance> {
  constructor() {
    super('issuances');
  }
}

export class WarehouseRepository extends BaseRepository<Warehouse> {
  constructor() {
    super('warehouses');
  }
}

export class StockTransactionsRepository extends BaseRepository<StockTransaction> {
  constructor() {
    super('stockTransactions');
  }

  async findByItem(itemId: string): Promise<StockTransaction[]> {
    return await this.findWhere('itemId', '==', itemId);
  }
}

export const inventoryItemsRepo = new InventoryItemsRepository();
export const stockIssuanceRepo = new StockIssuanceRepository();
export const warehouseRepo = new WarehouseRepository();
export const stockTransactionsRepo = new StockTransactionsRepository();
