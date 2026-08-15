export interface Customer {
  id?: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: 'أفراد' | 'شركات' | 'مقاولين' | 'تجار' | 'مهندسين ديكور';
  status?: 'نشط' | 'غير نشط' | 'محتمل' | 'محظور';
  balance: number; // Customer balance: Positive means they owe us (receivable), Negative means credit/advance
  openingBalance?: number;
  legacyBalance?: number;
  currentBalance?: number;
  notes?: string;
  createdAt?: string;
}

export type CustomerLedgerEntryType = 'OPENING' | 'SALE' | 'PAYMENT' | 'RETURN' | 'ADJUSTMENT';

export interface CustomerLedgerEntry {
  id?: string;
  transactionNo: string;
  customerId: string;
  date: string; // YYYY-MM-DD
  type: CustomerLedgerEntryType;
  amount: number;
  direction: 'in' | 'out'; // 'in' increases receivable, 'out' decreases receivable
  referenceId?: string;
  description: string;
  createdBy: string;
  createdAt?: string; // ISO string
}

export interface SalesOrder {
  id?: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  paidAmount: number;
  status: 'draft' | 'confirmed' | 'delivered' | 'cancelled';
}

export interface DeliveryReceipt {
  id?: string;
  receiptNumber: string;
  salesOrderId: string;
  customerName: string;
  date: string;
  itemsDelivered: {
    itemName: string;
    quantity: number;
  }[];
  driverName?: string;
}
