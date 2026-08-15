export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface ChartOfAccount {
  id?: string;
  code: string;
  nameAr: string;
  nameEn?: string;
  type: AccountType;
  parentCode?: string;
  level: number;
  balance: number;
  debit: number;
  credit: number;
  isActive: boolean;
  costCenterRequired?: boolean;
}

export interface JournalEntryLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
  costCenterId?: string;
}

export interface JournalVoucher {
  id?: string;
  voucherNumber: string;
  date: string;
  description: string;
  referenceType?: 'purchase' | 'sale' | 'payment' | 'receipt' | 'payroll' | 'manual';
  referenceId?: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  postedBy?: string;
  postedAt?: string;
  status: 'draft' | 'posted' | 'cancelled';
}

export interface CostCenter {
  id?: string;
  code: string;
  name: string;
  type: 'production' | 'service' | 'administrative' | 'sales';
  isActive: boolean;
}
