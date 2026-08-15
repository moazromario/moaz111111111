import { BaseRepository } from '../../shared/BaseRepository';
import { Safe, SafeTransaction, BankAccount, CashTransaction } from '../types';

export class SafesRepository extends BaseRepository<Safe> {
  constructor() {
    super('safes');
  }
}

export class SafeTransactionsRepository extends BaseRepository<SafeTransaction> {
  constructor() {
    super('safeTransactions');
  }
}

export class CashTransactionsRepository extends BaseRepository<CashTransaction> {
  constructor() {
    super('cashTransactions');
  }
}

export class BankAccountsRepository extends BaseRepository<BankAccount> {
  constructor() {
    super('banks');
  }
}

export const safesRepo = new SafesRepository();
export const safeTransactionsRepo = new SafeTransactionsRepository();
export const cashTransactionsRepo = new CashTransactionsRepository();
export const bankAccountsRepo = new BankAccountsRepository();
