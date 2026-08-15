import { useState, useEffect, useCallback } from 'react';
import { PurchaseInvoice, SupplierPayment } from '../types';
import { purchasingService } from '../services/PurchasingService';
import { purchasesRepo, supplierPaymentsRepo } from '../repositories/PurchasingRepository';

export function usePurchasing() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubInvoices = purchasesRepo.subscribeAll((data) => {
      setInvoices(data);
      setLoading(false);
    }, (err) => setError(err.message));

    const unsubPayments = supplierPaymentsRepo.subscribeAll((data) => {
      setPayments(data);
    });

    return () => {
      unsubInvoices();
      unsubPayments();
    };
  }, []);

  const createInvoice = useCallback(async (invoice: Omit<PurchaseInvoice, 'id'>) => {
    try {
      setError(null);
      return await purchasingService.createInvoice(invoice);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createPayment = useCallback(async (payment: Omit<SupplierPayment, 'id'>) => {
    try {
      setError(null);
      return await purchasingService.createPayment(payment);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    invoices,
    payments,
    loading,
    error,
    createInvoice,
    createPayment
  };
}
