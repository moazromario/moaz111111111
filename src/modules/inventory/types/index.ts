export interface InventoryItem {
  id?: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  sellingPrice?: number;
  warehouseId?: string;
  notes?: string;
  // Legacy / Cached Balance properties
  openingBalance?: number;
  inward?: number;
  outward?: number;
  returned?: number;
  wasted?: number;
  currentBalance?: number;
  totalValue?: number;
  legacyBalance?: number;
}

export type StockTransactionType =
  | 'OPENING'
  | 'PURCHASE_RECEIPT'
  | 'PURCHASE_RETURN'
  | 'ISSUE'
  | 'WASTE'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'PRODUCTION_RECEIPT'
  | 'SALES_ISSUE'
  | 'STOCK_ADJUSTMENT';

export interface StockTransaction {
  id?: string;
  transactionNo: string;
  date: string;
  itemId: string;
  warehouseId: string;
  transactionType: StockTransactionType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  direction: 'in' | 'out';
  referenceType: 'purchase' | 'sale' | 'production' | 'issuance' | 'transfer' | 'adjustment' | 'manual';
  referenceId?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface StockIssuance {
  id?: string;
  issuanceNumber: string;
  date: string;
  workOrderId?: string;
  jobCardId?: string;
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  issuedBy?: string;
  notes?: string;
}

export interface Warehouse {
  id?: string;
  code: string;
  name: string;
  location?: string;
  managerName?: string;
  isDefault?: boolean;
}

export interface DualReadResult {
  itemId: string;
  itemCode: string;
  itemName: string;
  legacyBalance: number;
  ledgerBalance: number;
  diff: number;
  status: 'PASS' | 'FAIL';
}
