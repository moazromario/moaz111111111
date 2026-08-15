import { payrollRepo, loansRepo } from '../repositories/PayrollRepository';
import { PayrollSlip, Loan } from '../types';
import { validatePayrollSlip, validateLoan } from '../schemas';

export class PayrollService {
  async getPayrollSlips(): Promise<PayrollSlip[]> {
    return await payrollRepo.getAll();
  }

  async createPayrollSlip(slip: Omit<PayrollSlip, 'id'>): Promise<PayrollSlip> {
    validatePayrollSlip(slip);
    return await payrollRepo.create(slip);
  }

  async getLoans(): Promise<Loan[]> {
    return await loansRepo.getAll();
  }

  async createLoan(loan: Omit<Loan, 'id'>): Promise<Loan> {
    validateLoan(loan);
    return await loansRepo.create(loan);
  }

  async approveLoan(id: string): Promise<void> {
    await loansRepo.update(id, { status: 'approved' });
  }
}

export const payrollService = new PayrollService();
