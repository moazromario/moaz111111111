import { BaseRepository } from '../../shared/BaseRepository';
import { PurchaseInvoice, SupplierPayment } from '../types';

export class PurchaseInvoicesRepository extends BaseRepository<PurchaseInvoice> {
  constructor() {
    super('purchases');
  }
}

export class SupplierPaymentsRepository extends BaseRepository<SupplierPayment> {
  constructor() {
    super('supplierPayments');
  }
}

export const purchasesRepo = new PurchaseInvoicesRepository();
export const supplierPaymentsRepo = new SupplierPaymentsRepository();
