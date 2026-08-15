import { inventoryService } from './InventoryService';
import { inventoryBalanceService } from './inventoryBalanceService';
import { inventoryItemsRepo } from '../repositories/InventoryRepository';

export interface TestResult {
  testName: string;
  status: 'PASSED' | 'FAILED';
  message: string;
}

export async function runInventoryMigrationTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Create helper to push results
  const assertTest = (testName: string, evaluation: boolean, message: string) => {
    results.push({
      testName,
      status: evaluation ? 'PASSED' : 'FAILED',
      message
    });
  };

  try {
    // Test 1: Verify validation for non-existent item
    try {
      await inventoryService.createStockTransaction({
        transactionNo: `TEST-TX-1`,
        date: '2026-08-14',
        itemId: 'non-existent-item-id-123',
        warehouseId: 'default',
        transactionType: 'PURCHASE_RECEIPT',
        quantity: 10,
        unitCost: 15,
        totalCost: 150,
        direction: 'in',
        referenceType: 'manual',
        createdBy: 'TEST_RUNNER'
      });
      assertTest('Validate Non-Existent Item', false, 'Should have thrown a validation error for non-existent item.');
    } catch (err: any) {
      assertTest('Validate Non-Existent Item', err.message.includes('غير موجود'), `Passed. Prevented creation for non-existent item: ${err.message}`);
    }

    // Test 2: Verify validation for invalid quantity <= 0
    try {
      await inventoryService.createStockTransaction({
        transactionNo: `TEST-TX-2`,
        date: '2026-08-14',
        itemId: 'some-item-id',
        warehouseId: 'default',
        transactionType: 'PURCHASE_RECEIPT',
        quantity: 0,
        unitCost: 15,
        totalCost: 0,
        direction: 'in',
        referenceType: 'manual',
        createdBy: 'TEST_RUNNER'
      });
      assertTest('Validate Quantity > 0', false, 'Should have thrown error for quantity <= 0.');
    } catch (err: any) {
      assertTest('Validate Quantity > 0', err.message.includes('أكبر من صفر'), `Passed. Prevented non-positive quantity: ${err.message}`);
    }

    // Test 3: Verify validation for invalid unit cost < 0
    try {
      await inventoryService.createStockTransaction({
        transactionNo: `TEST-TX-3`,
        date: '2026-08-14',
        itemId: 'some-item-id',
        warehouseId: 'default',
        transactionType: 'PURCHASE_RECEIPT',
        quantity: 5,
        unitCost: -10,
        totalCost: -50,
        direction: 'in',
        referenceType: 'manual',
        createdBy: 'TEST_RUNNER'
      });
      assertTest('Validate Unit Cost >= 0', false, 'Should have thrown error for negative cost.');
    } catch (err: any) {
      assertTest('Validate Unit Cost >= 0', err.message.includes('بالسالب'), `Passed. Prevented negative unit cost: ${err.message}`);
    }

    // Test 4: Verify authorization checks (createdBy verification)
    try {
      await inventoryService.createStockTransaction({
        transactionNo: `TEST-TX-4`,
        date: '2026-08-14',
        itemId: 'some-item',
        warehouseId: 'default',
        transactionType: 'PURCHASE_RECEIPT',
        quantity: 5,
        unitCost: 10,
        totalCost: 50,
        direction: 'in',
        referenceType: 'manual',
        createdBy: '' // Empty creator
      });
      assertTest('Validate Authorization', false, 'Should have thrown error for empty creator.');
    } catch (err: any) {
      assertTest('Validate Authorization', err.message.includes('مستخدم الحركة'), `Passed. Prevented unauthorized empty creator: ${err.message}`);
    }

    // Test 5: Ledger Balance integration flow for a temporary test item
    const testItem = await inventoryItemsRepo.create({
      code: `T-${Date.now()}`,
      name: 'صنف اختبار البنية المهاجرة',
      category: 'اختبارات',
      unit: 'حبة',
      quantity: 10,
      minQuantity: 2,
      costPrice: 50,
      legacyBalance: 10
    });

    try {
      // Create initial stock transactions
      const tx1 = await inventoryService.createStockTransaction({
        transactionNo: `TX-T1-${Date.now()}`,
        date: '2026-08-14',
        itemId: testItem.id!,
        warehouseId: 'default',
        transactionType: 'PURCHASE_RECEIPT',
        quantity: 10, // Adds 10 units
        unitCost: 50,
        totalCost: 500,
        direction: 'in',
        referenceType: 'manual',
        createdBy: 'TEST_RUNNER_SECURE'
      });

      const tx2 = await inventoryService.createStockTransaction({
        transactionNo: `TX-T2-${Date.now()}`,
        date: '2026-08-14',
        itemId: testItem.id!,
        warehouseId: 'default',
        transactionType: 'ISSUE',
        quantity: 4, // Subtracts 4 units
        unitCost: 50,
        totalCost: 200,
        direction: 'out',
        referenceType: 'manual',
        createdBy: 'TEST_RUNNER_SECURE'
      });

      const ledgerBal = await inventoryBalanceService.calculateLedgerBalance(testItem.id!);
      const updatedItem = await inventoryItemsRepo.getById(testItem.id!);
      
      // Expected balance: initial 0 transactions + 10 (tx1) - 4 (tx2) = 6
      assertTest(
        'Verify Ledger Calculation Accuracy',
        ledgerBal === 6,
        `Passed. Reconstructed ledger balance is correctly calculated as: ${ledgerBal} (Expected: 6)`
      );

      // Verify that the legacy balance tracks: 10 (initial item legacyBalance) + 10 - 4 = 16
      const expectedLegacy = (testItem.legacyBalance || 0) + 10 - 4;
      assertTest(
        'Verify Dual Read (Legacy vs Ledger)',
        updatedItem?.legacyBalance === expectedLegacy,
        `Passed. Legacy balance is ${updatedItem?.legacyBalance} and Ledger balance is ${ledgerBal}.`
      );

    } finally {
      // Clean up test item
      await inventoryItemsRepo.delete(testItem.id!);
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
