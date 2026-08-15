import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calculator, 
  FileCheck2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Box, 
  Hammer, 
  Receipt, 
  DollarSign, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  Search,
  Scale,
  Sparkles,
  Layers
} from 'lucide-react';
import { ProductionJob, Issuance, JobLabor, JobOtherCost, SafeTransaction, CustodySettlementExpense } from '../types';
import { getJobLedgerCostBreakdown, syncAndPersistJobLedgerCosts } from '../lib/costAccountingEngine';

interface JobCostAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ProductionJob | null;
  allJobs?: ProductionJob[];
  issuances: Issuance[];
  jobLabors: JobLabor[];
  jobOtherCosts: JobOtherCost[];
  safeTransactions?: SafeTransaction[];
  settlementExpenses?: CustodySettlementExpense[];
  onCostUpdated?: () => void;
}

export function JobCostAuditModal({
  isOpen,
  onClose,
  job,
  allJobs = [],
  issuances,
  jobLabors,
  jobOtherCosts,
  safeTransactions = [],
  settlementExpenses = [],
  onCostUpdated
}: JobCostAuditModalProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(job?.id || '');
  const [activeTab, setActiveTab] = useState<'materials' | 'labor' | 'other' | 'reconcile'>('materials');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const currentJob = (allJobs.find(j => j.id === selectedJobId) || job) as ProductionJob | null;

  if (!isOpen) return null;

  const breakdown = currentJob
    ? getJobLedgerCostBreakdown(currentJob, issuances, jobLabors, jobOtherCosts, safeTransactions, settlementExpenses)
    : null;

  const handleSyncCurrentJob = async () => {
    if (!currentJob) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncAndPersistJobLedgerCosts(
        [currentJob],
        issuances,
        jobLabors,
        jobOtherCosts,
        safeTransactions,
        settlementExpenses
      );
      if (res.errors.length > 0) {
        setSyncStatus(`حدث خطأ: ${res.errors.join(', ')}`);
      } else {
        setSyncStatus('تمت إعادة بناء وتثبيت التكلفة المحاسبية بنجاح في السجلات!');
        if (onCostUpdated) onCostUpdated();
      }
    } catch (err: any) {
      setSyncStatus(`خطأ أثناء الحفظ: ${err?.message || 'خطأ غير معروف'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAllJobs = async () => {
    if (allJobs.length === 0) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncAndPersistJobLedgerCosts(
        allJobs,
        issuances,
        jobLabors,
        jobOtherCosts,
        safeTransactions,
        settlementExpenses
      );
      if (res.errors.length > 0) {
        setSyncStatus(`حدث خطأ: ${res.errors.join(', ')}`);
      } else {
        setSyncStatus(`تمت إعادة بناء وتثبيت التكلفة لـ ${res.updatedCount} أمر إنتاج بنجاح!`);
        if (onCostUpdated) onCostUpdated();
      }
    } catch (err: any) {
      setSyncStatus(`خطأ أثناء الحفظ: ${err?.message || 'خطأ غير معروف'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-slate-50 border border-slate-200">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl">
                <Calculator size={26} />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-slate-900">
                  محرك تدقيق وإعادة بناء التكلفة المحاسبية
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-bold mt-1">
                  حساب التكلفة الحقيقية لأمر الإنتاج بناءً على حركات المبيعات وصرف الخامات وسجلات المصنعيات المباشرة
                </DialogDescription>
              </div>
            </div>

            {allJobs.length > 1 && (
              <div className="w-64">
                <select
                  value={selectedJobId || currentJob?.id || ''}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full text-xs font-black p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
                >
                  {allJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.orderNo} - {j.productName} ({j.clientName || 'بدون عميل'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </DialogHeader>

        {!currentJob || !breakdown ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm">
            الرجاء اختيار أمر إنتاج لتدقيق حركات تكلفته.
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Header info bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">أمر الإنتاج / الشغل</span>
                <span className="text-base font-black text-slate-900">{breakdown.orderNo} - {breakdown.productName}</span>
                {breakdown.clientName && (
                  <span className="text-xs font-bold text-slate-500 block">العميل: {breakdown.clientName}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Badge className={breakdown.isSynced ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200' : 'bg-amber-500/10 text-amber-700 border-amber-200'}>
                  {breakdown.isSynced ? (
                    <span className="flex items-center gap-1"><CheckCircle2 size={13} /> مطابق للسجلات الحقيقية</span>
                  ) : (
                    <span className="flex items-center gap-1"><AlertTriangle size={13} /> يتطلب إعادة بناء وتثبيت!</span>
                  )}
                </Badge>

                <Button
                  onClick={handleSyncCurrentJob}
                  disabled={isSyncing}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black px-4 py-2 flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  إعادة بناء وتثبيت التكلفة
                </Button>

                {allJobs.length > 1 && (
                  <Button
                    onClick={handleSyncAllJobs}
                    disabled={isSyncing}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-black px-3 py-2 flex items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    إعادة بناء الكل ({allJobs.length})
                  </Button>
                )}
              </div>
            </div>

            {syncStatus && (
              <div className={`p-3 rounded-xl text-xs font-black ${syncStatus.includes('خطأ') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                {syncStatus}
              </div>
            )}

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">المقايسة التقديرية</span>
                      <span className="text-lg font-black text-slate-800">
                        {breakdown.estimatedCost.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                      <Scale size={18} />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">التكلفة المتوقعة بالمقايسة</span>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">التكلفة المحاسبية الحقيقية</span>
                      <span className="text-lg font-black text-emerald-600">
                        {breakdown.actualTotalCost.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                      <Calculator size={18} />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">مجموع حركات السجل الفعلية</span>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">انحراف التكلفة الحقيقية</span>
                      <span className={`text-lg font-black ${breakdown.costVariance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {breakdown.costVariance > 0 ? `+${breakdown.costVariance.toLocaleString()}` : breakdown.costVariance.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div className={`p-2 rounded-xl ${breakdown.costVariance > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {breakdown.costVariance > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">
                    {breakdown.costVariance > 0 ? 'تجاوز التكلفة التقديرية' : 'توفير بالمقارنة بالمقايسة'}
                  </span>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">مجمل الربح المحقق</span>
                      <span className={`text-lg font-black ${breakdown.grossProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {breakdown.grossProfit.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 block mt-1">
                    سعر البيع: {breakdown.sellingPrice.toLocaleString()} ج.م ({breakdown.profitMarginPercent.toFixed(1)}%)
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Audit Breakdown Navigation Tabs */}
            <div className="bg-white rounded-2xl p-2 border border-slate-200">
              <div className="flex border-b border-slate-150 gap-2 pb-2">
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'materials' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Box size={15} />
                  صرف الخامات ({breakdown.materialIssuances.length})
                  <span className="text-[10px] opacity-80">({breakdown.actualMaterialCost.toLocaleString()} ج.م)</span>
                </button>

                <button
                  onClick={() => setActiveTab('labor')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'labor' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Hammer size={15} />
                  أجور ومصنعيات العمالة ({breakdown.laborLogs.length})
                  <span className="text-[10px] opacity-80">({breakdown.actualLaborCost.toLocaleString()} ج.م)</span>
                </button>

                <button
                  onClick={() => setActiveTab('other')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'other' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Receipt size={15} />
                  المصاريف المباشرة والخزينة ({breakdown.otherCosts.length + breakdown.safeExpenses.length})
                  <span className="text-[10px] opacity-80">({breakdown.actualOtherCost.toLocaleString()} ج.م)</span>
                </button>

                <button
                  onClick={() => setActiveTab('reconcile')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'reconcile' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Scale size={15} />
                  مطابقة السجل المحاسبي
                </button>
              </div>

              {/* Tab Contents */}
              <div className="pt-4">
                {/* 1. Materials Tab */}
                {activeTab === 'materials' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-black text-slate-700 px-1">
                      <span>سجل حركات صرف الخامات والمواد الأولية لهذا الأمر</span>
                      <span className="text-emerald-600">إجمالي خامات: {breakdown.actualMaterialCost.toLocaleString()} ج.م</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="text-right text-[11px] font-black">التاريخ</TableHead>
                            <TableHead className="text-right text-[11px] font-black">اسم الصنف / الخامة</TableHead>
                            <TableHead className="text-center text-[11px] font-black">الكمية المنصرفة</TableHead>
                            <TableHead className="text-center text-[11px] font-black">الوحدة</TableHead>
                            <TableHead className="text-left text-[11px] font-black">سعر الوحدة</TableHead>
                            <TableHead className="text-left text-[11px] font-black">الإجمالي</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {breakdown.materialIssuances.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-bold text-xs">
                                لم يتم تسجيل أي سندات صرف خامات لهذا الأمر بعد.
                              </TableCell>
                            </TableRow>
                          ) : (
                            breakdown.materialIssuances.map((iss) => (
                              <TableRow key={iss.id} className="hover:bg-slate-50/80 text-xs">
                                <TableCell className="font-bold text-slate-600">{iss.date}</TableCell>
                                <TableCell className="font-black text-slate-900">
                                  {(iss as any).itemName || `صنف ID: ${iss.itemId}`}
                                </TableCell>
                                <TableCell className="text-center font-bold text-slate-700">{iss.quantity}</TableCell>
                                <TableCell className="text-center text-slate-500">{iss.unit || '-'}</TableCell>
                                <TableCell className="text-left font-bold text-slate-600">{iss.price?.toLocaleString() || 0} ج.م</TableCell>
                                <TableCell className="text-left font-black text-emerald-600">{iss.total?.toLocaleString() || 0} ج.م</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* 2. Labor Tab */}
                {activeTab === 'labor' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-black text-slate-700 px-1">
                      <span>سجل أجور وساعات عمل الفنيين والعمال على الأمر</span>
                      <span className="text-emerald-600">إجمالي أجور: {breakdown.actualLaborCost.toLocaleString()} ج.م</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="text-right text-[11px] font-black">التاريخ</TableHead>
                            <TableHead className="text-right text-[11px] font-black">الموظف / الفني</TableHead>
                            <TableHead className="text-right text-[11px] font-black">المرحلة الإنتاجية</TableHead>
                            <TableHead className="text-center text-[11px] font-black">الساعات</TableHead>
                            <TableHead className="text-left text-[11px] font-black">أجر الساعة</TableHead>
                            <TableHead className="text-left text-[11px] font-black">الإجمالي</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {breakdown.laborLogs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-bold text-xs">
                                لم يتم تسجيل أي أجور أو مصنعيات عمالة لهذا الأمر بعد.
                              </TableCell>
                            </TableRow>
                          ) : (
                            breakdown.laborLogs.map((lab) => (
                              <TableRow key={lab.id} className="hover:bg-slate-50/80 text-xs">
                                <TableCell className="font-bold text-slate-600">{lab.date}</TableCell>
                                <TableCell className="font-black text-slate-900">
                                  {(lab as any).employeeName || `موظف ID: ${lab.employeeId}`}
                                </TableCell>
                                <TableCell className="font-bold text-slate-700">{lab.stage || '-'}</TableCell>
                                <TableCell className="text-center font-bold text-slate-700">{lab.hours}</TableCell>
                                <TableCell className="text-left font-bold text-slate-600">{lab.rate?.toLocaleString() || 0} ج.م</TableCell>
                                <TableCell className="text-left font-black text-emerald-600">{lab.total?.toLocaleString() || 0} ج.م</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* 3. Other Costs Tab */}
                {activeTab === 'other' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-black text-slate-700 px-1">
                      <span>سجل المصاريف المباشرة المسجلة وسندات الصرف من الخزينة</span>
                      <span className="text-emerald-600">إجمالي مصاريف أخرى: {breakdown.actualOtherCost.toLocaleString()} ج.م</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="text-right text-[11px] font-black">التاريخ</TableHead>
                            <TableHead className="text-right text-[11px] font-black">البيان / الوصف</TableHead>
                            <TableHead className="text-center text-[11px] font-black">المصدر</TableHead>
                            <TableHead className="text-left text-[11px] font-black">المبلغ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {breakdown.otherCosts.length === 0 && breakdown.safeExpenses.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-slate-400 font-bold text-xs">
                                لا توجد مصاريف مباشرة إضافية أو إيصالات خزينة مرتبطة بهذا الأمر.
                              </TableCell>
                            </TableRow>
                          ) : (
                            <>
                              {breakdown.otherCosts.map((oth) => (
                                <TableRow key={oth.id} className="hover:bg-slate-50/80 text-xs">
                                  <TableCell className="font-bold text-slate-600">{oth.date}</TableCell>
                                  <TableCell className="font-black text-slate-900">{oth.description || oth.stage || 'مصروف مباشر'}</TableCell>
                                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">مصروف أمر إنتاج</Badge></TableCell>
                                  <TableCell className="text-left font-black text-emerald-600">{oth.amount?.toLocaleString() || 0} ج.م</TableCell>
                                </TableRow>
                              ))}

                              {breakdown.safeExpenses.map((se) => (
                                <TableRow key={se.id} className="hover:bg-slate-50/80 text-xs">
                                  <TableCell className="font-bold text-slate-600">{se.date}</TableCell>
                                  <TableCell className="font-black text-slate-900">{se.description || 'مصروف من الخزينة/العهدة'}</TableCell>
                                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">سند خزينة/عهدة</Badge></TableCell>
                                  <TableCell className="text-left font-black text-emerald-600">{se.amount?.toLocaleString() || 0} ج.م</TableCell>
                                </TableRow>
                              ))}
                            </>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* 4. Reconciliation Tab */}
                {activeTab === 'reconcile' && (
                  <div className="space-y-4 p-2">
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-black text-slate-800 text-xs flex items-center gap-2">
                        <Scale size={16} className="text-blue-600" />
                        جدول المقارنة والمطابقة المحاسبية
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <span className="text-slate-400 font-bold block mb-1">القيم المسجلة سابقتً (الملخص المخزن)</span>
                          <div className="space-y-1 font-bold text-slate-700">
                            <div>خامات: {breakdown.storedMaterialCost.toLocaleString()} ج.م</div>
                            <div>أجور: {breakdown.storedLaborCost.toLocaleString()} ج.m</div>
                            <div>أخرى: {breakdown.storedOtherCost.toLocaleString()} ج.م</div>
                            <div className="border-t pt-1 font-black text-slate-900">الإجمالي المسجل: {breakdown.storedTotalCost.toLocaleString()} ج.م</div>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                          <span className="text-blue-600 font-bold block mb-1">القيم المعاد بناؤها من واقع السجلات الحقيقية</span>
                          <div className="space-y-1 font-bold text-slate-700">
                            <div>خامات: {breakdown.actualMaterialCost.toLocaleString()} ج.م</div>
                            <div>أجور: {breakdown.actualLaborCost.toLocaleString()} ج.م</div>
                            <div>أخرى: {breakdown.actualOtherCost.toLocaleString()} ج.م</div>
                            <div className="border-t pt-1 font-black text-emerald-600">الإجمالي الحقيقي: {breakdown.actualTotalCost.toLocaleString()} ج.م</div>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <span className="text-slate-400 font-bold block mb-1">الفروق والمطابقة المحاسبية</span>
                          <div className="space-y-1 font-bold text-slate-700">
                            <div>فروق الخامات: {(breakdown.actualMaterialCost - breakdown.storedMaterialCost).toLocaleString()} ج.م</div>
                            <div>فروق الأجور: {(breakdown.actualLaborCost - breakdown.storedLaborCost).toLocaleString()} ج.م</div>
                            <div>فروق أخرى: {(breakdown.actualOtherCost - breakdown.storedOtherCost).toLocaleString()} ج.م</div>
                            <div className={`border-t pt-1 font-black ${breakdown.discrepancy === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              إجمالي الفرق: {breakdown.discrepancy.toLocaleString()} ج.م
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button variant="ghost" onClick={onClose} className="rounded-xl text-xs font-bold">
                        إغلاق
                      </Button>
                      <Button
                        onClick={handleSyncCurrentJob}
                        disabled={isSyncing}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black px-6 flex items-center gap-2"
                      >
                        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                        تثبيت القيم الحقيقية في قاعدة البيانات
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
