import { Safe, CashTransaction } from '../types';

export interface CashBalanceDetails {
  opening: number;
  receipts: number;
  payments: number;
  total: number;
}

export interface CashReconciliationStatus {
  safeId: string;
  safeName: string;
  legacyBalance: number;
  ledgerBalance: number;
  difference: number;
  status: 'PASS' | 'FAIL';
  details: CashBalanceDetails;
}

export class CashBalanceService {
  /**
   * Calculates dynamic balance for a safe from its ledger cash transactions.
   * Cash Balance = Opening + Receipts - Payments
   */
  calculateBalance(safeId: string, transactions: CashTransaction[]): CashBalanceDetails {
    const safeTx = transactions.filter(t => t.safeId === safeId);

    let opening = 0;
    let receipts = 0;
    let payments = 0;

    for (const tx of safeTx) {
      const amount = Number(tx.amount) || 0;
      if (tx.type === 'OPENING') {
        opening += amount;
      } else if (tx.direction === 'in') {
        receipts += amount;
      } else if (tx.direction === 'out') {
        payments += amount;
      }
    }

    const total = opening + receipts - payments;

    return {
      opening,
      receipts,
      payments,
      total
    };
  }

  /**
   * Reconciles a single safe's legacy cached balance against its dynamic ledger balance.
   */
  reconcileSafeBalance(safe: Safe, transactions: CashTransaction[]): CashReconciliationStatus {
    const details = this.calculateBalance(safe.id!, transactions);
    const legacyBalance = Number(safe.balance) || 0;
    const ledgerBalance = details.total;
    const difference = legacyBalance - ledgerBalance;

    return {
      safeId: safe.id!,
      safeName: safe.name,
      legacyBalance,
      ledgerBalance,
      difference,
      status: Math.abs(difference) < 0.01 ? 'PASS' : 'FAIL',
      details
    };
  }

  /**
   * Reconciles all safes and returns their status.
   */
  reconcileAllSafes(safes: Safe[], transactions: CashTransaction[]): CashReconciliationStatus[] {
    return safes.map(safe => this.reconcileSafeBalance(safe, transactions));
  }
}

export const cashBalanceService = new CashBalanceService();
