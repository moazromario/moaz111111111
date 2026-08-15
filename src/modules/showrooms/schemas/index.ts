import { Showroom, ShowroomInventory } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validateShowroom(showroom: Omit<Showroom, 'id'>): void {
  if (!showroom.name?.trim()) throw new ValidationError('اسم المعرض مطلوب.');
  if (!showroom.code?.trim()) throw new ValidationError('كود المعرض مطلوب.');
}

export function validateShowroomInventory(inv: Omit<ShowroomInventory, 'id'>): void {
  if (!inv.showroomId) throw new ValidationError('المعرض مطلوب.');
  if (inv.quantity < 0) throw new ValidationError('الكمية لا يمكن أن تكون بالسالب.');
}
