import { z } from 'zod';

export const safeSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'اسم الخزينة مطلوب'),
  type: z.enum(['رئيسية', 'فرعية', 'حساب بنكي']).default('فرعية'),
  balance: z.number().default(0),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
});

export const safeTransactionSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, 'التاريخ مطلوب'),
  safeId: z.string().min(1, 'الخزينة مطلوبة'),
  type: z.enum(['إيداع', 'سحب', 'تحويل']).default('إيداع'),
  category: z.string().min(1, 'نوع الحركة/المدفوعات مطلوب'),
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  relatedEntityType: z.enum(['عميل', 'مورد', 'موظف', 'أمر شغل', 'مصروفات', 'أخرى']).optional(),
  relatedEntityId: z.string().optional(),
  statement: z.string().min(1, 'البيان/الشرج مطلوب'),
  receivedBy: z.string().optional(),
  notes: z.string().optional().default(''),
});

export const bankCheckSchema = z.object({
  id: z.string().optional(),
  checkNumber: z.string().min(1, 'رقم الشيك مطلوب'),
  dueDate: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),
  type: z.enum(['صادر', 'وارد']).default('وارد'),
  bankName: z.string().min(1, 'اسم البنك مطلوب'),
  amount: z.number().positive('مبلغ الشيك يجب أن يكون أكبر من صفر'),
  status: z.enum(['قيد الانتظار', 'متحصل', 'مرتد', 'ملغى']).default('قيد الانتظار'),
  issuerOrPayee: z.string().min(1, 'الجهة/العميل/المورد مطلوب'),
  notes: z.string().optional(),
});

export type SafeInput = z.infer<typeof safeSchema>;
export type SafeTransactionInput = z.infer<typeof safeTransactionSchema>;
export type BankCheckInput = z.infer<typeof bankCheckSchema>;
