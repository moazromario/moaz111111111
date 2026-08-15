import { journalEntryRepo, journalLineRepo } from '../repositories/AccountingCoreRepositories';
import { journalService } from './JournalService';
import { WorkflowService } from './WorkflowService';

export class ReversalService {
  async cancelEntry(entryId: string): Promise<void> {
    const entry = await journalEntryRepo.getById(entryId);
    if (!entry) throw new Error('القيد غير موجود.');
    WorkflowService.validateTransition(entry.status, 'CANCELLED');
    await journalEntryRepo.update(entryId, { status: 'CANCELLED' });
  }

  async reverseEntry(entryId: string, reason: string): Promise<string> {
    const originalEntry = await journalEntryRepo.getById(entryId);
    if (!originalEntry || originalEntry.status !== 'CANCELLED') throw new Error('لا يمكن عكس قيد لم يتم إلغاؤه.');

    const originalLines = await journalLineRepo.getByEntryId(entryId);

    // Create reversal entry
    const reversalEntry = {
      transactionNo: `REV-${originalEntry.transactionNo}`,
      date: new Date().toISOString().split('T')[0],
      description: `عكس القيد ${originalEntry.transactionNo}: ${reason}`,
      type: originalEntry.type,
      referenceId: entryId,
      createdBy: 'المحاسب',
      createdAt: new Date().toISOString(),
      status: 'REVERSAL',
      isPosted: true // Reversal entries are posted immediately upon creation
    } as any;

    // Create reversed lines
    const reversedLines = originalLines.map(line => ({
      accountId: line.accountId,
      debit: line.credit,
      credit: line.debit,
      description: `عكس قيد: ${line.description || ''}`,
      costCenterId: line.costCenterId
    }));

    const savedEntry = await journalService.createJournalEntry(reversalEntry, reversedLines);
    
    // Update original entry status
    await journalEntryRepo.update(entryId, { status: 'REVERSAL' });

    return savedEntry.id;
  }
}

export const reversalService = new ReversalService();
