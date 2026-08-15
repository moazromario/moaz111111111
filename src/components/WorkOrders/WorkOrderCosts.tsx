import React, { useState } from 'react';
import { FurnitureWorkOrder, Issuance, JobLabor, JobOtherCost, SafeTransaction } from '../../types';
import { Card, Button } from './ui/WorkOrderCardUI';
import { Calculator, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, Layers, Wrench, Package } from 'lucide-react';
import { getJobLedgerCostBreakdown, syncAndPersistJobLedgerCosts } from '../../lib/costAccountingEngine';

interface WorkOrderCostsProps {
  order: FurnitureWorkOrder;
  issuances?: Issuance[];
  jobLabors?: JobLabor[];
  jobOtherCosts?: JobOtherCost[];
  safeTransactions?: SafeTransaction[];
  onRefresh?: () => void;
}

export function WorkOrderCosts({
  order,
  issuances = [],
  jobLabors = [],
  jobOtherCosts = [],
  safeTransactions = [],
  onRefresh
}: WorkOrderCostsProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Map FurnitureWorkOrder to ProductionJob interface expected by the accounting engine
  const mappedJob: any = {
    id: order.id,
    orderNo: order.orderNumber,
    clientName: order.customerName,
    productName: order.roomCode || 'أمر شغل أثاث',
    sellingPrice: order.totalAmount || 0,
    estimatedCost: (order as any).estimatedCost || 0,
    totalMaterialCost: (order as any).totalMaterialCost || 0,
    totalLaborCost: (order as any).totalLaborCost || 0,
    totalOtherCost: (order as any).totalOtherCost || 0,
    status: order.status,
    startDate: order.contractDate || '',
    deadline: order.deliveryDate || '',
    priority: 'متوسطة',
    notes: order.notes || ''
  };

  const breakdown = getJobLedgerCostBreakdown(
    mappedJob,
    issuances,
    jobLabors,
    jobOtherCosts,
    safeTransactions
  );

  const handleRebuildAndSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const result = await syncAndPersistJobLedgerCosts(
        [mappedJob],
        issuances,
        jobLabors,
        jobOtherCosts,
        safeTransactions
      );
      if (result.errors.length > 0) {
        setSyncMessage(`حدث خطأ: ${result.errors.join(', ')}`);
      } else {
        setSyncMessage('تمت إعادة بناء وتثبيت التكاليف من الحركات الأصلية بنجاح! ✨');
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setSyncMessage('فشل إعادة بناء التكاليف: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Accounting Rebuilder Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-500/30">
                محرك التكاليف المحاسبي الحقيقي ⚖️
              </span>
              <span className="text-xs font-mono text-slate-400">Order #{order.orderNumber}</span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Calculator className="text-indigo-400" size={24} /> إعادة بناء التكلفة الفعلية من حركات المخزن والخزينة
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium">
              محاسبة ERP دقيقة تضمن عدم الاكتفاء بحفظ النتائج المخزنة، بل إعادة احتساب كافة خامات الصرف، المصنعيات، والمصروفات المباشرة من أصل السجلات القييدية.
            </p>
          </div>

          <Button
            onClick={handleRebuildAndSync}
            disabled={syncing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'جاري إعادة الحساب...' : 'إعادة بناء وتحديث بالتكاليف الفعلية'}
          </Button>
        </div>

        {syncMessage && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-900/60 border border-indigo-500/40 text-xs font-bold text-indigo-200">
            {syncMessage}
          </div>
        )}
      </Card>

      {/* Discrepancy Status Warning */}
      {!breakdown.isSynced && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={22} />
            <div>
              <p className="text-xs font-black">تنبيه وجود فرق محاسبي بين النتائج المخزنة والحركات الفعلية!</p>
              <p className="text-[11px] font-bold text-amber-700 mt-0.5">
                الفرق الإجمالي: {(breakdown.discrepancy).toLocaleString()} ج.م — اضغط على "إعادة بناء" لتثبيت القيم الحقيقية.
              </p>
            </div>
          </div>
          <Button onClick={handleRebuildAndSync} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0">
            تحديث القيمة
          </Button>
        </div>
      )}

      {/* Core KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Cost */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-black">
            <span>إجمالي التكلفة الفعلية Reconstructed</span>
            <Calculator size={18} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {breakdown.actualTotalCost.toLocaleString()} <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold flex justify-between pt-1 border-t border-slate-100">
            <span>المخزنة سابقة:</span>
            <span className="font-mono">{breakdown.storedTotalCost.toLocaleString()} ج.م</span>
          </div>
        </Card>

        {/* Material Cost */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-black">
            <span>تكلفة الخامات المصروفة (Issuances)</span>
            <Package size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {breakdown.actualMaterialCost.toLocaleString()} <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold flex justify-between pt-1 border-t border-slate-100">
            <span>عدد أذون الصرف:</span>
            <span className="font-bold">{breakdown.materialIssuances.length} أذون</span>
          </div>
        </Card>

        {/* Labor Cost */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-black">
            <span>مصنعيات وأجور العمالة المباشرة</span>
            <Wrench size={18} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {breakdown.actualLaborCost.toLocaleString()} <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold flex justify-between pt-1 border-t border-slate-100">
            <span>عدد السجلات:</span>
            <span className="font-bold">{breakdown.laborLogs.length} سجلات</span>
          </div>
        </Card>

        {/* Gross Profit & Margin */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-black">
            <span>مجمل الربح والنسبة Gross Profit</span>
            <TrendingUp size={18} className={breakdown.grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
          </div>
          <div className={`text-2xl font-black ${breakdown.grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {breakdown.grossProfit.toLocaleString()} <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
          <div className="text-[11px] font-bold flex justify-between pt-1 border-t border-slate-100">
            <span className="text-slate-500">هامش الربحية:</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${breakdown.profitMarginPercent >= 20 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {breakdown.profitMarginPercent.toFixed(1)}%
            </span>
          </div>
        </Card>
      </div>

      {/* Raw Ledger Movement Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Issuance Logs */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <Package size={18} className="text-blue-600" /> أذون صرف الخامات المباشرة ({breakdown.materialIssuances.length})
            </h3>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {breakdown.actualMaterialCost.toLocaleString()} ج.م
            </span>
          </div>

          {breakdown.materialIssuances.length === 0 ? (
            <p className="text-xs text-slate-400 font-bold py-6 text-center">لا توجد أذون صرف خامات مسجلة على أمر الشغل هذا.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {breakdown.materialIssuances.map((iss, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-slate-900 block">{iss.manufactureTarget || 'صرف خام'}</span>
                    <span className="text-[11px] font-bold text-slate-400">{iss.date} — الكمية: {iss.quantity} {iss.unit}</span>
                  </div>
                  <div className="text-left font-mono font-black text-slate-800">
                    {iss.total.toLocaleString()} ج.م
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Direct Labor Logs */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <Wrench size={18} className="text-amber-600" /> المصنعيات والعمالة المسجلة ({breakdown.laborLogs.length})
            </h3>
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              {breakdown.actualLaborCost.toLocaleString()} ج.م
            </span>
          </div>

          {breakdown.laborLogs.length === 0 ? (
            <p className="text-xs text-slate-400 font-bold py-6 text-center">لا توجد مصنعيات عمالة مسجلة على هذا الأمر.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {breakdown.laborLogs.map((lab, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-slate-900 block">{lab.stage || 'مرحلة تشغيل'}</span>
                    <span className="text-[11px] font-bold text-slate-400">{lab.date} — ساعات: {lab.hours} ساعة</span>
                  </div>
                  <div className="text-left font-mono font-black text-slate-800">
                    {lab.total.toLocaleString()} ج.م
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
