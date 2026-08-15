import { BaseRepository } from '../../shared/BaseRepository';
import { PayrollSlip, Loan } from '../types';

export class PayrollRepository extends BaseRepository<PayrollSlip> {
  constructor() {
    super('payrolls');
  }
}

export class LoansRepository extends BaseRepository<Loan> {
  constructor() {
    super('loans');
  }
}

export const payrollRepo = new PayrollRepository();
export const loansRepo = new LoansRepository();
