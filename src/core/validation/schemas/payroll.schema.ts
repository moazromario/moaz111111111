import { z } from 'zod';

export const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'اسم الموظف مطلوب'),
  nationalId: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().min(1, 'القسم مطلوب'),
  jobTitle: z.string().optional(),
  salaryType: z.enum(['شهري', 'يومي', 'بالقطعة']).default('شهري'),
  basicSalary: z.number().nonnegative().default(0),
  dailyRate: z.number().nonnegative().default(0),
  hourlyRate: z.number().nonnegative().default(0),
  status: z.enum(['نشط', 'موقوف', 'مستقيل']).default('نشط'),
});

export const attendanceSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, 'التاريخ مطلوب'),
  employeeId: z.string().min(1, 'الموظف مطلوب'),
  status: z.enum(['حضور', 'غياب', 'إجازة', 'نصف يوم']).default('حضور'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  overtimeHours: z.number().nonnegative().default(0),
  delayMinutes: z.number().nonnegative().default(0),
  notes: z.string().optional(),
});

export const payrollSchema = z.object({
  id: z.string().optional(),
  month: z.string().min(1, 'الشهر مطلوب (YYYY-MM)'),
  employeeId: z.string().min(1, 'الموظف مطلوب'),
  employeeName: z.string().optional(),
  basicSalary: z.number().nonnegative().default(0),
  allowances: z.number().nonnegative().default(0),
  overtimeAmount: z.number().nonnegative().default(0),
  pieceWorkAmount: z.number().nonnegative().default(0),
  deductions: z.number().nonnegative().default(0),
  loansDeduction: z.number().nonnegative().default(0),
  netSalary: z.number().default(0),
  status: z.enum(['مسودة', 'معتمد', 'مدفوع']).default('مسودة'),
  paymentDate: z.string().optional(),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type PayrollInput = z.infer<typeof payrollSchema>;
