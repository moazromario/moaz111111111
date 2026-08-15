import { Safe, SafeTransaction } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export { validateCashTransaction } from './cashTransactionSchema';

export function validateSafeTransaction(trx: Omit<SafeTransaction, 'id'>): void {
  if (!trx.safeId) throw new ValidationError('الخزينة مطلوبة.');
  if (trx.amount <= 0) throw new ValidationError('مبلغ الحركة يجب أن يكون أكبر من صفر.');
  if (!trx.description?.trim()) throw new ValidationError('البيان مطلوب.');
}
