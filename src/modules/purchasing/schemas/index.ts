import { PurchaseInvoice, SupplierPayment } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validatePurchaseInvoice(invoice: Omit<PurchaseInvoice, 'id'>): void {
  if (!invoice.invoiceNumber?.trim()) throw new ValidationError('رقم فاتورة الشراء مطلوب.');
  if (!invoice.supplierId) throw new ValidationError('المورد مطلوب.');
  if (!invoice.items || invoice.items.length === 0) throw new ValidationError('الفاتورة يجب أن تحتوي على أصناف.');
  if (invoice.totalAmount <= 0) throw new ValidationError('إجمالي الفاتورة يجب أن يكون أكبر من صفر.');
}

export function validateSupplierPayment(payment: Omit<SupplierPayment, 'id'>): void {
  if (!payment.supplierId) throw new ValidationError('المورد مطلوب.');
  if (payment.amount <= 0) throw new ValidationError('مبلغ السداد يجب أن يكون أكبر من صفر.');
}
