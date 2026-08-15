import { useState, useEffect, useCallback } from 'react';
import { Supplier, SupplierLedgerEntry } from '../types';
import { suppliersService } from '../services/SuppliersService';
import { suppliersRepo, supplierLedgerRepo } from '../repositories/SuppliersRepository';
import { supplierBalanceService, SupplierReconciliationStatus } from '../services/supplierBalanceService';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierLedger, setSupplierLedger] = useState<SupplierLedgerEntry[]>([]);
  const [reconciliationStatuses, setReconciliationStatuses] = useState<SupplierReconciliationStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    const unsubSuppliers = suppliersRepo.subscribeAll((data) => {
      setSuppliers(data);
    }, (err) => setError(err.message));

    const unsubLedger = supplierLedgerRepo.subscribeAll((data) => {
      setSupplierLedger(data);
      setLoading(false);
    }, (err) => console.error('Supplier ledger subscribe error:', err));

    return () => {
      unsubSuppliers();
      unsubLedger();
    };
  }, []);

  // Compute reconciliation reports in real-time whenever suppliers or ledger entries update
  useEffect(() => {
    if (suppliers.length > 0) {
      const reports = supplierBalanceService.reconcileAllSuppliers(suppliers, supplierLedger);
      setReconciliationStatuses(reports);
    } else {
      setReconciliationStatuses([]);
    }
  }, [suppliers, supplierLedger]);

  const addSupplier = useCallback(async (supplier: Omit<Supplier, 'id'>) => {
    try {
      setError(null);
      return await suppliersService.addSupplier(supplier);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const addLedgerEntry = useCallback(async (entry: Omit<SupplierLedgerEntry, 'id'>) => {
    try {
      setError(null);
      return await suppliersService.createLedgerEntry(entry);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    suppliers,
    supplierLedger,
    reconciliationStatuses,
    loading,
    error,
    addSupplier,
    addLedgerEntry
  };
}

