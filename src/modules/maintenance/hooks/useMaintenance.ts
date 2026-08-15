import { useState, useEffect, useCallback } from 'react';
import { MaintenanceOrder } from '../types';
import { maintenanceService } from '../services/MaintenanceService';
import { maintenanceOrdersRepo } from '../repositories/MaintenanceRepository';

export function useMaintenance() {
  const [orders, setOrders] = useState<MaintenanceOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = maintenanceOrdersRepo.subscribeAll((data) => {
      setOrders(data);
      setLoading(false);
    }, (err) => setError(err.message));

    return () => unsub();
  }, []);

  const createOrder = useCallback(async (order: Omit<MaintenanceOrder, 'id'>) => {
    try {
      setError(null);
      return await maintenanceService.createOrder(order);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: MaintenanceOrder['status'], cost?: number) => {
    try {
      setError(null);
      await maintenanceService.updateOrderStatus(id, status, cost);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus
  };
}
