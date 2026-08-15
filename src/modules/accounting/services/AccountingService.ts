import { journalService } from './JournalService';
import { postingService } from './PostingService';
import { reversalService } from './ReversalService';

export class AccountingService {
  get journal() { return journalService; }
  get posting() { return postingService; }
  get reversal() { return reversalService; }
}

export const accountingService = new AccountingService();
