import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Showroom, TransferOrder, SalesOrder, ProductionJob } from '../types';

interface SalesModuleProps {
  showrooms: Showroom[];
  transferOrders: TransferOrder[];
  salesOrders: SalesOrder[];
  productionJobs: ProductionJob[];
}

export function SalesModule({ showrooms, transferOrders, salesOrders, productionJobs }: SalesModuleProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'transfers' | 'sales'>('inventory');
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [commission, setCommission] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState('');

  const selectedJob = productionJobs.find(job => job.id === selectedJobId);
  const cogs = selectedJob ? (selectedJob.totalMaterialCost || 0) + (selectedJob.totalLaborCost || 0) + (selectedJob.totalOtherCost || 0) : 0;
  
  const overheadRate = 0.15; // نسبة ثابتة مبدئياً للمصاريف الإدارية
  const totalOverhead = sellingPrice * overheadRate;
  const netProfit = sellingPrice - cogs - logisticsCost - commission - totalOverhead;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">المبيعات والمعارض</h2>
          <p className="text-slate-500 font-medium">الربط الديناميكي بين المصنع والمعارض</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <Button variant={activeTab === 'inventory' ? 'default' : 'ghost'} onClick={() => setActiveTab('inventory')} className="rounded-lg">مخزون المعارض</Button>
            <Button variant={activeTab === 'transfers' ? 'default' : 'ghost'} onClick={() => setActiveTab('transfers')} className="rounded-lg">أوامر التحويل</Button>
            <Button variant={activeTab === 'sales' ? 'default' : 'ghost'} onClick={() => setActiveTab('sales')} className="rounded-lg">المبيعات</Button>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/50">
           <CardHeader><CardTitle>مخزون المعارض (بالتكلفة الحقيقية)</CardTitle></CardHeader>
           <CardContent>
              <p className="text-slate-500">لائحة المنتجات المتاحة في المعارض مع تكلفتها المسجلة...</p>
           </CardContent>
        </Card>
      )}
      
      {activeTab === 'transfers' && (
        <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/50">
           <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle>أوامر التحويل من المصنع</CardTitle>
             <Button className="font-black bg-emerald-600 hover:bg-emerald-700">تحويل جديد (بالتكلفة)</Button>
           </CardHeader>
           <CardContent>
              <p className="text-slate-500">سجل عمليات تحويل الأثاث للمعارض...</p>
           </CardContent>
        </Card>
      )}

      {activeTab === 'sales' && (
        <div className="space-y-4">
            <Button onClick={() => setIsAddingSale(!isAddingSale)} className="font-black">
                {isAddingSale ? 'إلغاء' : 'تسجيل بيع جديد'}
            </Button>
            
            {isAddingSale && (
                <Card className="p-6 rounded-3xl">
                    <h3 className="font-black text-lg mb-4">بيانات أمر البيع (حساب دقيق للأرباح)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <select onChange={(e) => setSelectedJobId(e.target.value)} className="p-2 border rounded-lg">
                            <option value="">اختر المنتج (أمر الإنتاج)...</option>
                            {productionJobs.map(job => <option key={job.id} value={job.id}>{job.productName} ({job.orderNo})</option>)}
                        </select>
                        <Input type="number" placeholder="سعر البيع" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} />
                        <Input type="number" placeholder="مصاريف النقل والتركيب" value={logisticsCost} onChange={(e) => setLogisticsCost(Number(e.target.value))} />
                        <Input type="number" placeholder="عمولة السيلز" value={commission} onChange={(e) => setCommission(Number(e.target.value))} />
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl grid grid-cols-2 gap-4 text-sm font-medium">
                        <div>التكلفة المباشرة (COGS): {cogs.toLocaleString()}</div>
                        <div>المصروفات الإدارية ({overheadRate * 100}%): {totalOverhead.toLocaleString()}</div>
                        <div className="text-lg font-black text-emerald-600 col-span-2">صافي الربح المتوقع: {netProfit.toLocaleString()}</div>
                    </div>
                    <Button className="w-full mt-4 font-black">حفظ أمر البيع</Button>
                </Card>
            )}
            
            <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/50">
               <CardHeader><CardTitle>سجل المبيعات</CardTitle></CardHeader>
               <CardContent>
                  <p className="text-slate-500">جميع الفواتير مع الربح الصافي لكل عملية...</p>
               </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}