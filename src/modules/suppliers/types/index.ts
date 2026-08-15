export interface Supplier {
  id?: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  balance: number; // Positive = we owe supplier, Negative = supplier credit (legacy)
  openingBalance?: number;
  legacyBalance?: number;
  currentBalance?: number;
  notes?: string;
}

export type SupplierLedgerEntryType = 'OPENING' | 'PURCHASE' | 'PAYMENT' | 'RETURN' | 'ADJUSTMENT';

export interface SupplierLedgerEntry {
  id?: string;
  transactionNo: string;
  supplierId: string;
  date: string; // YYYY-MM-DD
  type: SupplierLedgerEntryType;
  amount: number;
  direction: 'in' | 'out'; // 'in' increases payable, 'out' decreases payable
  referenceId?: string;
  description: string;
  createdBy: string;
  createdAt?: string; // ISO string
}

