import { suppliersRepo, supplierLedgerRepo } from '../repositories/SuppliersRepository';
import { Supplier, SupplierLedgerEntry } from '../types';
import { validateSupplier, validateSupplierLedgerEntry } from '../schemas';

export class SuppliersService {
  async getSuppliers(): Promise<Supplier[]> {
    return await suppliersRepo.getAll();
  }

  async addSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    validateSupplier(supplier);
    
    const openingBalanceVal = Number(supplier.openingBalance) || 0;
    
    const created = await suppliersRepo.create({
      ...supplier,
      balance: openingBalanceVal,
      legacyBalance: openingBalanceVal,
      currentBalance: openingBalanceVal,
    });

    try {
      // Create automatic OPENING entry in dynamic supplier ledger
      await supplierLedgerRepo.create({
        transactionNo: `LEDGER-SUP-OP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        supplierId: created.id!,
        date: new Date().toISOString().split('T')[0],
        type: 'OPENING',
        amount: openingBalanceVal,
        direction: 'in', // Increases payable
        description: 'رصيد أول المدة الافتتاحي للمورد',
        createdBy: 'المحاسب',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to create automatic supplier opening ledger entry:', err);
    }

    return created;
  }

  async createLedgerEntry(entry: Omit<SupplierLedgerEntry, 'id'>): Promise<SupplierLedgerEntry> {
    validateSupplierLedgerEntry(entry);

    const supplier = await suppliersRepo.getById(entry.supplierId);
    if (!supplier) throw new Error('المورد غير موجود.');

    const amount = Number(entry.amount) || 0;
    let newBalance = Number(supplier.balance) || 0;

    if (entry.direction === 'in') {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }

    // Update supplier legacy caches
    await suppliersRepo.update(supplier.id!, {
      balance: newBalance,
      legacyBalance: newBalance,
      currentBalance: newBalance
    });

    return await supplierLedgerRepo.create(entry);
  }

  async updateBalance(id: string, delta: number): Promise<void> {
    const supp = await suppliersRepo.getById(id);
    if (!supp) throw new Error('المورد غير موجود.');
    const newBal = (Number(supp.balance) || 0) + delta;
    
    await suppliersRepo.update(id, { 
      balance: newBal,
      legacyBalance: newBal,
      currentBalance: newBal
    });

    try {
      await supplierLedgerRepo.create({
        transactionNo: `LEDGER-SUP-ADJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        supplierId: id,
        date: new Date().toISOString().split('T')[0],
        type: 'ADJUSTMENT',
        amount: Math.abs(delta),
        direction: delta >= 0 ? 'in' : 'out',
        description: 'تسوية رصيد يدوية',
        createdBy: 'المحاسب',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to write adjustment ledger entry for updateBalance:', err);
    }
  }
}

export const suppliersService = new SuppliersService();

