import { customersRepo, customerLedgerRepo, salesOrdersRepo, deliveryReceiptsRepo } from '../repositories/SalesRepository';
import { Customer, CustomerLedgerEntry, SalesOrder, DeliveryReceipt } from '../types';
import { validateCustomer, validateCustomerLedgerEntry, validateSalesOrder } from '../schemas';

export class SalesService {
  async getCustomers(): Promise<Customer[]> {
    return await customersRepo.getAll();
  }

  async addCustomer(cust: Omit<Customer, 'id'>): Promise<Customer> {
    validateCustomer(cust);
    
    const openingBalanceVal = Number(cust.openingBalance) || 0;

    const created = await customersRepo.create({
      ...cust,
      balance: openingBalanceVal,
      legacyBalance: openingBalanceVal,
      currentBalance: openingBalanceVal,
    });

    try {
      // Create automatic OPENING entry in dynamic customer ledger
      await customerLedgerRepo.create({
        transactionNo: `LEDGER-CUST-OP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        customerId: created.id!,
        date: new Date().toISOString().split('T')[0],
        type: 'OPENING',
        amount: openingBalanceVal,
        direction: 'in', // Increases receivable
        description: 'رصيد أول المدة الافتتاحي للعميل',
        createdBy: 'المحاسب',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to create automatic customer opening ledger entry:', err);
    }

    return created;
  }

  async createLedgerEntry(entry: Omit<CustomerLedgerEntry, 'id'>): Promise<CustomerLedgerEntry> {
    validateCustomerLedgerEntry(entry);

    const customer = await customersRepo.getById(entry.customerId);
    if (!customer) throw new Error('العميل غير موجود.');

    const amount = Number(entry.amount) || 0;
    let newBalance = Number(customer.balance) || 0;

    if (entry.direction === 'in') {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }

    // Update customer legacy caches
    await customersRepo.update(customer.id!, {
      balance: newBalance,
      legacyBalance: newBalance,
      currentBalance: newBalance
    });

    return await customerLedgerRepo.create(entry);
  }

  async updateBalance(id: string, delta: number): Promise<void> {
    const cust = await customersRepo.getById(id);
    if (!cust) throw new Error('العميل غير موجود.');
    const newBal = (Number(cust.balance) || 0) + delta;

    await customersRepo.update(id, {
      balance: newBal,
      legacyBalance: newBal,
      currentBalance: newBal
    });

    try {
      await customerLedgerRepo.create({
        transactionNo: `LEDGER-CUST-ADJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        customerId: id,
        date: new Date().toISOString().split('T')[0],
        type: 'ADJUSTMENT',
        amount: Math.abs(delta),
        direction: delta >= 0 ? 'in' : 'out',
        description: 'تسوية رصيد يدوية للعميل',
        createdBy: 'المحاسب',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to write adjustment ledger entry for updateBalance:', err);
    }
  }

  async createOrder(order: Omit<SalesOrder, 'id'>): Promise<SalesOrder> {
    validateSalesOrder(order);
    return await salesOrdersRepo.create(order);
  }

  async getOrders(): Promise<SalesOrder[]> {
    return await salesOrdersRepo.getAll();
  }

  async createDeliveryReceipt(receipt: Omit<DeliveryReceipt, 'id'>): Promise<DeliveryReceipt> {
    return await deliveryReceiptsRepo.create(receipt);
  }
}

export const salesService = new SalesService();
