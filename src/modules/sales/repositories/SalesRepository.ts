import { BaseRepository } from '../../shared/BaseRepository';
import { Customer, CustomerLedgerEntry, SalesOrder, DeliveryReceipt } from '../types';

export class CustomersRepository extends BaseRepository<Customer> {
  constructor() {
    super('customers');
  }
}

export class CustomerLedgerRepository extends BaseRepository<CustomerLedgerEntry> {
  constructor() {
    super('customerLedger');
  }
}

export class SalesOrdersRepository extends BaseRepository<SalesOrder> {
  constructor() {
    super('salesOrders');
  }
}

export class DeliveryReceiptsRepository extends BaseRepository<DeliveryReceipt> {
  constructor() {
    super('deliveryReceipts');
  }
}

export const customersRepo = new CustomersRepository();
export const customerLedgerRepo = new CustomerLedgerRepository();
export const salesOrdersRepo = new SalesOrdersRepository();
export const deliveryReceiptsRepo = new DeliveryReceiptsRepository();
