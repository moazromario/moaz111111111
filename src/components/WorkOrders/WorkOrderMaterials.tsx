import React from 'react';
import { FurnitureWorkOrder, Issuance } from '../../types';
import { Card, Button } from './ui/WorkOrderCardUI';
import { Package, Plus, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface WorkOrderMaterialsProps {
  order: FurnitureWorkOrder;
  issuances?: Issuance[];
  onAddIssuance?: () => void;
}

export function WorkOrderMaterials({ order, issuances = [], onAddIssuance }: WorkOrderMaterialsProps) {
  const matchingIssuances = issuances.filter(
    (iss) => (iss.jobOrderNo && iss.jobOrderNo === order.orderNumber) || (iss as any).manufacturingOrderId === order.id
  );

  const totalMaterialSpent = matchingIssuances.reduce((sum, i) => sum + (i.total || 0), 0);

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
            متابعة خامات ومكونات الإنتاج 🪵
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
            <Package size={22} className="text-blue-600" /> كشف خامات ومواد الشغل المخصصة
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            عرض وتفريغ كافة خامات الأخشاب، الدهانات، والأقمشة المصروفة من المستودع لأمر الشغل رقم #{order.orderNumber}
          </p>
        </div>

        {onAddIssuance && (
          <Button onClick={onAddIssuance} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs">
            <Plus size={16} className="ml-1" /> إضافة إذن صرف خام +
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-slate-100 shadow-sm rounded-xl">
          <span className="text-xs font-black text-slate-400 block">إجمالي تكلفة الخامات</span>
          <span className="text-xl font-black text-blue-600 mt-1 block">
            {totalMaterialSpent.toLocaleString()} <span className="text-xs text-slate-400">ج.م</span>
          </span>
        </Card>

        <Card className="p-4 bg-white border border-slate-100 shadow-sm rounded-xl">
          <span className="text-xs font-black text-slate-400 block">عدد أذون الصرف المسجلة</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">
            {matchingIssuances.length} أذون
          </span>
        </Card>

        <Card className="p-4 bg-white border border-slate-100 shadow-sm rounded-xl">
          <span className="text-xs font-black text-slate-400 block">حالة جاهزية الخامات</span>
          <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full inline-block mt-1">
            مكتملة الصرف ✓
          </span>
        </Card>
      </div>

      {/* Issuances List Table */}
      <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-4">
        <h4 className="font-black text-slate-800 text-sm border-b pb-3 flex items-center gap-2">
          <FileText size={18} className="text-slate-500" /> جدول أذون الصرف الفعلية من المستودع
        </h4>

        {matchingIssuances.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Package size={36} className="mx-auto text-slate-300" />
            <p className="text-xs text-slate-500 font-bold">لا توجد خامات مصروفة مسجلة بعد لهذا الأمر.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-black">
                  <th className="p-3">تاريخ الصرف</th>
                  <th className="p-3">الجهة / الغرض</th>
                  <th className="p-3">مركز التكلفة</th>
                  <th className="p-3">الكمية المصروفة</th>
                  <th className="p-3">سعر الوحدة</th>
                  <th className="p-3">الإجمالي (ج.م)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                {matchingIssuances.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-slate-500 font-mono">{iss.date}</td>
                    <td className="p-3 font-black">{iss.manufactureTarget || 'صرف خامات تشغيل'}</td>
                    <td className="p-3">{iss.costCenter || 'المصنع'}</td>
                    <td className="p-3">{iss.quantity} {iss.unit}</td>
                    <td className="p-3 font-mono">{(iss.price || 0).toLocaleString()}</td>
                    <td className="p-3 font-mono font-black text-blue-600">{(iss.total || 0).toLocaleString()} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
