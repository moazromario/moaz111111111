import { Vehicle, VehicleExpense } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validateVehicle(vehicle: Omit<Vehicle, 'id'>): void {
  if (!vehicle.plateNumber?.trim()) throw new ValidationError('رقم لوحة المركبة مطلوب.');
  if (!vehicle.model?.trim()) throw new ValidationError('طراز المركبة مطلوب.');
}

export function validateVehicleExpense(exp: Omit<VehicleExpense, 'id'>): void {
  if (!exp.vehicleId) throw new ValidationError('المركبة مطلوبة.');
  if (exp.amount <= 0) throw new ValidationError('مبلغ المصروف يجب أن يكون أكبر من صفر.');
}
