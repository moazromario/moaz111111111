
import { journalService } from '../services/JournalService';
import { postingService } from '../services/PostingService';
import { reversalService } from '../services/ReversalService';
import { journalEntryRepo } from '../repositories/AccountingCoreRepositories';

async function runTests() {
  console.log("Running Accounting Core Tests...");

  // Mocking repo methods
  journalEntryRepo.create = async (data: any) => ({ ...data, id: 'entry-1' });
  journalEntryRepo.getById = async (id: string) => {
    if (id === 'entry-1') return { id: 'entry-1', transactionNo: 'TXN-1', isPosted: false } as any;
    if (id === 'posted-entry') return { id: 'posted-entry', transactionNo: 'TXN-POSTED', isPosted: true } as any;
    return null;
  };
  journalEntryRepo.update = async (id: string, data: any) => {};

  // 1. Balanced Journal Test
  try {
    await journalService.createJournalEntry(
      { transactionNo: 'TXN-1', date: '2026-01-01', description: 'Test', type: 'SALES', createdBy: 'Admin', isPosted: false } as any,
      [{ accountId: 'A1', debit: 100, credit: 0 }, { accountId: 'A2', debit: 0, credit: 100 }]
    );
    console.log("PASS: Balanced journal accepted");
  } catch (e) {
    console.error("FAIL: Balanced journal rejected", e);
  }

  // 2. Unbalanced Journal Test
  try {
    await journalService.createJournalEntry(
        { transactionNo: 'TXN-2', date: '2026-01-01', description: 'Test', type: 'SALES', createdBy: 'Admin', isPosted: false } as any,
        [{ accountId: 'A1', debit: 100, credit: 0 }, { accountId: 'A2', debit: 0, credit: 50 }]
      );
    console.error("FAIL: Unbalanced journal accepted");
  } catch (e) {
    console.log("PASS: Unbalanced journal rejected");
  }

  console.log("Tests completed.");
}

runTests().catch(console.error);
