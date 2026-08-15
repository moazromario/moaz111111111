import { useState, useEffect, useCallback } from 'react';
import { ChartOfAccount, JournalVoucher, CostCenter } from '../types';
import { accountingService } from '../services/AccountingService';
import { chartOfAccountsRepo, journalVoucherRepo, costCentersRepo } from '../repositories/AccountingRepository';

export function useAccounting() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalVoucher[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubAccounts = chartOfAccountsRepo.subscribeAll((data) => {
      setAccounts(data);
      setLoading(false);
    }, (err) => setError(err.message));

    const unsubEntries = journalVoucherRepo.subscribeAll((data) => {
      setJournalEntries(data);
    });

    const unsubCostCenters = costCentersRepo.subscribeAll((data) => {
      setCostCenters(data);
    });

    return () => {
      unsubAccounts();
      unsubEntries();
      unsubCostCenters();
    };
  }, []);

  const postVoucher = useCallback(async (voucher: Omit<JournalVoucher, 'id'>, userId?: string) => {
    try {
      setError(null);
      return await accountingService.postJournalVoucher(voucher, userId);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء ترحيل القيد المحاسبي');
      throw err;
    }
  }, []);

  const createAccount = useCallback(async (acc: Omit<ChartOfAccount, 'id'>) => {
    try {
      setError(null);
      return await accountingService.createAccount(acc);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إضافة الحساب المحاسبي');
      throw err;
    }
  }, []);

  return {
    accounts,
    journalEntries,
    costCenters,
    loading,
    error,
    postVoucher,
    createAccount
  };
}
