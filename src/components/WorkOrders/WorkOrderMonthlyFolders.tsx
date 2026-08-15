import React, { useMemo } from 'react';
import { FurnitureWorkOrder } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/WorkOrderCardUI';
import { ClipboardList } from 'lucide-react';

interface WorkOrderMonthlyFoldersProps {
  workOrders: FurnitureWorkOrder[];
  onViewOrder: (order: FurnitureWorkOrder) => void;
}

export function WorkOrderMonthlyFolders({ workOrders, onViewOrder }: WorkOrderMonthlyFoldersProps) {
  const monthlyFolders = useMemo(() => {
    const folders: Record<string, Record<string, { totalAmount: number; orders: FurnitureWorkOrder[] }>> = {};

    workOrders.forEach(order => {
      let folderKey = 'مجلدات عامة غير محددة';
      if (order.contractDate) {
        const [year, month] = order.contractDate.split('-');
        folderKey = `تعاقدات شهر ${month} لسنة ${year}`;
      }

      if (!folders[folderKey]) {
        folders[folderKey] = {};
      }

      const clientName = order.customerName || 'عميل نقدي';
      if (!folders[folderKey][clientName]) {
        folders[folderKey][clientName] = { totalAmount: 0, orders: [] };
      }

      folders[folderKey][clientName].orders.push(order);
      folders[folderKey][clientName].totalAmount += (order.totalAmount || 0);
    });

    return folders;
  }, [workOrders]);

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-slate-50 pb-4 border-b border-slate-100">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <span>📂 نظام المجلدات الشهرية لتعاقدات العملاء</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 font-bold mt-1">
            تصفح الأرشيف حسب الشهور والسنوات. يتلخص كل شهر في عدد العملاء، أوامرهم، ومجموع مبيعاتهم.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {Object.keys(monthlyFolders).length === 0 ? (
            <div className="text-center py-16 bg-white">
              <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold">لا توجد أوامر شغل حالياً لفرزها في مجلدات شهرية.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(monthlyFolders).map(([folderName, clientMap]) => {
                const clientsCount = Object.keys(clientMap).length;
                const totalFolderAmount = Object.values(clientMap).reduce((sum, item) => sum + item.totalAmount, 0);
                const totalFolderOrders = Object.values(clientMap).reduce((sum, item) => sum + item.orders.length, 0);
                
                return (
                  <Card key={folderName} className="border border-slate-100 hover:shadow-lg transition-all overflow-hidden duration-200 bg-white">
                    <div className="p-5 bg-gradient-to-r from-sky-50 to-indigo-50/20 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">📂</span>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{folderName}</h4>
                          <p className="text-[10px] text-indigo-600 font-black mt-0.5">{clientsCount} عميل متعاقد</p>
                        </div>
                      </div>
                      <span className="bg-white/80 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl text-[10px] font-black font-mono">
                        {totalFolderOrders} أمر شغل
                      </span>
                    </div>
                    
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                        <span>إجمالي المبيعات المؤرشفة:</span>
                        <span className="font-black text-indigo-700 text-sm">{totalFolderAmount.toLocaleString()} ج.م</span>
                      </div>

                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        {Object.entries(clientMap).slice(0, 5).map(([cName, cData]) => (
                          <div key={cName} className="p-2 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{cName} ({cData.orders.length} أمر)</span>
                            <span className="font-black text-indigo-600">{cData.totalAmount.toLocaleString()} ج.م</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
