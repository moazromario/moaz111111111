import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui/WorkOrderCardUI';
import { Truck, Plus, Printer, Trash2, FileText } from 'lucide-react';

interface WorkOrderShippingHubProps {
  loadingManifests: any[];
  deliveryReceipts: any[];
  onShowManifestModal: () => void;
  onPrintManifest: (manifest: any) => void;
  onDeleteManifest: (id: string) => void;
  onPrintReceipt: (receipt: any) => void;
}

export function WorkOrderShippingHub({
  loadingManifests,
  deliveryReceipts,
  onShowManifestModal,
  onPrintManifest,
  onDeleteManifest,
  onPrintReceipt
}: WorkOrderShippingHubProps) {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Action Control */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-[14px] border border-slate-100 shadow-sm">
        <div>
          <h3 className="font-black text-slate-800 text-sm">🚚 تخطيط حركة الشحن وتحميل السيارات والسائقين</h3>
          <p className="text-xs text-slate-500 font-bold mt-0.5">اصنع بيان حمولة السيارة متضمناً قائمة الغرف والمنتجات الجاهزة والمسافر مع السائق للمحافظات أو المعارض.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onShowManifestModal} className="bg-sky-600 hover:bg-sky-700 shadow-sky-50 text-xs font-black">
            <Plus size={16} className="ml-1.5" />
            تحميل سيارة شحن جديدة 🚚
          </Button>
        </div>
      </div>

      {/* Historical Manifests List */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-1">
            <span>📦 أرشيف بيانات حمولات السيارات المؤرشفة للمحافظات والمعارض</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loadingManifests.length === 0 ? (
            <div className="text-center py-16 bg-white">
              <Truck size={48} className="mx-auto text-slate-300 mb-4 animate-pulse" />
              <h4 className="font-black text-slate-800 text-sm">لا توجد بيانات حمولة مسجلة</h4>
              <p className="text-slate-500 font-bold text-xs mt-2">انقر على زر "تحميل سيارة شحن جديدة" لتوثيق حمولة السائقين وطباعتها فوراً.</p>
            </div>
          ) : (
            <table className="w-full text-right border-collapse text-xs min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 font-black text-slate-600 border-b border-slate-100">
                  <th className="p-3">تاريخ الحمولة</th>
                  <th className="p-3">اسم السائق والسيارة</th>
                  <th className="p-3">العملاء والأوردرات بالحملة</th>
                  <th className="p-3">مسؤول التحميل</th>
                  <th className="p-3">ملاحظات خط السير</th>
                  <th className="p-3">عدد البنود المشحونة</th>
                  <th className="p-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {loadingManifests.map(manifest => {
                  const clientList = manifest.distinctClients || Array.from(new Set(manifest.items?.map((i: any) => i.customerName).filter(Boolean))) || (manifest.clientName ? [manifest.clientName] : []);
                  const orderList = manifest.distinctOrders || Array.from(new Set(manifest.items?.map((i: any) => i.orderNumber).filter(Boolean))) || (manifest.orderNumbers ? [manifest.orderNumbers] : []);

                  return (
                    <tr key={manifest.id} className="border-b border-slate-50 hover:bg-slate-50/50 font-bold text-slate-700">
                      <td className="p-3 font-mono">{manifest.date}</td>
                      <td className="p-3 font-black text-slate-800">
                        <div>{manifest.driverName}</div>
                        <span className="text-[10px] text-slate-400 font-mono block">🚗 {manifest.carNumber}</span>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <span className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-md font-black text-[10px] inline-block">
                            👥 {clientList.length > 0 ? clientList.join('، ') : 'عملاء متعددين'}
                          </span>
                          {orderList.length > 0 && (
                            <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-md text-[10px] block w-max">
                              📄 الأوامر: {orderList.join('، ')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{manifest.loaderName || '-'}</td>
                      <td className="p-3 text-slate-500 max-w-[200px] truncate">{manifest.notes || '-'}</td>
                      <td className="p-3">
                        <span className="bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-sky-100">
                          {manifest.items?.length || 0} غرف وبنود
                        </span>
                      </td>
                      <td className="p-3 text-center flex gap-1.5 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-black border-sky-200 text-sky-700 hover:bg-sky-50"
                          onClick={() => onPrintManifest(manifest)}
                        >
                          <Printer size={12} className="ml-1" />
                          طباعة 🖨️
                        </Button>
                        <button
                          onClick={() => onDeleteManifest(manifest.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Historical Delivery Receipts List */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <span>🧾 أرشيف محاضر الاستلام المعتمدة (الفردية والمجمعة)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {deliveryReceipts.length === 0 ? (
            <div className="text-center py-12 bg-white">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <h4 className="font-black text-slate-800 text-sm">لا توجد محاضر استلام معتمدة بعد</h4>
              <p className="text-slate-500 font-bold text-xs mt-2">محاضر الاستلام الفردية أو المجمعة التي تصدرها للعملاء ستظهر هنا لتتمكن من طباعتها في أي وقت.</p>
            </div>
          ) : (
            <table className="w-full text-right border-collapse text-xs min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 font-black text-slate-600 border-b border-slate-100 font-bold">
                  <th className="p-3">رقم المحضر</th>
                  <th className="p-3">تاريخ الاستلام</th>
                  <th className="p-3">اسم العميل</th>
                  <th className="p-3">أرقام أوامر الشغل المشمولة</th>
                  <th className="p-3 text-center">التقييم الفني</th>
                  <th className="p-3 text-center">عدد البنود</th>
                  <th className="p-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {deliveryReceipts.map(receipt => (
                  <tr key={receipt.id} className="border-b border-slate-50 hover:bg-slate-50/50 font-bold text-slate-700">
                    <td className="p-3 font-mono font-black text-indigo-700">{receipt.receiptNumber}</td>
                    <td className="p-3 font-mono">{receipt.date}</td>
                    <td className="p-3 font-black text-slate-800">{receipt.clientName}</td>
                    <td className="p-3 font-mono text-slate-500">{receipt.orderNumber}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-black">
                        ⭐ {receipt.productRating || 'ممتاز'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-black">
                        {receipt.products?.length || 1} بنود
                      </span>
                    </td>
                    <td className="p-3 text-center flex gap-1.5 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-black border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={() => onPrintReceipt(receipt)}
                      >
                        <Printer size={12} className="ml-1" />
                        طباعة 🖨️
                      </Button>
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
