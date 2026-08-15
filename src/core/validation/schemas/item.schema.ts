import { z } from 'zod';

export const itemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'اسم الأصناف/الخامة مطلوب'),
  unit: z.string().trim().min(1, 'وحدة القياس مطلوبة'),
  secondaryUnit: z.string().optional(),
  conversionFactor: z.number().nonnegative().optional(),
  price: z.number().nonnegative('السعر يجب أن يكون صفراً أو أكثر'),
  department: z.string().default('عام'),
  category: z.string().default('عام'),
  warehouseId: z.string().min(1, 'المستودع مطلوب'),
  openingBalance: z.number().default(0),
  inward: z.number().default(0),
  outward: z.number().default(0),
  returned: z.number().default(0),
  wasted: z.number().default(0),
  currentBalance: z.number().default(0),
  totalValue: z.number().default(0),
  safetyLimit: z.number().nonnegative().default(0),
});

export const wasteSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, 'التاريخ مطلوب'),
  itemId: z.string().min(1, 'الخامة مطلوبة'),
  quantity: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
  unit: z.string().min(1, 'الوحدة مطلوبة'),
  reason: z.string().min(1, 'سبب الهالك مطلوب'),
  notes: z.string().optional().default(''),
});

export const warehouseSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'اسم المستودع مطلوب'),
});

export type ItemInput = z.infer<typeof itemSchema>;
export type WasteInput = z.infer<typeof wasteSchema>;
export type WarehouseInput = z.infer<typeof warehouseSchema>;
