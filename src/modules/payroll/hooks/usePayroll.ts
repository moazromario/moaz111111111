import { useState, useEffect, useCallback } from 'react';
import { PayrollSlip, Loan } from '../types';
import { payrollService } from '../services/PayrollService';
import { payrollRepo, loansRepo } from '../repositories/PayrollRepository';

export function usePayroll() {
  const [slips, setSlips] = useState<PayrollSlip[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubSlips = payrollRepo.subscribeAll((data) => {
      setSlips(data);
      setLoading(false);
    }, (err) => setError(err.message));

    const unsubLoans = loansRepo.subscribeAll((data) => {
      setLoans(data);
    });

    return () => {
      unsubSlips();
      unsubLoans();
    };
  }, []);

  const createPayrollSlip = useCallback(async (slip: Omit<PayrollSlip, 'id'>) => {
    try {
      setError(null);
      return await payrollService.createPayrollSlip(slip);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createLoan = useCallback(async (loan: Omit<Loan, 'id'>) => {
    try {
      setError(null);
      return await payrollService.createLoan(loan);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const approveLoan = useCallback(async (id: string) => {
    try {
      setError(null);
      await payrollService.approveLoan(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    slips,
    loans,
    loading,
    error,
    createPayrollSlip,
    createLoan,
    approveLoan
  };
}
