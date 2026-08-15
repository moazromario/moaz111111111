import { journalEntryRepo, journalLineRepo } from '../repositories/AccountingCoreRepositories';
import { JournalEntry, JournalLine } from '../../../types';

export class JournalService {
  async createJournalEntry(entry: Omit<JournalEntry, 'id'>, lines: Omit<JournalLine, 'id' | 'entryId'>[]): Promise<JournalEntry> {
    // 1. Validate Double Entry
    const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`القيد غير متوازن: إجمالي المدين (${totalDebit}) لا يساوي إجمالي الدائن (${totalCredit})`);
    }

    // 2. Create Entry
    const savedEntry = await journalEntryRepo.create(entry);

    // 3. Create Lines
    const linesWithEntryId = lines.map(line => ({
      ...line,
      entryId: savedEntry.id
    }));

    await Promise.all(linesWithEntryId.map(line => journalLineRepo.create(line)));

    return savedEntry;
  }
}

export const journalService = new JournalService();
