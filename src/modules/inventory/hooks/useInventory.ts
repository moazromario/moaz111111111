import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, StockIssuance, Warehouse, StockTransaction } from '../types';
import { inventoryService } from '../services/InventoryService';
import { inventoryBalanceService } from '../services/inventoryBalanceService';
import { runInventoryMigrationTests } from '../services/inventoryTestRunner';
import { inventoryItemsRepo, stockIssuanceRepo, warehouseRepo, stockTransactionsRepo } from '../repositories/InventoryRepository';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [issuances, setIssuances] = useState<StockIssuance[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubItems = inventoryItemsRepo.subscribeAll((data) => {
      setItems(data);
      setLoading(false);
    }, (err) => setError(err.message));

    const unsubIssuances = stockIssuanceRepo.subscribeAll((data) => {
      setIssuances(data);
    });

    const unsubWarehouses = warehouseRepo.subscribeAll((data) => {
      setWarehouses(data);
    });

    const unsubTransactions = stockTransactionsRepo.subscribeAll((data) => {
      setStockTransactions(data);
    });

    return () => {
      unsubItems();
      unsubIssuances();
      unsubWarehouses();
      unsubTransactions();
    };
  }, []);

  const addItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    try {
      setError(null);
      return await inventoryService.addItem(item);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createIssuance = useCallback(async (issuance: Omit<StockIssuance, 'id'>) => {
    try {
      setError(null);
      return await inventoryService.createIssuance(issuance);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const addStockTransaction = useCallback(async (tx: Omit<StockTransaction, 'id'>) => {
    try {
      setError(null);
      return await inventoryService.addStockTransaction(tx);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createStockTransactionLedger = useCallback(async (tx: Omit<StockTransaction, 'id'>) => {
    try {
      setError(null);
      return await inventoryService.createStockTransaction(tx);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const recalculateItemBalance = useCallback(async (itemId: string) => {
    try {
      setError(null);
      return await inventoryService.recalculateItemBalance(itemId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getDualReadStatus = useCallback(async (itemId: string) => {
    try {
      setError(null);
      return await inventoryService.getDualReadStatus(itemId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getAllDualReadStatuses = useCallback(async () => {
    try {
      setError(null);
      return await inventoryService.getAllDualReadStatuses();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const generateReconciliationReport = useCallback(async () => {
    try {
      setError(null);
      return await inventoryBalanceService.generateReconciliationReport();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const verifyAndSyncItem = useCallback(async (itemId: string) => {
    try {
      setError(null);
      return await inventoryBalanceService.verifyAndSyncItem(itemId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const runMigrationTests = useCallback(async () => {
    try {
      setError(null);
      return await runInventoryMigrationTests();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    items,
    issuances,
    warehouses,
    stockTransactions,
    loading,
    error,
    addItem,
    createIssuance,
    addStockTransaction,
    createStockTransactionLedger,
    recalculateItemBalance,
    getDualReadStatus,
    getAllDualReadStatuses,
    generateReconciliationReport,
    verifyAndSyncItem,
    runMigrationTests
  };
}
