import { ProductionJob, Issuance, JobLabor, JobOtherCost, SafeTransaction, CustodySettlementExpense } from '../types';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export interface JobLedgerCostBreakdown {
  jobId: string;
  orderNo: string;
  productName: string;
  clientName?: string;
  sellingPrice: number;
  estimatedCost: number;
  
  // Reconstructed Ledger Costs from raw movements
  materialIssuances: Issuance[];
  actualMaterialCost: number;

  laborLogs: JobLabor[];
  actualLaborCost: number;

  otherCosts: JobOtherCost[];
  safeExpenses: (SafeTransaction | CustodySettlementExpense)[];
  actualOtherCost: number;

  actualTotalCost: number; // Material + Labor + Other from raw movements
  
  // Stored Values on Job (for audit comparison)
  storedMaterialCost: number;
  storedLaborCost: number;
  storedOtherCost: number;
  storedTotalCost: number;

  // Discrepancies & Variances
  discrepancy: number; // actualTotalCost - storedTotalCost (if not equal, needs sync)
  costVariance: number; // actualTotalCost - estimatedCost (actual vs estimated)
  grossProfit: number; // sellingPrice - actualTotalCost
  profitMarginPercent: number; // (grossProfit / sellingPrice) * 100
  isSynced: boolean; // Math.abs(discrepancy) < 0.01
}

/**
 * Calculates actual accounting cost for a production job strictly from raw ledger movements
 */
export function getJobLedgerCostBreakdown(
  job: ProductionJob,
  issuances: Issuance[] = [],
  jobLabors: JobLabor[] = [],
  jobOtherCosts: JobOtherCost[] = [],
  safeTransactions: SafeTransaction[] = [],
  settlementExpenses: CustodySettlementExpense[] = []
): JobLedgerCostBreakdown {
  if (!job) {
    return {
      jobId: '',
      orderNo: '',
      productName: '',
      sellingPrice: 0,
      estimatedCost: 0,
      materialIssuances: [],
      actualMaterialCost: 0,
      laborLogs: [],
      actualLaborCost: 0,
      otherCosts: [],
      safeExpenses: [],
      actualOtherCost: 0,
      actualTotalCost: 0,
      storedMaterialCost: 0,
      storedLaborCost: 0,
      storedOtherCost: 0,
      storedTotalCost: 0,
      discrepancy: 0,
      costVariance: 0,
      grossProfit: 0,
      profitMarginPercent: 0,
      isSynced: true,
    };
  }

  // 1. Material Issuances (سندات صرف الخامات من المطبخ/المخزن)
  const matchingIssuances = issuances.filter(
    (iss) => (iss.jobOrderNo && iss.jobOrderNo === job.orderNo) || (iss as any).manufacturingOrderId === job.id
  );
  const actualMaterialCost = matchingIssuances.reduce((sum, iss) => sum + (iss.total || 0), 0);

  // 2. Labor Logs (سجلات مصنعيات وساعات أومار العمل)
  const matchingLabors = jobLabors.filter((l) => l.jobId === job.id);
  const actualLaborCost = matchingLabors.reduce((sum, l) => sum + (l.total || 0), 0);

  // 3. Other Costs & Direct Safe Expenses (المصاريف المباشرة والخزينة)
  const matchingOtherCosts = jobOtherCosts.filter((o) => o.jobId === job.id);
  const directOtherCostSum = matchingOtherCosts.reduce((sum, o) => sum + (o.amount || 0), 0);

  const matchingSafeTxs = safeTransactions.filter(
    (st) => st.productionJobId && st.productionJobId === job.id
  );
  const safeExpensesSum = matchingSafeTxs.reduce((sum, st) => sum + (st.amount || 0), 0);

  const matchingSettlements = settlementExpenses.filter(
    (se) => (se as any).productionJobId && (se as any).productionJobId === job.id
  );
  const settlementsSum = matchingSettlements.reduce((sum, se) => sum + (se.amount || 0), 0);

  const safeExpensesCombined = [...matchingSafeTxs, ...matchingSettlements];
  const actualOtherCost = directOtherCostSum + safeExpensesSum + settlementsSum;

  // 4. Actual Reconstructed Total Cost
  const actualTotalCost = actualMaterialCost + actualLaborCost + actualOtherCost;

  // 5. Stored summary fields on Job
  const storedMaterialCost = job.totalMaterialCost || 0;
  const storedLaborCost = job.totalLaborCost || 0;
  const storedOtherCost = job.totalOtherCost || 0;
  const storedTotalCost = storedMaterialCost + storedLaborCost + storedOtherCost;

  const discrepancy = actualTotalCost - storedTotalCost;
  const estimatedCost = job.estimatedCost || 0;
  const costVariance = actualTotalCost - estimatedCost;
  const sellingPrice = job.sellingPrice || 0;
  const grossProfit = sellingPrice - actualTotalCost;
  const profitMarginPercent = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;
  const isSynced = Math.abs(discrepancy) < 0.01;

  return {
    jobId: job.id,
    orderNo: job.orderNo,
    productName: job.productName,
    clientName: job.clientName,
    sellingPrice,
    estimatedCost,
    materialIssuances: matchingIssuances,
    actualMaterialCost,
    laborLogs: matchingLabors,
    actualLaborCost,
    otherCosts: matchingOtherCosts,
    safeExpenses: safeExpensesCombined,
    actualOtherCost,
    actualTotalCost,
    storedMaterialCost,
    storedLaborCost,
    storedOtherCost,
    storedTotalCost,
    discrepancy,
    costVariance,
    grossProfit,
    profitMarginPercent,
    isSynced,
  };
}

/**
 * Rebuilds and syncs actual ledger costs back to Firestore for a single job or multiple jobs
 */
export async function syncAndPersistJobLedgerCosts(
  jobs: ProductionJob[],
  issuances: Issuance[],
  jobLabors: JobLabor[],
  jobOtherCosts: JobOtherCost[],
  safeTransactions: SafeTransaction[] = [],
  settlementExpenses: CustodySettlementExpense[] = []
): Promise<{ updatedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let updatedCount = 0;

  try {
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const job of jobs) {
      const breakdown = getJobLedgerCostBreakdown(
        job,
        issuances,
        jobLabors,
        jobOtherCosts,
        safeTransactions,
        settlementExpenses
      );

      // If stored fields don't match actual reconstructed ledger costs, queue an update
      if (!breakdown.isSynced) {
        const jobRef = doc(db, 'productionJobs', job.id);
        batch.update(jobRef, {
          totalMaterialCost: breakdown.actualMaterialCost,
          totalLaborCost: breakdown.actualLaborCost,
          totalOtherCost: breakdown.actualOtherCost,
          lastCostRebuiltAt: new Date().toISOString(),
        });
        updatedCount++;
        batchCount++;

        // Commit in batches of 450 (Firestore limit is 500)
        if (batchCount >= 450) {
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }
  } catch (err: any) {
    console.error('Error syncing job ledger costs:', err);
    errors.push(err?.message || 'فشل في تثبيت وإعادة بناء التكاليف المسجلة');
  }

  return { updatedCount, errors };
}
