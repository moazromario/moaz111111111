import { Payroll, PayrollComponent } from '../../../types';

export class PayrollService {
  calculatePayroll(payroll: Payroll): Payroll {
    const grossEarnings = payroll.earnings.reduce((sum, item) => sum + item.amount, payroll.baseSalary);
    const totalDeductions = payroll.deductions.reduce((sum, item) => sum + item.amount, 0);
    const netSalary = grossEarnings - totalDeductions;

    return {
      ...payroll,
      status: 'CALCULATED',
      grossEarnings,
      totalDeductions,
      netSalary
    };
  }

  approvePayroll(payroll: Payroll, approverId: string): Payroll {
    return {
      ...payroll,
      status: 'APPROVED',
      approvedBy: approverId
    };
  }
}

export const payrollService = new PayrollService();
