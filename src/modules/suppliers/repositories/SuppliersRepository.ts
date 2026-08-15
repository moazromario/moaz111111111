import { BaseRepository } from '../../shared/BaseRepository';
import { Supplier, SupplierLedgerEntry } from '../types';

export class SuppliersRepository extends BaseRepository<Supplier> {
  constructor() {
    super('suppliers');
  }
}

export class SupplierLedgerRepository extends BaseRepository<SupplierLedgerEntry> {
  constructor() {
    super('supplierLedger');
  }
}

export const suppliersRepo = new SuppliersRepository();
export const supplierLedgerRepo = new SupplierLedgerRepository();

