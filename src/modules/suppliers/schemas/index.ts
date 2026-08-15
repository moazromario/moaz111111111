import { Supplier } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export { validateSupplierLedgerEntry } from './supplierLedgerSchema';

export function validateSupplier(supplier: Omit<Supplier, 'id'>): void {
  if (!supplier.name?.trim()) throw new ValidationError('اسم المورد مطلوب.');
  if (!supplier.code?.trim()) throw new ValidationError('كود المورد مطلوب.');
}

