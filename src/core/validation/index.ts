import { z } from 'zod';
import { ValidationError } from '../errors/AppError';
import { Result, Ok, Err } from '../result/Result';

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): Result<T, ValidationError> {
  const parseResult = schema.safeParse(data);
  if (!parseResult.success) {
    const issueMessages = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    return Err(new ValidationError(`خطأ في بيانات المدخلات: ${issueMessages}`, { issues: parseResult.error.issues }));
  }
  return Ok(parseResult.data);
}

export const commonSchemas = {
  id: z.string().min(1, 'المعرف مطلوب'),
  nonEmptyString: z.string().trim().min(1, 'هذا الحقل مطلوب'),
  positiveNumber: z.number().positive('يجب أن يكون الرقم أكبر من صفر'),
  nonNegativeNumber: z.number().nonnegative('يجب ألا يكون الرقم بالسالب'),
  arabicDateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ غير صحيحة (YYYY-MM-DD)'),
  phone: z.string().regex(/^01[0125]\d{8}$/, 'رقم الهاتف غير صحيح'),
};

export * from './schemas/item.schema';
export * from './schemas/purchase.schema';
export * from './schemas/sales.schema';
export * from './schemas/production.schema';
export * from './schemas/payroll.schema';
export * from './schemas/treasury.schema';

