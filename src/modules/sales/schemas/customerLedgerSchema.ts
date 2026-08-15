import { CustomerLedgerEntry } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validateCustomerLedgerEntry(entry: Omit<CustomerLedgerEntry, 'id'>): void {
  if (!entry.customerId) throw new ValidationError('العميل مطلوب.');
  if (!entry.transactionNo?.trim()) throw new ValidationError('رقم الحركة مطلوب.');
  if (!entry.date) throw new ValidationError('تاريخ الحركة مطلوب.');
  if (!entry.type) throw new ValidationError('نوع الحركة مطلوب.');
  if (entry.amount <= 0) throw new ValidationError('مبلغ الحركة يجب أن يكون أكبر من صفر.');
  if (!entry.direction) throw new ValidationError('اتجاه الحركة مطلوب.');
  if (!entry.description?.trim()) throw new ValidationError('البيان/الوصف مطلوب.');
  if (!entry.createdBy?.trim()) throw new ValidationError('اسم المستخدم المنشئ مطلوب.');
}
