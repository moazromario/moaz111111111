import { safesRepo, safeTransactionsRepo, cashTransactionsRepo, bankAccountsRepo } from '../repositories/TreasuryRepository';
import { Safe, SafeTransaction, BankAccount, CashTransaction, CashTransactionType, CashTransactionReferenceType } from '../types';
import { validateSafeTransaction, validateCashTransaction } from '../schemas';
import { InsufficientFundsError, ValidationError } from '../../../core/errors/AppError';

export class TreasuryService {
  async getSafes(): Promise<Safe[]> {
    return await safesRepo.getAll();
  }

  async recordSafeTransaction(trx: Omit<SafeTransaction, 'id'>): Promise<SafeTransaction> {
    validateSafeTransaction(trx);

    const safe = await safesRepo.getById(trx.safeId);
    if (!safe) throw new Error('الخزينة غير موجودة.');

    let newBalance = safe.balance || 0;
    const amount = Number(trx.amount) || 0;
    
    // Determine direction and type for modern ledger
    let direction: 'in' | 'out' = 'out';
    let cashType: CashTransactionType = 'WITHDRAWAL';
    let refType: CashTransactionReferenceType = 'manual';

    const legacyType = trx.type || trx.transactionType || 'مصروفات';

    if (['إيداع', 'مبيعات', 'سداد قرض', 'إيرادات', 'أخرى'].includes(legacyType as string)) {
      direction = 'in';
      cashType = 'DEPOSIT';
      if (legacyType === 'مبيعات') refType = 'sale';
    } else if (['سحب', 'مصروفات', 'مشتريات', 'رواتب', 'قرض شخصي', 'جرد'].includes(legacyType as string)) {
      direction = 'out';
      cashType = 'WITHDRAWAL';
      if (legacyType === 'مشتريات') refType = 'purchase';
      if (legacyType === 'رواتب') refType = 'payroll';
      if (legacyType === 'جرد') refType = 'adjustment';
    } else if (legacyType === 'تحويل') {
      // For transfer, default to withdrawal on source, or handle custom direction if specified
      direction = 'out';
      cashType = 'TRANSFER_OUT';
      refType = 'transfer';
    }

    if (direction === 'in') {
      newBalance += amount;
    } else {
      if (newBalance < amount) {
        throw new InsufficientFundsError(safe.name, newBalance, amount);
      }
      newBalance -= amount;
    }

    // Update legacy Safe record
    await safesRepo.update(safe.id!, { 
      balance: newBalance,
      legacyBalance: newBalance,
      currentBalance: newBalance
    });

    // Create legacy record
    const createdLegacy = await safeTransactionsRepo.create(trx);

    // Create dual modern ledger record
    try {
      await cashTransactionsRepo.create({
        transactionNo: `LEDGER-TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        safeId: trx.safeId,
        date: trx.date ? trx.date.split('T')[0] : new Date().toISOString().split('T')[0],
        type: cashType,
        amount: amount,
        direction: direction,
        referenceType: refType,
        referenceId: createdLegacy.id || undefined,
        description: trx.description || `حركة خزينة ثنائية: ${legacyType}`,
        createdBy: trx.createdBy || 'المحاسب',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error creating dual cash transaction:', err);
      // Fail silently for ledger during legacy writes to avoid blocking legacy UI
    }

    return createdLegacy;
  }

  async createCashTransaction(trx: Omit<CashTransaction, 'id'>): Promise<CashTransaction> {
    validateCashTransaction(trx);

    const safe = await safesRepo.getById(trx.safeId);
    if (!safe) throw new ValidationError('الخزينة غير موجودة.');

    const amount = Number(trx.amount) || 0;
    let newBalance = safe.balance || 0;

    if (trx.direction === 'in') {
      newBalance += amount;
    } else {
      if (trx.type !== 'OPENING' && newBalance < amount) {
        throw new InsufficientFundsError(safe.name, newBalance, amount);
      }
      newBalance -= amount;
    }

    // Update safe balances
    await safesRepo.update(safe.id!, {
      balance: newBalance,
      legacyBalance: newBalance,
      currentBalance: newBalance
    });

    // Also write a dual legacy SafeTransaction so that old reports remain in sync!
    try {
      let legacyType: SafeTransaction['type'] = 'أخرى';
      if (trx.type === 'DEPOSIT') legacyType = 'إيداع';
      else if (trx.type === 'WITHDRAWAL') legacyType = 'سحب';
      else if (trx.type === 'TRANSFER_IN' || trx.type === 'TRANSFER_OUT') legacyType = 'تحويل';
      else if (trx.type === 'OPENING') legacyType = 'إيداع';
      else if (trx.type === 'ADJUSTMENT') legacyType = 'جرد';

      await safeTransactionsRepo.create({
        safeId: trx.safeId,
        date: trx.date,
        type: legacyType,
        amount: trx.amount,
        description: trx.description,
        createdBy: trx.createdBy,
        category: trx.referenceType === 'purchase' ? 'مشتريات' : trx.referenceType === 'sale' ? 'مبيعات' : 'أخرى'
      });
    } catch (err) {
      console.error('Failed to write dual SafeTransaction:', err);
    }

    return await cashTransactionsRepo.create(trx);
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    return await bankAccountsRepo.getAll();
  }
}

export const treasuryService = new TreasuryService();
