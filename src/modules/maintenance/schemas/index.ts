import { MaintenanceOrder } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validateMaintenanceOrder(order: Omit<MaintenanceOrder, 'id'>): void {
  if (!order.machineName?.trim()) throw new ValidationError('اسم الماكينة مطلوب.');
  if (!order.description?.trim()) throw new ValidationError('تفاصيل صيانة الماكينة مطلوبة.');
}
