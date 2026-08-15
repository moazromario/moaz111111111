import { useState, useEffect, useCallback } from 'react';
import { Safe, SafeTransaction, BankAccount, CashTransaction } from '../types';
import { treasuryService } from '../services/TreasuryService';
import { cashBalanceService, CashReconciliationStatus } from '../services/cashBalanceService';
import { runTreasuryMigrationTests, TestResult } from '../services/treasuryTestRunner';
import { safesRepo, safeTransactionsRepo, cashTransactionsRepo, bankAccountsRepo } from '../repositories/TreasuryRepository';

export function useTreasury() {
  const [safes, setSafes] = useState<Safe[]>([]);
  const [transactions, setTransactions] = useState<SafeTransaction[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [reconciliationStatuses, setReconciliationStatuses] = useState<CashReconciliationStatus[]>([]);

  useEffect(() => {
    setLoading(true);
    const unsubSafes = safesRepo.subscribeAll((data) => {
      setSafes(data);
      setLoading(false);
    }, (err) => setError(err.message));

    const unsubTrx = safeTransactionsRepo.subscribeAll((data) => {
      setTransactions(data);
    });

    const unsubCashTrx = cashTransactionsRepo.subscribeAll((data) => {
      setCashTransactions(data);
    }, (err) => console.error('Cash ledger subscriber error:', err));

    const unsubBanks = bankAccountsRepo.subscribeAll((data) => {
      setBanks(data);
    });

    return () => {
      unsubSafes();
      unsubTrx();
      unsubCashTrx();
      unsubBanks();
    };
  }, []);

  // Compute reconciliation reports in real-time whenever safes or ledger transactions update
  useEffect(() => {
    if (safes.length > 0) {
      const reports = cashBalanceService.reconcileAllSafes(safes, cashTransactions);
      setReconciliationStatuses(reports);
    } else {
      setReconciliationStatuses([]);
    }
  }, [safes, cashTransactions]);

  const recordTransaction = useCallback(async (trx: Omit<SafeTransaction, 'id'>) => {
    try {
      setError(null);
      return await treasuryService.recordSafeTransaction(trx);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const recordCashTransaction = useCallback(async (trx: Omit<CashTransaction, 'id'>) => {
    try {
      setError(null);
      return await treasuryService.createCashTransaction(trx);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const runMigrationTests = useCallback(async () => {
    try {
      setError(null);
      const results = await runTreasuryMigrationTests();
      setTestResults(results);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    safes,
    transactions,
    cashTransactions,
    banks,
    loading,
    error,
    recordTransaction,
    recordCashTransaction,
    runMigrationTests,
    testResults,
    reconciliationStatuses
  };
}
