import { CashTransaction } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validateCashTransaction(trx: Omit<CashTransaction, 'id'>): void {
  if (!trx.safeId) throw new ValidationError('الخزينة مطلوبة.');
  if (!trx.transactionNo?.trim()) throw new ValidationError('رقم الحركة مطلوب.');
  if (!trx.date) throw new ValidationError('تاريخ الحركة مطلوب.');
  if (!trx.type) throw new ValidationError('نوع الحركة مطلوب.');
  if (trx.amount <= 0) throw new ValidationError('مبلغ الحركة يجب أن يكون أكبر من صفر.');
  if (!trx.direction) throw new ValidationError('اتجاه الحركة مطلوب.');
  if (!trx.description?.trim()) throw new ValidationError('البيان/الوصف مطلوب.');
  if (!trx.createdBy?.trim()) throw new ValidationError('اسم المستخدم المنشئ مطلوب.');
}
