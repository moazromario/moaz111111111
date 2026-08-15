import { BOM, ProductionJob, WorkCenter } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validateBOM(bom: Omit<BOM, 'id'>): void {
  if (!bom.productName?.trim()) throw new ValidationError('اسم المنتج التام مطلوب في شجرة المواد.');
  if (!bom.items || bom.items.length === 0) throw new ValidationError('يجب إضافة مكون واحد على الأقل لشجرة المواد.');
}

export function validateProductionJob(job: Omit<ProductionJob, 'id'>): void {
  if (!job.jobCardNumber?.trim()) throw new ValidationError('رقم بطاقة التشغيل مطلوب.');
  if (job.quantityRequested <= 0) throw new ValidationError('الكمية المطلوبة للإنتاج يجب أن تكون أكبر من صفر.');
}

export function validateWorkCenter(wc: Omit<WorkCenter, 'id'>): void {
  if (!wc.name?.trim()) throw new ValidationError('اسم مركز العمل مطلوب.');
  if (wc.hourlyRate < 0) throw new ValidationError('معدل تكلفة الساعة لا يمكن أن يكون بالسالب.');
}
