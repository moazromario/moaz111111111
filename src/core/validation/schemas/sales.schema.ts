import { z } from 'zod';

export const salesOrderItemSchema = z.object({
  jobId: z.string().optional(),
  productName: z.string().min(1, 'اسم المنتج مطلوب'),
  quantity: z.number().positive().default(1),
  sellingPrice: z.number().nonnegative('سعر البيع يجب ألا يكون بالسالب'),
  cogs: z.number().nonnegative().default(0),
  logisticsCost: z.number().nonnegative().default(0),
  commission: z.number().nonnegative().default(0),
});

export const salesOrderSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string().optional(),
  date: z.string().min(1, 'التاريخ مطلوب'),
  showroomId: z.string().optional().default('المصنع'),
  customerId: z.string().optional(),
  customerName: z.string().trim().min(1, 'اسم العميل مطلوب'),
  customerPhone: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1, 'يجب إضافة منتج واحد على الأقل'),
  totalAmount: z.number().nonnegative(),
  depositPaid: z.number().nonnegative().default(0),
  remainingBalance: z.number().nonnegative().default(0),
  totalCOGS: z.number().nonnegative().default(0),
  totalLogisticsCost: z.number().nonnegative().default(0),
  totalCommission: z.number().nonnegative().default(0),
  paymentMethod: z.enum(['نقدي', 'شبكة', 'تحويل بنكي', 'آجل']).default('نقدي'),
  safeId: z.string().optional(),
  notes: z.string().optional().default(''),
});

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'اسم العميل مطلوب'),
  phone: z.string().optional(),
  address: z.string().optional(),
  totalOrders: z.number().default(0),
  totalPaid: z.number().default(0),
  balance: z.number().default(0),
});

export type SalesOrderInput = z.infer<typeof salesOrderSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
