export interface PurchaseInvoice {
  id?: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentType: 'cash' | 'credit' | 'bank';
  status: 'pending' | 'received' | 'cancelled';
}

export interface SupplierPayment {
  id?: string;
  paymentNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  amount: number;
  paymentMethod: 'safe' | 'bank' | 'check';
  sourceId: string; // safeId or bankId
  notes?: string;
}
