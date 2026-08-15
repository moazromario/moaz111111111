import { PayrollSlip, Loan } from '../types';
import { ValidationError } from '../../../core/errors/AppError';

export function validatePayrollSlip(slip: Omit<PayrollSlip, 'id'>): void {
  if (!slip.employeeId) throw new ValidationError('الموظف مطلوب.');
  if (!slip.month) throw new ValidationError('الشهر مطلوب.');
  if (slip.netSalary < 0) throw new ValidationError('صافي الراتب لا يمكن أن يكون أقل من صفر.');
}

export function validateLoan(loan: Omit<Loan, 'id'>): void {
  if (!loan.employeeId) throw new ValidationError('الموظف مطلوب لطلب السلفة.');
  if (loan.amount <= 0) throw new ValidationError('مبلغ السلفة يجب أن يكون أكبر من صفر.');
}
