import React, { useState, useMemo } from 'react';
import { Customer, FurnitureWorkOrder, CustomerPayment, Safe } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from './ui/WorkOrderCardUI';
import { Search, DollarSign, ClipboardList, Eye, CreditCard } from 'lucide-react';

interface WorkOrderCustomerAccountsProps {
  customers: Customer[];
  workOrders: FurnitureWorkOrder[];
  customerPayments: CustomerPayment[];
  safes: Safe[];
  onOpenPaymentModal: (customerId?: string) => void;
  onViewOrder: (order: FurnitureWorkOrder) => void;
  onConvertToDeliveryReceipt: (order: FurnitureWorkOrder) => void;
  onConvertToLoadingManifest: (order: FurnitureWorkOrder) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export function WorkOrderCustomerAccounts({
  customers,
  workOrders,
  customerPayments,
  safes,
  onOpenPaymentModal,
  onViewOrder,
  onConvertToDeliveryReceipt,
  onConvertToLoadingManifest,
  getStatusBadge
}: WorkOrderCustomerAccountsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);

  const customerLedgers = useMemo(() => {
    return customers.map(customer => {
      const orders = workOrders.filter(o => o.customerId === customer.id);
      const payments = customerPayments.filter(p => p.customerId === customer.id);
      
      const totalOrdersValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const remainingAmount = totalOrdersValue - totalPaid;

      return {
        customer,
        orders,
        payments,
        totalOrdersValue,
        totalPaid,
        remainingAmount
      };
    });
  }, [customers, workOrders, customerPayments]);

  const activeLedger = useMemo(() => {
    if (!selectedCustomer) return customerLedgers[0] || null;
    return customerLedgers.find(l => l.customer.id === selectedCustomer.id) || null;
  }, [selectedCustomer, customerLedgers]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customers List Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-slate-50/50 py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black text-slate-800">قائمة حسابات العملاء</CardTitle>
              <CardDescription className="font-bold text-[11px] text-slate-500">اختر العميل لاستعراض حساب تفصيلي كامل لأمر الشغل</CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => onOpenPaymentModal(selectedCustomer?.id)}
              className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs font-black"
            >
              <DollarSign size={13} className="ml-1" /> سداد عربون/دفعة
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث عن العميل..."
                className="w-full pr-8 pl-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
              {customerLedgers
                .filter(ledger => ledger.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(ledger => {
                  const isActive = selectedCustomer?.id === ledger.customer.id;
                  return (
                    <div
                      key={ledger.customer.id}
                      onClick={() => setSelectedCustomer(ledger.customer)}
                      className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                        isActive 
                          ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' 
                          : 'border-slate-100 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-black text-slate-800 text-xs">{ledger.customer.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ledger.customer.phone}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 text-center font-bold">
                        <div>
                          <span>إجمالي التعاقدات</span>
                          <span className="block text-slate-800 font-black mt-0.5">{ledger.totalOrdersValue?.toLocaleString() || 0} ج.م</span>
                        </div>
                        <div>
                          <span>العربون والمسدد</span>
                          <span className="block text-emerald-700 font-black mt-0.5">{ledger.totalPaid?.toLocaleString() || 0} ج.م</span>
                        </div>
                        <div>
                          <span>المتبقي لسه كام</span>
                          <span className={`block font-black mt-0.5 ${ledger.remainingAmount > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                            {ledger.remainingAmount?.toLocaleString() || 0} ج.م
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Detailed View */}
      <div className="lg:col-span-2 space-y-6">
        {activeLedger ? (
          <div className="space-y-6">
            {/* Ledger Header */}
            <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-950 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="bg-indigo-800 text-indigo-200 text-[10px] font-black px-2.5 py-1 rounded-full">كشف حساب فني ومالي كامل 🧾</span>
                    <h3 className="text-lg font-black text-white mt-2">{activeLedger.customer.name}</h3>
                    <p className="text-indigo-300 text-xs font-bold mt-1">رقم الهاتف: {activeLedger.customer.phone} | العنوان: {activeLedger.customer.address || 'غير مسجل'}</p>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/5 text-center min-w-[100px]">
                      <span className="text-[10px] text-indigo-200 font-bold block">إجمالي القيمة</span>
                      <span className="text-sm font-black text-white block mt-1">{activeLedger.totalOrdersValue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center min-w-[100px]">
                      <span className="text-[10px] text-emerald-300 font-bold block">المسدد (العربون)</span>
                      <span className="text-sm font-black text-emerald-400 block mt-1">{activeLedger.totalPaid?.toLocaleString() || 0}</span>
                    </div>
                    <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-center min-w-[100px]">
                      <span className="text-[10px] text-rose-300 font-bold block">لسه كام (المتبقي)</span>
                      <span className="text-sm font-black text-rose-400 block mt-1">{activeLedger.remainingAmount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card className="border-none shadow-sm">
              <CardHeader className="bg-slate-50/50 py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <ClipboardList size={16} className="text-indigo-600" /> أوامر تشغيل العميل الحالي ({activeLedger.orders.length})
                </CardTitle>
                <span className="text-xs font-bold text-slate-500">انقر للتحويل المباشر لمحاضر استلام أو سيارات الشحن</span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-black">
                        <th className="p-3">رقم أمر الشغل</th>
                        <th className="p-3">تاريخ التعاقد / الاستلام</th>
                        <th className="p-3">الغرف المشمولة</th>
                        <th className="p-3">قيمة الأمر</th>
                        <th className="p-3">حالة التشغيل</th>
                        <th className="p-3 text-center">خيارات سريعة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLedger.orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-400 font-bold">لا توجد أوامر شغل مسجلة لهذا العميل.</td>
                        </tr>
                      ) : (
                        activeLedger.orders.map(order => (
                          <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 font-bold text-slate-800">
                            <td className="p-3 font-mono font-black">{order.orderNumber}</td>
                            <td className="p-3">
                              <span>تعاقد: {order.contractDate}</span>
                              <span className="block text-[10px] text-slate-400">استلام: {order.deliveryDate || 'غير محدد'}</span>
                            </td>
                            <td className="p-3 max-w-[200px] truncate">
                              {order.rooms && order.rooms.length > 0 
                                ? order.rooms.map(r => r.roomCode).join(' + ') 
                                : order.roomCode}
                            </td>
                            <td className="p-3 font-black text-indigo-700">{order.totalAmount?.toLocaleString() || 0} ج.م</td>
                            <td className="p-3">{getStatusBadge(order.status)}</td>
                            <td className="p-3 flex items-center justify-center gap-1.5">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => onViewOrder(order)}
                                title="عرض وطباعة كارت التشغيل"
                              >
                                <Eye size={12} className="ml-1" /> كارت
                              </Button>
                              <button
                                onClick={() => onConvertToDeliveryReceipt(order)}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black hover:bg-indigo-100"
                              >
                                محضر استلام 📄
                              </button>
                              <button
                                onClick={() => onConvertToLoadingManifest(order)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black hover:bg-emerald-100"
                              >
                                شحن 🚚
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Payments Table */}
            <Card className="border-none shadow-sm">
              <CardHeader className="bg-slate-50/50 py-4 px-6 border-b border-slate-100">
                <CardTitle className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <CreditCard size={16} className="text-emerald-600" /> سجل مدفوعات العميل وعرابينه ({activeLedger.payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-black">
                        <th className="p-3">تاريخ الدفع</th>
                        <th className="p-3">المبلغ المسدد</th>
                        <th className="p-3">الخزنة المستلمة</th>
                        <th className="p-3">طريقة الدفع</th>
                        <th className="p-3">ملاحظات القبض</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLedger.payments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-slate-400 font-bold">لا توجد دفعة مسددة حتى الآن.</td>
                        </tr>
                      ) : (
                        activeLedger.payments.map(payment => {
                          const safe = safes.find(s => s.id === payment.safeId);
                          return (
                            <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50 font-bold text-slate-800">
                              <td className="p-3">{payment.date}</td>
                              <td className="p-3 font-black text-emerald-600">{payment.amount?.toLocaleString()} ج.م</td>
                              <td className="p-3">{safe ? safe.name : 'خزنة رئيسية'}</td>
                              <td className="p-3">{payment.paymentMethod || 'نقدي'}</td>
                              <td className="p-3 text-slate-500">{payment.notes || '-'}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-[14px] border border-slate-100 text-slate-400 font-bold">
            الرجاء اختيار عميل من القائمة الجانبية لعرض كشف حسابه.
          </div>
        )}
      </div>
    </div>
  );
}
