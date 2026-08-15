import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesOrder, ProductionJob, Showroom, LostSale, Issuance, JobLabor, JobOtherCost, SafeTransaction, CustodySettlementExpense } from '../types';
import { getJobLedgerCostBreakdown } from '../lib/costAccountingEngine';

interface SalesReportsProps {
  salesOrders: SalesOrder[];
  productionJobs: ProductionJob[];
  showrooms: Showroom[];
  lostSales: LostSale[];
  issuances?: Issuance[];
  jobLabors?: JobLabor[];
  jobOtherCosts?: JobOtherCost[];
  safeTransactions?: SafeTransaction[];
  settlementExpenses?: CustodySettlementExpense[];
}

export function SalesReports({ 
  salesOrders, 
  productionJobs, 
  showrooms, 
  lostSales,
  issuances = [],
  jobLabors = [],
  jobOtherCosts = [],
  safeTransactions = [],
  settlementExpenses = []
}: SalesReportsProps) {

  // 1. تقرير دخل المعارض
  const showroomIncome = showrooms.map(showroom => {
    const orders = salesOrders.filter(o => o.showroomId === showroom.id);
    const totalProfit = orders.reduce((sum, o) => sum + o.netProfit, 0);
    return { name: showroom.name, profit: totalProfit };
  });

  // 2. تحليل ربحية الموديلات المعتمد على إعادة بناء السجل المحاسبي من الحركات
  const modelProfitability = productionJobs.map(job => {
    const relatedSalesOrders = salesOrders.filter(so => so.items.some(item => item.jobId === job.id));
    const totalRevenue = relatedSalesOrders.reduce((sum, so) => {
      const orderItem = so.items.find(item => item.jobId === job.id);
      return sum + (orderItem?.sellingPrice || 0);
    }, 0);

    const breakdown = getJobLedgerCostBreakdown(job, issuances, jobLabors, jobOtherCosts, safeTransactions, settlementExpenses);
    const totalCosts = breakdown.actualTotalCost || job.estimatedCost || 0;
    const netProfit = (totalRevenue || job.sellingPrice || 0) - totalCosts;
    return { name: job.productName, netProfit, totalCosts, totalRevenue };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>الذكاء المالي: تقارير الأداء</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <h3 className="font-bold mb-4">قائمة الدخل لكل معرض</h3>
                {showroomIncome.map(s => (
                    <div key={s.name} className="flex justify-between py-2 border-b">
                        <span>{s.name}</span>
                        <span className="font-black text-emerald-600">{s.profit.toLocaleString()}</span>
                    </div>
                ))}
            </div>
            <div>
                <h3 className="font-bold mb-4">ربحية الموديلات</h3>
                {modelProfitability.map(m => (
                    <div key={m.name} className="flex justify-between py-2 border-b">
                        <span>{m.name}</span>
                        <span className={`font-black ${m.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {m.netProfit.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
            <div>
                <h3 className="font-bold mb-4">أكثر المنتجات طلباً (غير المتوفرة)</h3>
                {lostSales.slice(0, 5).map((l, i) => (
                    <div key={i} className="py-2 border-b">
                        <span className="font-bold">{l.productName}</span> — 
                        <span className="text-sm text-gray-500"> تكرر {l.date}</span>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
