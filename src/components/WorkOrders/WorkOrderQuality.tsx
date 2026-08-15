import React, { useState } from 'react';
import { FurnitureWorkOrder } from '../../types';
import { Card, Button } from './ui/WorkOrderCardUI';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, Plus } from 'lucide-react';

interface WorkOrderQualityProps {
  order: FurnitureWorkOrder;
}

interface InspectionItem {
  id: string;
  roomCode: string;
  inspectorName: string;
  date: string;
  status: 'معتمد (مطابق)' | 'ملاحظات تعديل' | 'مرفوض (إعادة تصنيع)';
  notes: string;
  checklist: { check: string; passed: boolean }[];
}

export function WorkOrderQuality({ order }: WorkOrderQualityProps) {
  const [inspections, setInspections] = useState<InspectionItem[]>([
    {
      id: '1',
      roomCode: order.roomCode || 'البند الرئيسي',
      inspectorName: 'مهندس الجودة والجودة الفنية',
      date: new Date().toISOString().split('T')[0],
      status: 'معتمد (مطابق)',
      notes: 'تم فحص جودة النجارة، القشرة، ومتانة الهيكل الخشبي ومطابقتها للمواصفات.',
      checklist: [
        { check: 'فحص مقاسات الهيكل والسطح', passed: true },
        { check: 'سلامة السدائب وخلو الأخشاب من العقد الميتة', passed: true },
        { check: 'مطابقة لون الدهان ودرجة اللمعة', passed: true },
        { check: 'جودة التنجيد وخياطة الأقمشة', passed: true }
      ]
    }
  ]);

  const [newInspector, setNewInspector] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'معتمد (مطابق)' | 'ملاحظات تعديل' | 'مرفوض (إعادة تصنيع)'>('معتمد (مطابق)');

  const handleAddInspection = () => {
    if (!newInspector) return;
    const item: InspectionItem = {
      id: Date.now().toString(),
      roomCode: order.roomCode || 'البند الرئيسي',
      inspectorName: newInspector,
      date: new Date().toISOString().split('T')[0],
      status: newStatus,
      notes: newNotes || 'لا توجد ملاحظات إضافية',
      checklist: [
        { check: 'فحص المقاسات والجودة العامة', passed: newStatus === 'معتمد (مطابق)' },
        { check: 'فحص الدهانات والتشطيب', passed: newStatus === 'معتمد (مطابق)' }
      ]
    };
    setInspections([item, ...inspections]);
    setNewInspector('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
            رقابة وضمان الجودة QC 🛡️
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
            <ShieldCheck size={22} className="text-emerald-600" /> سجلات الجودة والفحص الفني
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            متابعة الفحص الفني للغرف ومطابقتها لكرت المواصفات الفنية قبل التسليم النهائي للعميل #{order.orderNumber}
          </p>
        </div>
      </div>

      {/* Add New Inspection Log Form */}
      <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-4">
        <h4 className="font-black text-slate-800 text-sm border-b pb-3 flex items-center gap-2">
          <Plus size={18} className="text-emerald-600" /> تسجيل إذن فحص جودة جديد
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold">
          <div>
            <label className="text-slate-500 block mb-1">اسم مسؤول الجودة:</label>
            <input
              type="text"
              value={newInspector}
              onChange={(e) => setNewInspector(e.target.value)}
              placeholder="مثال: م. أحمد عبد الفتاح"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">نتيجة الفحص:</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-black"
            >
              <option value="معتمد (مطابق)">معتمد (مطابق للجودة) ✓</option>
              <option value="ملاحظات تعديل">ملاحظات تعديل ورتوش ⚠️</option>
              <option value="مرفوض (إعادة تصنيع)">مرفوض (إعادة تصنيع) ✕</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">ملاحظات الفحص والعيوب:</label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="اكتب أي ملاحظات على الدهان أو المقاسات..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleAddInspection} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs">
            اعتماد وحفظ إذن الجودة
          </Button>
        </div>
      </Card>

      {/* Inspections History */}
      <div className="space-y-4">
        {inspections.map((insp) => (
          <Card key={insp.id} className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-3">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-3">
                {insp.status === 'معتمد (مطابق)' && <CheckCircle2 className="text-emerald-600" size={20} />}
                {insp.status === 'ملاحظات تعديل' && <AlertTriangle className="text-amber-600" size={20} />}
                {insp.status === 'مرفوض (إعادة تصنيع)' && <XCircle className="text-rose-600" size={20} />}

                <div>
                  <h4 className="font-black text-slate-900 text-sm">{insp.roomCode}</h4>
                  <span className="text-xs text-slate-400 font-bold">المفتش: {insp.inspectorName} — {insp.date}</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                insp.status === 'معتمد (مطابق)' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                insp.status === 'ملاحظات تعديل' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {insp.status}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {insp.notes}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold pt-1">
              {insp.checklist.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-700">
                  <span className={c.passed ? 'text-emerald-600' : 'text-rose-600'}>
                    {c.passed ? '✓' : '✕'}
                  </span>
                  <span>{c.check}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
