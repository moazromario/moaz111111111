export interface Safe {
  id?: string;
  name: string;
  code: string;
  type: 'main' | 'sub' | 'showroom' | 'خزنة رئيسية' | 'عهدة موظف' | 'بنك';
  balance: number;
  legacyBalance?: number;
  currentBalance?: number;
  custodianName?: string;
  minBalanceThreshold?: number;
}

export type CashTransactionType = 'OPENING' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT';
export type CashTransactionReferenceType = 'purchase' | 'sale' | 'payroll' | 'transfer' | 'manual' | 'adjustment';

export interface CashTransaction {
  id?: string;
  transactionNo: string;
  safeId: string;
  date: string; // YYYY-MM-DD
  type: CashTransactionType;
  amount: number;
  direction: 'in' | 'out';
  referenceType: CashTransactionReferenceType;
  referenceId?: string;
  description: string;
  createdBy: string;
  createdAt?: string; // ISO string
}

export interface SafeTransaction {
  id?: string;
  safeId: string;
  transactionType?: 'deposit' | 'withdrawal' | 'transfer';
  type?: 'إيداع' | 'سحب' | 'تحويل' | 'مصروفات' | 'مبيعات' | 'مشتريات' | 'رواتب' | 'قرض شخصي' | 'سداد قرض' | 'جرد' | 'أخرى';
  amount: number;
  date: string;
  category: string;
  description: string;
  referenceNumber?: string;
  performedBy?: string;
  createdBy?: string;
}

export interface BankAccount {
  id?: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  balance: number;
  currency: string;
}
