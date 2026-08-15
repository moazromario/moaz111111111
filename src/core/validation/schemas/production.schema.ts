import { z } from 'zod';

export const workOrderRoomSchema = z.object({
  id: z.string().optional(),
  roomName: z.string().trim().min(1, 'اسم الغرفة/الوحدة مطلوب'),
  itemType: z.string().optional(),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative().default(0),
  totalPrice: z.number().nonnegative().default(0),
  stage: z.string().default('النجارة'),
  specifications: z.string().optional(),
  notes: z.string().optional(),
});

export const workOrderSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string().trim().min(1, 'رقم أمر الشغل مطلوب'),
  contractNumber: z.string().optional(),
  date: z.string().min(1, 'تاريخ البدء مطلوب'),
  expectedDeliveryDate: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().trim().min(1, 'اسم العميل مطلوب'),
  customerPhone: z.string().optional(),
  rooms: z.array(workOrderRoomSchema).min(1, 'يجب إضافة غرفة واحدة على الأقل'),
  totalContractValue: z.number().nonnegative().default(0),
  status: z.enum(['جديد', 'قيد التنفيذ', 'معلق', 'جاهز للتسليم', 'تم التسليم', 'ملغى']).default('جديد'),
  currentStage: z.string().default('النجارة'),
  notes: z.string().optional().default(''),
});

export const issuanceSchema = z.object({
  id: z.string().optional(),
  issuanceNumber: z.string().optional(),
  date: z.string().min(1, 'تاريخ الصرف مطلوب'),
  workOrderId: z.string().min(1, 'أمر الشغل مطلوب'),
  itemId: z.string().min(1, 'الخامة مطلوبة'),
  quantity: z.number().positive('الكمية المصروفة يجب أن تكون أكبر من صفر'),
  unitPrice: z.number().nonnegative().default(0),
  totalCost: z.number().nonnegative().default(0),
  warehouseId: z.string().optional(),
  notes: z.string().optional().default(''),
});

export const jobLaborSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, 'التاريخ مطلوب'),
  workOrderId: z.string().min(1, 'أمر الشغل مطلوب'),
  workerId: z.string().optional(),
  workerName: z.string().min(1, 'اسم العامل مطلوب'),
  stageName: z.string().min(1, 'المرحلة مطلوبة'),
  hoursWorked: z.number().nonnegative().default(0),
  hourlyRate: z.number().nonnegative().default(0),
  totalCost: z.number().nonnegative().default(0),
  notes: z.string().optional(),
});

export type WorkOrderInput = z.infer<typeof workOrderSchema>;
export type IssuanceInput = z.infer<typeof issuanceSchema>;
export type JobLaborInput = z.infer<typeof jobLaborSchema>;
