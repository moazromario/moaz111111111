import React from 'react';
import { FurnitureWorkOrder, CustomerPayment } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/WorkOrderCardUI';
import { DollarSign, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface WorkOrderAnalyticsHubProps {
  workOrders: FurnitureWorkOrder[];
  customerPayments: CustomerPayment[];
  productionRooms: any[];
}

const arabicMonthNames: { [key: string]: string } = {
  '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
  '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
  '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
};

export function WorkOrderAnalyticsHub({
  workOrders,
  customerPayments,
  productionRooms
}: WorkOrderAnalyticsHubProps) {
  const totalContractValue = workOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCollected = customerPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRemaining = totalContractValue - totalCollected;
  
  const totalFinishedRooms = productionRooms.filter(r => 
    r.status === 'جاهز للتسليم' || r.status === 'في المخزن تام التشطيب' || r.status === 'سلم للعميل'
  ).length;

  const completionPercentage = productionRooms.length > 0 
    ? Math.round((totalFinishedRooms / productionRooms.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200" dir="rtl">
      {/* Financial and Production KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-[14px] p-5 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-black uppercase opacity-80 tracking-wider block">القيمة الإجمالية للتعاقدات</span>
          <span className="text-2xl font-black block mt-2 font-mono">
            {totalContractValue.toLocaleString()} ج.م
          </span>
          <p className="text-[10px] opacity-80 mt-2 font-bold">بمعدل {workOrders.length} أمر تشغيل كامل بالسيستم</p>
          <DollarSign size={80} className="absolute -bottom-4 -left-4 opacity-10" />
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-[14px] p-5 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-black uppercase opacity-80 tracking-wider block">إجمالي المقبوضات والعرابين</span>
          <span className="text-2xl font-black block mt-2 font-mono">
            {totalCollected.toLocaleString()} ج.م
          </span>
          <p className="text-[10px] opacity-80 mt-2 font-bold">نسبة المقبوض: {Math.round((totalCollected / (totalContractValue || 1)) * 100)}% من التعاقدات</p>
          <CheckCircle2 size={80} className="absolute -bottom-4 -left-4 opacity-10" />
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-[14px] p-5 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-black uppercase opacity-80 tracking-wider block">إجمالي المتبقي المستحق للتحصيل</span>
          <span className="text-2xl font-black block mt-2 font-mono">
            {totalRemaining.toLocaleString()} ج.م
          </span>
          <p className="text-[10px] opacity-80 mt-2 font-bold">مستحقات معلقة بانتظار تسليم المنتجات التامة</p>
          <AlertCircle size={80} className="absolute -bottom-4 -left-4 opacity-10" />
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-[14px] p-5 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-black uppercase opacity-80 tracking-wider block">نسبة الإنجاز الفني العام بالورش</span>
          <span className="text-2xl font-black block mt-2 font-mono">
            {completionPercentage}%
          </span>
          <p className="text-[10px] opacity-80 mt-2 font-bold">بمعدل {totalFinishedRooms} بند تام من أصل {productionRooms.length}</p>
          <Layers size={80} className="absolute -bottom-4 -left-4 opacity-10" />
        </div>
      </div>

      {/* Visual Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Workshop Production Status */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-700 uppercase tracking-wider">توزيع أحمال الأخشاب والتنجيد والدهان بالورش الحالية</CardTitle>
            <CardDescription className="text-[10px] text-slate-400 font-bold">عدد الغرف والبنود النشطة في كل ورشة (مركز تكلفة)</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'النجارة والقطع', العدد: productionRooms.filter(r => r.status === 'بانتظار التعميد' || r.status === 'نجارة').length },
                  { name: 'الدهان والرش', العدد: productionRooms.filter(r => r.status === 'دهان' || r.status === 'قيد الدهان').length },
                  { name: 'التنجيد والفرش', العدد: productionRooms.filter(r => r.status === 'تنجيد' || r.status === 'تنجيد وتفصيل').length },
                  { name: 'التجميع والتشطيب', العدد: productionRooms.filter(r => r.status === 'تجميع').length },
                  { name: 'المخزن تام التشطيب', العدد: productionRooms.filter(r => r.status === 'جاهز للتسليم' || r.status === 'في المخزن تام التشطيب').length }
                ]}
              >
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontFamily: 'sans-serif', fontSize: '12px' }} />
                <Bar dataKey="العدد" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Sales Representatives Performance */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-700 uppercase tracking-wider">مبيعات مناديب المبيعات (السيلز) ومسؤولي العلاقات</CardTitle>
            <CardDescription className="text-[10px] text-slate-400 font-bold">توزيع القيم المالية لأوامر الشغل حسب المندوب المسؤول</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[260px] flex flex-col justify-between">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(() => {
                      const salesMap: { [key: string]: number } = {};
                      workOrders.forEach(o => {
                        const sales = o.salesPerson || 'غير مسند';
                        salesMap[sales] = (salesMap[sales] || 0) + (o.totalAmount || 0);
                      });
                      return Object.entries(salesMap).map(([name, value]) => ({ name, value }));
                    })()}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map((color, idx) => (
                      <Cell key={`cell-${idx}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()} ج.م`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-[10px] font-bold text-slate-600 pt-2">
              {Object.entries(
                workOrders.reduce((acc: { [key: string]: number }, o) => {
                  const sp = o.salesPerson || 'غير مسند';
                  acc[sp] = (acc[sp] || 0) + (o.totalAmount || 0);
                  return acc;
                }, {})
              ).map(([name, value], i) => (
                <div key={name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5] }}></span>
                  <span>{name}: {value.toLocaleString()} ج.م</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Month over Month Billing Performance */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-700 uppercase tracking-wider">نمو التعاقدات والأوردرات الشهرية (خط زمني للأرشيف)</CardTitle>
            <CardDescription className="text-[10px] text-slate-400 font-bold">مجموع قيم أوامر الشغل والبنود المفتوحة عبر الشهور</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={(() => {
                  const monthTotals: { [key: string]: number } = {};
                  workOrders.forEach(o => {
                    let k = 'غير مصنف';
                    if (o.contractDate && o.contractDate.includes('-')) {
                      const parts = o.contractDate.split('-');
                      const monthNum = parts[1];
                      const yearNum = parts[0];
                      const monthAr = arabicMonthNames[monthNum] || monthNum;
                      k = `${monthAr} ${yearNum}`;
                    }
                    monthTotals[k] = (monthTotals[k] || 0) + (o.totalAmount || 0);
                  });
                  return Object.entries(monthTotals).map(([month, total]) => ({ month, total }));
                })()}
              >
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} ج.م`} />
                <Line type="monotone" dataKey="total" name="المبيعات والتعاقدات" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
