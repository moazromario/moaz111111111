export interface PayrollSlip {
  id?: string;
  employeeId: string;
  employeeName: string;
  month: string; // e.g., "2026-08"
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  paidDate?: string;
}

export interface Loan {
  id?: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  installmentsCount: number;
  remainingAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid_off';
}
