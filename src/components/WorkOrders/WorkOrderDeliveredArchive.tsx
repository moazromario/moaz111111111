import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui/WorkOrderCardUI';
import { Truck, Plus, CheckCircle2, AlertCircle, RotateCcw, Search, Printer, Trash2, Edit2 } from 'lucide-react';

interface WorkOrderDeliveredArchiveProps {
  deliveryLogs: any[];
  onShowEditDeliveryModal: (log?: any) => void;
  onDeleteDeliveryLog: (id: string) => void;
  onPrintDeliveryLog: (log: any) => void;
}

export function WorkOrderDeliveredArchive({
  deliveryLogs,
  onShowEditDeliveryModal,
  onDeleteDeliveryLog,
  onPrintDeliveryLog
}: WorkOrderDeliveredArchiveProps) {
  const [deliverySearchTerm, setDeliverySearchTerm] = useState('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('الكل');
  const [deliveredLogDateFrom, setDeliveredLogDateFrom] = useState('');
  const [deliveredLogDateTo, setDeliveredLogDateTo] = useState('');

  const filteredLogs = deliveryLogs.filter(log => {
    const matchSearch = 
      !deliverySearchTerm || 
      (log.orderNumber || '').toLowerCase().includes(deliverySearchTerm.toLowerCase()) ||
      (log.customerName || '').toLowerCase().includes(deliverySearchTerm.toLowerCase()) ||
      (log.roomCode || '').toLowerCase().includes(deliverySearchTerm.toLowerCase()) ||
      (log.driverName || '').toLowerCase().includes(deliverySearchTerm.toLowerCase()) ||
      (log.shortagesDescription || '').toLowerCase().includes(deliverySearchTerm.toLowerCase()) ||
      (log.returnsDescription || '').toLowerCase().includes(deliverySearchTerm.toLowerCase());
    const matchStatus = deliveryStatusFilter === 'الكل' || log.deliveryStatus === deliveryStatusFilter;
    const matchDateFrom = !deliveredLogDateFrom || (log.deliveryDate >= deliveredLogDateFrom);
    const matchDateTo = !deliveredLogDateTo || (log.deliveryDate <= deliveredLogDateTo);
    return matchSearch && matchStatus && matchDateFrom && matchDateTo;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200" dir="rtl">
      {/* Header & Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white p-6 rounded-[18px] border border-amber-500/20 shadow-xl">
        <div>
          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-widest">
            إدارة التسليمات الميدانية والمرتجعات والنواقص ✨
          </span>
          <h2 className="text-2xl font-black text-white mt-2 flex items-center gap-2">
            <Truck className="text-amber-400" size={26} /> سجل ومحاضر التسليمات والنواقص والمرتجعات
          </h2>
          <p className="text-slate-300 text-xs font-bold mt-1">
            تتبع أوردرات التشغيل المسلمة تلقائياً، والبحث فيها، وتعديل المرتجعات والنواقص وإعادة التوجيه للورش للتقفيل والصيانة.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onShowEditDeliveryModal()}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black text-xs"
          >
            <Plus size={16} className="ml-1.5" /> تسجيل تسليم / مرتجع يدوي
          </Button>
        </div>
      </div>

      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[16px] border border-slate-100 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">إجمالي شحنات التسليم</span>
          <span className="text-2xl font-black text-slate-900 block mt-1 font-mono">{deliveryLogs.length}</span>
          <p className="text-[10px] text-slate-500 font-bold mt-1">مسجلة بالأرشيف التلقائي</p>
          <Truck size={40} className="absolute -bottom-2 -left-2 text-slate-100" />
        </div>

        <div className="bg-emerald-50/50 p-5 rounded-[16px] border border-emerald-100 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">مستلم بالكامل ✅</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1 font-mono">
            {deliveryLogs.filter(l => l.deliveryStatus === 'مستلم بالكامل').length}
          </span>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">بدون أي ملاحظات أو نواقص</p>
          <CheckCircle2 size={40} className="absolute -bottom-2 -left-2 text-emerald-100" />
        </div>

        <div className="bg-amber-50/50 p-5 rounded-[16px] border border-amber-100 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">تسليمات بها نواقص ⚠️</span>
          <span className="text-2xl font-black text-amber-700 block mt-1 font-mono">
            {deliveryLogs.filter(l => l.deliveryStatus === 'مستلم بنواقص' || l.deliveryStatus === 'قيد استكمال النواقص').length}
          </span>
          <p className="text-[10px] text-amber-600 font-bold mt-1">قيد الاستكمال والتوريد</p>
          <AlertCircle size={40} className="absolute -bottom-2 -left-2 text-amber-100" />
        </div>

        <div className="bg-rose-50/50 p-5 rounded-[16px] border border-rose-100 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">مرتجعات (جزئي/كامل) 🔄</span>
          <span className="text-2xl font-black text-rose-700 block mt-1 font-mono">
            {deliveryLogs.filter(l => l.deliveryStatus === 'مرتجع جزئي' || l.deliveryStatus === 'مرتجع بالكامل' || l.deliveryStatus === 'قيد معالجة المرتجع').length}
          </span>
          <p className="text-[10px] text-rose-600 font-bold mt-1">قيد الصيانة والتصنيع</p>
          <RotateCcw size={40} className="absolute -bottom-2 -left-2 text-rose-100" />
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-slate-50/50 py-3 px-6">
          <CardTitle className="text-xs font-black text-slate-700 flex items-center gap-2">
            <Search size={15} className="text-amber-500" /> البحث المتقدم والفرز في سجل التسليمات والنواقص
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">البحث الشامل:</label>
              <div className="relative">
                <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="رقم الأوردر، العميل، الغرفة..."
                  value={deliverySearchTerm}
                  onChange={(e) => setDeliverySearchTerm(e.target.value)}
                  className="w-full pr-10 pl-3 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">تصفية حسب الحالة:</label>
              <select
                value={deliveryStatusFilter}
                onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                className="w-full px-3 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
              >
                <option value="الكل">جميع الحالات</option>
                <option value="مستلم بالكامل">مستلم بالكامل ✅</option>
                <option value="مستلم بنواقص">مستلم بنواقص ⚠️</option>
                <option value="قيد استكمال النواقص">قيد استكمال النواقص ⏳</option>
                <option value="مرتجع جزئي">مرتجع جزئي 🔄</option>
                <option value="مرتجع بالكامل">مرتجع بالكامل ❌</option>
                <option value="قيد معالجة المرتجع">قيد معالجة المرتجع 🛠️</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">من تاريخ التسليم:</label>
              <input
                type="date"
                value={deliveredLogDateFrom}
                onChange={(e) => setDeliveredLogDateFrom(e.target.value)}
                className="w-full px-3 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">إلى تاريخ التسليم:</label>
              <input
                type="date"
                value={deliveredLogDateTo}
                onChange={(e) => setDeliveredLogDateTo(e.target.value)}
                className="w-full px-3 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivered Table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-slate-50/50 py-3 px-6 flex justify-between items-center">
          <CardTitle className="text-xs font-black text-slate-700">
            سجل شحنات التسليمات التفصيلي ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                <Truck size={32} />
              </div>
              <h3 className="text-base font-black text-slate-800">لا توجد تسليمات مسجلة بعد</h3>
              <p className="text-xs text-slate-500 font-bold max-w-md mx-auto">
                بمجرد تحويل أوردر في خيار الإنتاج أو إضافة بيان حمولة إلى "سلم للعميل" سيتم تسجيله تلقائياً هنا في الأرشيف.
              </p>
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-black border-b border-slate-200">
                <tr>
                  <th className="p-3.5">رقم الأمر والعميل</th>
                  <th className="p-3.5">اسم البند / الغرفة</th>
                  <th className="p-3.5">تاريخ التسليم والسائق</th>
                  <th className="p-3.5">حالة التسليم</th>
                  <th className="p-3.5">تفاصيل النواقص والمرتجعات</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {filteredLogs
                  .sort((a,b) => (b.deliveryDate || '').localeCompare(a.deliveryDate || ''))
                  .map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <span className="font-black text-indigo-900 block font-mono text-sm">#{log.orderNumber || 'غير محدد'}</span>
                        <span className="text-slate-800 font-black block mt-0.5">{log.customerName || 'عميل عام'}</span>
                        {log.customerPhone && <span className="text-[10px] text-slate-400 font-mono block">{log.customerPhone}</span>}
                      </td>
                      <td className="p-3.5">
                        <span className="font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-lg inline-block">{log.roomCode}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-slate-800 font-black block">{log.deliveryDate || '-'}</span>
                        <span className="text-[11px] text-slate-500 font-bold block mt-0.5">🚚 {log.driverName || 'سائق غير مسجل'} ({log.carNumber || '-'})</span>
                      </td>
                      <td className="p-3.5">
                        {log.deliveryStatus === 'مستلم بالكامل' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black px-2.5 py-1 rounded-lg">
                            <CheckCircle2 size={13} /> مستلم بالكامل ✅
                          </span>
                        )}
                        {(log.deliveryStatus === 'مستلم بنواقص' || log.deliveryStatus === 'قيد استكمال النواقص') && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-black px-2.5 py-1 rounded-lg">
                            <AlertCircle size={13} /> {log.deliveryStatus} ⚠️
                          </span>
                        )}
                        {(log.deliveryStatus === 'مرتجع جزئي' || log.deliveryStatus === 'مرتجع بالكامل' || log.deliveryStatus === 'قيد معالجة المرتجع') && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-black px-2.5 py-1 rounded-lg">
                            <RotateCcw size={13} /> {log.deliveryStatus} 🔄
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 max-w-[280px]">
                        {log.shortagesDescription && (
                          <div className="text-[11px] text-amber-900 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200 mb-1">
                            <span className="font-black block">⚠️ النواقص:</span>
                            <p className="truncate">{log.shortagesDescription}</p>
                          </div>
                        )}
                        {log.returnsDescription && (
                          <div className="text-[11px] text-rose-900 bg-rose-50/80 p-1.5 rounded-lg border border-rose-200">
                            <span className="font-black block">🔄 المرتجعات:</span>
                            <p className="truncate">{log.returnsDescription}</p>
                          </div>
                        )}
                        {!log.shortagesDescription && !log.returnsDescription && (
                          <span className="text-[11px] text-slate-400 font-bold">لا توجد ملاحظات أو نواقص</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onShowEditDeliveryModal(log)}
                            className="h-8 px-2.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                          >
                            <Edit2 size={13} className="ml-1" /> تعديل / نواقص
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPrintDeliveryLog(log)}
                            className="h-8 px-2 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <Printer size={13} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteDeliveryLog(log.id)}
                            className="h-8 px-2 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
