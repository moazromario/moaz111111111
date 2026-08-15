import { BaseRepository } from '../../shared/BaseRepository';
import { ChartOfAccount, JournalVoucher, CostCenter } from '../types';

export class ChartOfAccountsRepository extends BaseRepository<ChartOfAccount> {
  constructor() {
    super('chartOfAccounts');
  }

  async findByCode(code: string): Promise<ChartOfAccount | null> {
    const results = await this.findWhere('code', '==', code);
    return results.length > 0 ? results[0] : null;
  }
}

export class JournalVoucherRepository extends BaseRepository<JournalVoucher> {
  constructor() {
    super('journalEntries');
  }

  async findByReference(refType: string, refId: string): Promise<JournalVoucher[]> {
    try {
      const all = await this.getAll();
      return all.filter(v => v.referenceType === refType && v.referenceId === refId);
    } catch {
      return [];
    }
  }
}

export class CostCentersRepository extends BaseRepository<CostCenter> {
  constructor() {
    super('costCenters');
  }
}

export const chartOfAccountsRepo = new ChartOfAccountsRepository();
export const journalVoucherRepo = new JournalVoucherRepository();
export const costCentersRepo = new CostCentersRepository();
