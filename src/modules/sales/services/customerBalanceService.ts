import { Customer, CustomerLedgerEntry } from '../types';

export interface CustomerBalanceDetails {
  opening: number;
  sales: number;
  payments: number;
  returns: number;
  total: number;
}

export interface CustomerReconciliationStatus {
  customerId: string;
  customerName: string;
  legacyBalance: number;
  ledgerBalance: number;
  difference: number;
  status: 'PASS' | 'FAIL';
  details: CustomerBalanceDetails;
}

export class CustomerBalanceService {
  /**
   * Calculates dynamic balance for a customer from its ledger entries.
   * Receivable Balance = Opening Balance + Sales - Payments - Returns
   */
  calculateBalance(customerId: string, entries: CustomerLedgerEntry[]): CustomerBalanceDetails {
    const customerEntries = entries.filter(e => e.customerId === customerId);

    let opening = 0;
    let sales = 0;
    let payments = 0;
    let returns = 0;

    for (const entry of customerEntries) {
      const amount = Number(entry.amount) || 0;
      if (entry.type === 'OPENING') {
        opening += amount;
      } else if (entry.type === 'SALE') {
        sales += amount;
      } else if (entry.type === 'PAYMENT') {
        payments += amount;
      } else if (entry.type === 'RETURN') {
        returns += amount;
      } else if (entry.type === 'ADJUSTMENT') {
        if (entry.direction === 'in') {
          sales += amount; // Increases receivable
        } else {
          payments += amount; // Decreases receivable
        }
      }
    }

    const total = opening + sales - payments - returns;

    return {
      opening,
      sales,
      payments,
      returns,
      total
    };
  }

  /**
   * Reconciles a single customer's legacy cached balance against its dynamic ledger balance.
   */
  reconcileCustomerBalance(customer: Customer, entries: CustomerLedgerEntry[]): CustomerReconciliationStatus {
    const details = this.calculateBalance(customer.id!, entries);
    const legacyBalance = Number(customer.balance) || 0;
    const ledgerBalance = details.total;
    const difference = legacyBalance - ledgerBalance;

    return {
      customerId: customer.id!,
      customerName: customer.name,
      legacyBalance,
      ledgerBalance,
      difference,
      status: Math.abs(difference) < 0.01 ? 'PASS' : 'FAIL',
      details
    };
  }

  /**
   * Reconciles all customers and returns their statuses.
   */
  reconcileAllCustomers(customers: Customer[], entries: CustomerLedgerEntry[]): CustomerReconciliationStatus[] {
    return customers.map(customer => this.reconcileCustomerBalance(customer, entries));
  }
}

export const customerBalanceService = new CustomerBalanceService();
