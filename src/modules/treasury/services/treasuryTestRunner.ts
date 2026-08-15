import { treasuryService } from './TreasuryService';
import { cashBalanceService } from './cashBalanceService';
import { safesRepo } from '../repositories/TreasuryRepository';

export interface TestResult {
  testName: string;
  status: 'PASSED' | 'FAILED';
  message: string;
}

export async function runTreasuryMigrationTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const assertTest = (testName: string, evaluation: boolean, message: string) => {
    results.push({
      testName,
      status: evaluation ? 'PASSED' : 'FAILED',
      message
    });
  };

  try {
    // Test 1: Verify validation for non-existent safe
    try {
      await treasuryService.createCashTransaction({
        transactionNo: `TEST-TRX-1`,
        safeId: 'non-existent-safe-id-789',
        date: '2026-08-14',
        type: 'DEPOSIT',
        amount: 100,
        direction: 'in',
        referenceType: 'manual',
        description: 'اختبار خزينة غير موجودة',
        createdBy: 'SYSTEM_TEST'
      });
      assertTest('Validate Non-Existent Safe', false, 'Should have thrown error for non-existent safe.');
    } catch (err: any) {
      assertTest('Validate Non-Existent Safe', err.message.includes('غير موجودة'), `Passed. Prevented non-existent safe: ${err.message}`);
    }

    // Test 2: Verify validation for invalid amount <= 0
    try {
      await treasuryService.createCashTransaction({
        transactionNo: `TEST-TRX-2`,
        safeId: 'some-id',
        date: '2026-08-14',
        type: 'DEPOSIT',
        amount: -50,
        direction: 'in',
        referenceType: 'manual',
        description: 'مبلغ غير صالح',
        createdBy: 'SYSTEM_TEST'
      });
      assertTest('Validate Amount > 0', false, 'Should have thrown error for negative/zero amount.');
    } catch (err: any) {
      assertTest('Validate Amount > 0', err.message.includes('أكبر من صفر'), `Passed. Prevented invalid amount: ${err.message}`);
    }

    // Test 3: Verify authorization check (createdBy empty)
    try {
      await treasuryService.createCashTransaction({
        transactionNo: `TEST-TRX-3`,
        safeId: 'some-id',
        date: '2026-08-14',
        type: 'DEPOSIT',
        amount: 100,
        direction: 'in',
        referenceType: 'manual',
        description: 'بدون منشئ حقيقي',
        createdBy: ''
      });
      assertTest('Validate Creator Identity', false, 'Should have thrown error for empty creator.');
    } catch (err: any) {
      assertTest('Validate Creator Identity', err.message.includes('المنشئ مطلوب'), `Passed. Blocked empty creator identity: ${err.message}`);
    }

    // Test 4: Dynamic Ledger Balance integration flow on temporary safe
    const testSafe = await safesRepo.create({
      name: 'خزنة اختبار البنية المهاجرة',
      code: `TS-${Date.now()}`,
      balance: 1000,
      type: 'خزنة رئيسية'
    });

    try {
      // 1. Opening balance
      await treasuryService.createCashTransaction({
        transactionNo: `TX-OP-${Date.now()}`,
        safeId: testSafe.id!,
        date: '2026-08-14',
        type: 'OPENING',
        amount: 1000,
        direction: 'in',
        referenceType: 'manual',
        description: 'رصيد أول المدة للاختبار',
        createdBy: 'SYSTEM_TEST_SECURE'
      });

      // 2. Deposit
      await treasuryService.createCashTransaction({
        transactionNo: `TX-DEP-${Date.now()}`,
        safeId: testSafe.id!,
        date: '2026-08-14',
        type: 'DEPOSIT',
        amount: 500,
        direction: 'in',
        referenceType: 'manual',
        description: 'إيداع إضافي للاختبار',
        createdBy: 'SYSTEM_TEST_SECURE'
      });

      // 3. Withdrawal
      await treasuryService.createCashTransaction({
        transactionNo: `TX-WD-${Date.now()}`,
        safeId: testSafe.id!,
        date: '2026-08-14',
        type: 'WITHDRAWAL',
        amount: 300,
        direction: 'out',
        referenceType: 'manual',
        description: 'سحب مصروفات للاختبار',
        createdBy: 'SYSTEM_TEST_SECURE'
      });

      const allTxs = await treasuryService.createCashTransaction({
        transactionNo: `TX-WD2-${Date.now()}`,
        safeId: testSafe.id!,
        date: '2026-08-14',
        type: 'WITHDRAWAL',
        amount: 200,
        direction: 'out',
        referenceType: 'manual',
        description: 'سحب آخر',
        createdBy: 'SYSTEM_TEST_SECURE'
      });

      // We wrote: Opening 1000 + Deposit 500 - Withdrawal 300 - Withdrawal 200 = 1000 EGP.

      // Let's retrieve all cash transactions written
      const queryResults = await new Promise<any[]>((resolve) => {
        const unsub = cashTransactionsRepo.subscribeAll((data) => {
          resolve(data);
        }, () => resolve([]));
        unsub();
      });

      const details = cashBalanceService.calculateBalance(testSafe.id!, queryResults);

      assertTest(
        'Verify Ledger Calculation Accuracy',
        details.total === 1000,
        `Passed. Reconstructed dynamic ledger balance is correctly calculated: ${details.total} (Expected: 1000)`
      );

      const reconciled = cashBalanceService.reconcileSafeBalance(await safesRepo.getById(testSafe.id!) as any, queryResults);
      assertTest(
        'Verify Dual Read Validation Status',
        reconciled.status === 'PASS' && reconciled.difference === 0,
        `Passed. Reconciliation result: ${reconciled.status} with 0 difference.`
      );

    } finally {
      // Clean up test safe
      await safesRepo.delete(testSafe.id!);
      
      // Let's also delete related cash transactions to keep DB clean
      try {
        const queryResults = await new Promise<any[]>((resolve) => {
          const unsub = cashTransactionsRepo.subscribeAll((data) => {
            resolve(data);
          }, () => resolve([]));
          unsub();
        });
        const testSafeTxs = queryResults.filter(t => t.safeId === testSafe.id!);
        for (const tx of testSafeTxs) {
          if (tx.id) await cashTransactionsRepo.delete(tx.id);
        }
      } catch (err) {
        console.error('Test cleanup error:', err);
      }
    }

  } catch (globalErr: any) {
    results.push({
      testName: 'Global Test Suite Runner',
      status: 'FAILED',
      message: `Failed due to global exception: ${globalErr.message}`
    });
  }

  return results;
}

// Global repo access for query
import { cashTransactionsRepo } from '../repositories/TreasuryRepository';
