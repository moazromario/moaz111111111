import { journalEntryRepo } from '../repositories/AccountingCoreRepositories';
import { WorkflowService } from './WorkflowService';

export class PostingService {
  async postEntry(entryId: string): Promise<void> {
    const entry = await journalEntryRepo.getById(entryId);
    if (!entry) throw new Error('القيد غير موجود.');
    
    // Check status
    WorkflowService.validateTransition(entry.status, 'POSTED');

    // Mark as posted
    await journalEntryRepo.update(entryId, { isPosted: true, status: 'POSTED' });
  }
}

export const postingService = new PostingService();
