import { Employee, AttendanceRecord } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validateEmployee(emp: Omit<Employee, 'id'>): void {
  if (!emp.name?.trim()) throw new ValidationError('اسم الموظف مطلوب.');
  if (!emp.code?.trim()) throw new ValidationError('كود الموظف مطلوب.');
  if (emp.basicSalary < 0) throw new ValidationError('الراتب الأساسي لا يمكن أن يكون بالسالب.');
}

export function validateAttendance(record: Omit<AttendanceRecord, 'id'>): void {
  if (!record.employeeId) throw new ValidationError('الموظف مطلوب لتسجيل الحضور.');
  if (!record.date) throw new ValidationError('تاريخ اليوم مطلوب.');
}
