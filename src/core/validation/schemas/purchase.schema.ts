import { z } from 'zod';

export const purchaseItemSchema = z.object({
  itemId: z.string().min(1, 'اسم الخامة مطلوب'),
  itemName: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
  unitPrice: z.number().nonnegative('سعر الوحدة يجب ألا يكون بالسالب'),
  totalPrice: z.number().nonnegative('الإجمالي يجب ألا يكون بالسالب'),
});

export const purchaseSchema = z.object({
  id: z.string().optional(),
  invoiceNumber: z.string().trim().min(1, 'رقم الفاتورة مطلوب'),
  date: z.string().min(1, 'التاريخ مطلوب'),
  supplierId: z.string().min(1, 'المورد مطلوب'),
  supplierName: z.string().optional(),
  warehouseId: z.string().min(1, 'المخزن مطلوب'),
  items: z.array(purchaseItemSchema).min(1, 'يجب إضافة خامة واحدة على الأقل'),
  totalAmount: z.number().nonnegative(),
  paidAmount: z.number().nonnegative().default(0),
  remainingAmount: z.number().nonnegative().default(0),
  paymentMethod: z.enum(['نقدي', 'آجل', 'تحويل بنكي', 'شيك']).default('آجل'),
  safeId: z.string().optional(),
  notes: z.string().optional().default(''),
});

export const supplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'اسم المورد مطلوب'),
  phone: z.string().optional(),
  openingBalance: z.number().default(0),
  totalPurchases: z.number().default(0),
  totalPayments: z.number().default(0),
  balance: z.number().default(0),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
