import React, { useState, useMemo } from 'react';
import { FurnitureWorkOrder } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui/WorkOrderCardUI';
import { 
  Plus, Printer, Search, User, ClipboardList, DollarSign, 
  Layers, Briefcase, Eye, FileText, Truck, Edit2, Trash2 
} from 'lucide-react';

interface WorkOrderTableProps {
  workOrders: FurnitureWorkOrder[];
  onNewOrder: () => void;
  onEditOrder: (order: FurnitureWorkOrder) => void;
  onViewOrder: (order: FurnitureWorkOrder) => void;
  onDeleteOrder: (id: string) => void;
  onConvertToDeliveryReceipt: (order: FurnitureWorkOrder) => void;
  onConvertToLoadingManifest: (order: FurnitureWorkOrder) => void;
  onPrintFilteredSummary: (orders: FurnitureWorkOrder[]) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export function WorkOrderTable({
  workOrders,
  onNewOrder,
  onEditOrder,
  onViewOrder,
  onDeleteOrder,
  onConvertToDeliveryReceipt,
  onConvertToLoadingManifest,
  onPrintFilteredSummary,
  getStatusBadge
}: WorkOrderTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [salesPersonFilter, setSalesPersonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [monthFilter, setMonthFilter] = useState('الكل');
  const [yearFilter, setYearFilter] = useState('الكل');
  const [contractDateFrom, setContractDateFrom] = useState('');
  const [contractDateTo, setContractDateTo] = useState('');
  const [deliveryDateFrom, setDeliveryDateFrom] = useState('');
  const [deliveryDateTo, setDeliveryDateTo] = useState('');

  const filteredOrders = useMemo(() => {
    return workOrders.filter(order => {
      // 1. Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesCustomer = order.customerName?.toLowerCase().includes(term);
        const matchesNumber = order.orderNumber?.toLowerCase().includes(term);
        const matchesRoomCode = order.roomCode?.toLowerCase().includes(term) ||
          order.rooms?.some(r => r.roomCode?.toLowerCase().includes(term));
        if (!matchesCustomer && !matchesNumber && !matchesRoomCode) return false;
      }

      // 2. Sales person filter
      if (salesPersonFilter) {
        if (!order.salesPerson?.toLowerCase().includes(salesPersonFilter.toLowerCase())) return false;
      }

      // 3. Status filter
      if (statusFilter !== 'الكل') {
        if (order.status !== statusFilter) return false;
      }

      // 4. Contract Month/Year Filter
      if (order.contractDate) {
        const [year, month] = order.contractDate.split('-');
        if (monthFilter !== 'الكل' && month !== monthFilter) return false;
        if (yearFilter !== 'الكل' && year !== yearFilter) return false;
      } else {
        if (monthFilter !== 'الكل' || yearFilter !== 'الكل') return false;
      }

      // 5. Contract Date Range
      if (contractDateFrom && order.contractDate && order.contractDate < contractDateFrom) return false;
      if (contractDateTo && order.contractDate && order.contractDate > contractDateTo) return false;

      // 6. Delivery Date Range
      if (deliveryDateFrom && order.deliveryDate && order.deliveryDate < deliveryDateFrom) return false;
      if (deliveryDateTo && order.deliveryDate && order.deliveryDate > deliveryDateTo) return false;

      return true;
    });
  }, [
    workOrders, searchTerm, salesPersonFilter, statusFilter, 
    monthFilter, yearFilter, contractDateFrom, contractDateTo, 
    deliveryDateFrom, deliveryDateTo
  ]);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <Button onClick={onNewOrder}>
            <Plus size={16} className="ml-1.5" />
            إصدار أمر تشغيل جديد (متعدد الغرف)
          </Button>
          <Button variant="outline" onClick={() => onPrintFilteredSummary(filteredOrders)}>
            <Printer size={16} className="ml-1.5 text-indigo-600" />
            طباعة تقرير الفرز الحالي 🖨️
          </Button>
        </div>
      </div>

      {/* Precision Filters Panel */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-slate-50/50 py-3 px-6">
          <CardTitle className="text-xs font-black text-slate-600 flex items-center gap-2">
            <Search size={14} className="text-indigo-500" /> لوحة الفرز والبحث الدقيق
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search Term */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">بحث شامل:</label>
              <div className="relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="العميل، رقم الأمر، كود الغرفة..."
                  className="w-full pl-12 h-11 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-slate-800 outline-none px-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Sales agent filter */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">المسؤول / السيلز:</label>
              <div className="relative group">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="اسم السيلز..."
                  className="w-full pl-12 h-11 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-slate-800 outline-none px-4"
                  value={salesPersonFilter}
                  onChange={(e) => setSalesPersonFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">حالة العمل:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-slate-800 outline-none appearance-none"
              >
                <option value="الكل">كل الحالات</option>
                <option value="بانتظار التعميد">بانتظار التعميد</option>
                <option value="في أحد مراكز التكلفة">في أحد مراكز التكلفة</option>
                <option value="في المخزن تام التشطيب">في المخزن تام التشطيب</option>
                <option value="تم إرساله للمعارض">تم إرساله للمعارض</option>
                <option value="سلم للعميل">سلم للعميل</option>
                <option value="ملغى">ملغى</option>
              </select>
            </div>

            {/* Month/Year Filter */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">تاريخ التعاقد:</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-slate-800 outline-none"
                >
                  <option value="الكل">الشهر</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = (i + 1).toString().padStart(2, '0');
                    return <option key={m} value={m}>{m}</option>;
                  })}
                </select>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-slate-800 outline-none"
                >
                  <option value="الكل">السنة</option>
                  {[2024, 2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contract Date Range */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">تاريخ التعاقد (من):</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                value={contractDateFrom}
                onChange={(e) => setContractDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">تاريخ التعاقد (إلى):</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                value={contractDateTo}
                onChange={(e) => setContractDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">تاريخ الاستلام (من):</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                value={deliveryDateFrom}
                onChange={(e) => setDeliveryDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">تاريخ الاستلام (إلى):</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                value={deliveryDateTo}
                onChange={(e) => setDeliveryDateTo(e.target.value)}
              />
            </div>

            <div className="flex items-end justify-end col-span-full">
              <Button
                variant="outline"
                className="py-2 bg-slate-100 border-none text-slate-600 hover:bg-slate-200"
                onClick={() => {
                  setSearchTerm('');
                  setSalesPersonFilter('');
                  setStatusFilter('الكل');
                  setMonthFilter('الكل');
                  setYearFilter('الكل');
                  setContractDateFrom('');
                  setContractDateTo('');
                  setDeliveryDateFrom('');
                  setDeliveryDateTo('');
                }}
              >
                مسح الفلاتر 🔄
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-[14px] p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-indigo-600 block uppercase tracking-wider">عدد الأوردرات المفلترة</span>
            <span className="text-xl font-black text-indigo-950 block mt-1">{filteredOrders.length} أوردر تشغيل</span>
          </div>
          <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-600">
            <ClipboardList size={20} />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-[14px] p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-emerald-600 block uppercase tracking-wider">إجمالي القيمة المالية</span>
            <span className="text-xl font-black text-emerald-950 block mt-1">
              {filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()} ج.م
            </span>
          </div>
          <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-[14px] p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-purple-600 block uppercase tracking-wider">إجمالي البنود / الغرف</span>
            <span className="text-xl font-black text-purple-950 block mt-1">
              {filteredOrders.reduce((sum, o) => sum + (o.rooms?.length || 1), 0)} غرفة 🛋️
            </span>
          </div>
          <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-600">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-[14px] p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-amber-600 block uppercase tracking-wider">متوسط قيمة التعاقد</span>
            <span className="text-xl font-black text-amber-950 block mt-1">
              {filteredOrders.length > 0 
                ? Math.round(filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / filteredOrders.length).toLocaleString()
                : 0} ج.م
            </span>
          </div>
          <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-600">
            <Briefcase size={20} />
          </div>
        </div>
      </div>

      {/* Orders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-[14px] border border-slate-100">
            <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">لا توجد أوامر تشغيل مطابقة لمعايير البحث الدقيق</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const totalRoomsCount = order.rooms?.length || 1;
            return (
              <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
                <div>
                  {/* Top bar */}
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 font-mono">{order.orderNumber}</div>
                      <div className="font-black text-slate-800 text-sm">{order.customerName}</div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Content details */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-indigo-100">
                        {totalRoomsCount} غرف / بنود تعاقدية 🛋️
                      </span>
                      {order.salesPerson && (
                        <span className="bg-violet-50 text-violet-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-violet-100">
                          السيلز: {order.salesPerson}
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="font-black text-slate-500 block">الغرف المشمولة:</span>
                      <p className="text-slate-800 font-bold truncate">
                        {order.rooms && order.rooms.length > 0 
                          ? order.rooms.map(r => r.roomCode).join(' + ') 
                          : order.roomCode}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 block font-black">تاريخ التعاقد:</span>
                        <span className="font-bold text-slate-700">{order.contractDate}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 block font-black">تاريخ الاستلام:</span>
                        <span className="font-bold text-slate-700">{order.deliveryDate || 'غير محدد'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                      <span className="font-black text-slate-500">القيمة الإجمالية:</span>
                      <span className="font-black text-indigo-700">{order.totalAmount?.toLocaleString() || 0} ج.م</span>
                    </div>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/20 flex flex-wrap gap-2 justify-between">
                  <Button 
                    variant="outline" 
                    className="flex-1 font-bold text-[11px] h-9"
                    onClick={() => onViewOrder(order)}
                  >
                    <Eye size={13} className="ml-1" />
                    عرض وطباعة
                  </Button>

                  <div className="flex gap-1">
                    <button
                      title="تحويل لمستند استلام للعميل"
                      onClick={() => onConvertToDeliveryReceipt(order)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 border border-slate-100 rounded-lg"
                    >
                      <FileText size={14} />
                    </button>
                    <button
                      title="تحويل لحمولة سيارة"
                      onClick={() => onConvertToLoadingManifest(order)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 border border-slate-100 rounded-lg"
                    >
                      <Truck size={14} />
                    </button>
                    <button
                      title="تعديل"
                      onClick={() => onEditOrder(order)}
                      className="p-2 text-slate-500 hover:bg-slate-100 border border-slate-100 rounded-lg"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      title="حذف"
                      onClick={() => onDeleteOrder(order.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 border border-slate-100 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
