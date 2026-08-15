import { Customer, SalesOrder } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export { validateCustomerLedgerEntry } from './customerLedgerSchema';

export function validateCustomer(cust: Omit<Customer, 'id'>): void {
  if (!cust.name?.trim()) throw new ValidationError('اسم العميل مطلوب.');
}

export function validateSalesOrder(order: Omit<SalesOrder, 'id'>): void {
  if (!order.orderNumber?.trim()) throw new ValidationError('رقم أمر المبيعات مطلوب.');
  if (!order.customerId) throw new ValidationError('العميل مطلوب.');
  if (!order.items || order.items.length === 0) throw new ValidationError('يجب إضافة أصناف لأمر المبيعات.');
}
