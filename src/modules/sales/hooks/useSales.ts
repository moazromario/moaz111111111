import { useState, useEffect, useCallback } from 'react';
import { Customer, CustomerLedgerEntry, SalesOrder, DeliveryReceipt } from '../types';
import { salesService } from '../services/SalesService';
import { customersRepo, customerLedgerRepo, salesOrdersRepo, deliveryReceiptsRepo } from '../repositories/SalesRepository';
import { customerBalanceService, CustomerReconciliationStatus } from '../services/customerBalanceService';

export function useSales() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLedger, setCustomerLedger] = useState<CustomerLedgerEntry[]>([]);
  const [reconciliationStatuses, setReconciliationStatuses] = useState<CustomerReconciliationStatus[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [receipts, setReceipts] = useState<DeliveryReceipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubCustomers = customersRepo.subscribeAll((data) => {
      setCustomers(data);
    }, (err) => setError(err.message));

    const unsubLedger = customerLedgerRepo.subscribeAll((data) => {
      setCustomerLedger(data);
      setLoading(false);
    }, (err) => console.error('Customer ledger subscribe error:', err));

    const unsubOrders = salesOrdersRepo.subscribeAll((data) => {
      setOrders(data);
    });

    const unsubReceipts = deliveryReceiptsRepo.subscribeAll((data) => {
      setReceipts(data);
    });

    return () => {
      unsubCustomers();
      unsubLedger();
      unsubOrders();
      unsubReceipts();
    };
  }, []);

  // Compute reconciliation reports in real-time whenever customers or ledger entries update
  useEffect(() => {
    if (customers.length > 0) {
      const reports = customerBalanceService.reconcileAllCustomers(customers, customerLedger);
      setReconciliationStatuses(reports);
    } else {
      setReconciliationStatuses([]);
    }
  }, [customers, customerLedger]);

  const addCustomer = useCallback(async (cust: Omit<Customer, 'id'>) => {
    try {
      setError(null);
      return await salesService.addCustomer(cust);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const addLedgerEntry = useCallback(async (entry: Omit<CustomerLedgerEntry, 'id'>) => {
    try {
      setError(null);
      return await salesService.createLedgerEntry(entry);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createOrder = useCallback(async (order: Omit<SalesOrder, 'id'>) => {
    try {
      setError(null);
      return await salesService.createOrder(order);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    customers,
    customerLedger,
    reconciliationStatuses,
    orders,
    receipts,
    loading,
    error,
    addCustomer,
    addLedgerEntry,
    createOrder
  };
}
