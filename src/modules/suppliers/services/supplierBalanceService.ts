import { Supplier, SupplierLedgerEntry } from '../types';

export interface SupplierBalanceDetails {
  opening: number;
  purchases: number;
  payments: number;
  returns: number;
  total: number;
}

export interface SupplierReconciliationStatus {
  supplierId: string;
  supplierName: string;
  legacyBalance: number;
  ledgerBalance: number;
  difference: number;
  status: 'PASS' | 'FAIL';
  details: SupplierBalanceDetails;
}

export class SupplierBalanceService {
  /**
   * Calculates dynamic balance for a supplier from its ledger entries.
   * Payable Balance = Opening Balance + Purchases - Payments - Returns
   */
  calculateBalance(supplierId: string, entries: SupplierLedgerEntry[]): SupplierBalanceDetails {
    const supplierEntries = entries.filter(e => e.supplierId === supplierId);

    let opening = 0;
    let purchases = 0;
    let payments = 0;
    let returns = 0;

    for (const entry of supplierEntries) {
      const amount = Number(entry.amount) || 0;
      if (entry.type === 'OPENING') {
        opening += amount;
      } else if (entry.type === 'PURCHASE') {
        purchases += amount;
      } else if (entry.type === 'PAYMENT') {
        payments += amount;
      } else if (entry.type === 'RETURN') {
        returns += amount;
      } else if (entry.type === 'ADJUSTMENT') {
        if (entry.direction === 'in') {
          purchases += amount;
        } else {
          payments += amount;
        }
      }
    }

    const total = opening + purchases - payments - returns;

    return {
      opening,
      purchases,
      payments,
      returns,
      total
    };
  }

  /**
   * Reconciles a single supplier's legacy cached balance against its dynamic ledger balance.
   */
  reconcileSupplierBalance(supplier: Supplier, entries: SupplierLedgerEntry[]): SupplierReconciliationStatus {
    const details = this.calculateBalance(supplier.id!, entries);
    const legacyBalance = Number(supplier.balance) || 0;
    const ledgerBalance = details.total;
    const difference = legacyBalance - ledgerBalance;

    return {
      supplierId: supplier.id!,
      supplierName: supplier.name,
      legacyBalance,
      ledgerBalance,
      difference,
      status: Math.abs(difference) < 0.01 ? 'PASS' : 'FAIL',
      details
    };
  }

  /**
   * Reconciles all suppliers and returns their statuses.
   */
  reconcileAllSuppliers(suppliers: Supplier[], entries: SupplierLedgerEntry[]): SupplierReconciliationStatus[] {
    return suppliers.map(supplier => this.reconcileSupplierBalance(supplier, entries));
  }
}

export const supplierBalanceService = new SupplierBalanceService();
