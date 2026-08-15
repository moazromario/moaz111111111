import React from 'react';
import { FurnitureWorkOrder } from '../../types';

interface WorkOrderPrintTemplatesProps {
  viewingOrder: FurnitureWorkOrder | null;
  filteredOrders: FurnitureWorkOrder[];
  printingRoom: {
    orderNumber: string;
    customerName: string;
    roomCode: string;
    deliveryDate?: string;
    dimensionsAndStructure?: string;
    paintSpecs?: string;
    upholsterySpecs?: string;
    generalSpecs?: string;
  } | null;
  selectedManifestForPrint: any | null;
  selectedReceiptForPrint: any | null;
  selectedDeliveryLogForPrint: any | null;
}

export function WorkOrderPrintTemplates({
  viewingOrder,
  filteredOrders,
  printingRoom,
  selectedManifestForPrint,
  selectedReceiptForPrint,
  selectedDeliveryLogForPrint
}: WorkOrderPrintTemplatesProps) {
  return (
    <>
      {/* 1. Single Work Order Detail Print Template */}
      {viewingOrder && (
        <div id="print-area" className="hidden print:block p-6 bg-white min-h-[800px] font-sans text-right dir-rtl" dir="rtl">
          <div className="text-center border-b-2 border-black pb-4 mb-6 relative">
            <h1 className="text-4xl font-black text-black">أمر تشغـــــــــــــــــــــيل فني وإنتاجي</h1>
            <p className="text-xs text-slate-500 font-bold mt-1">Ref: {viewingOrder.orderNumber} | تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400 flex items-center justify-center rounded-lg font-serif text-3xl font-bold text-white shadow-lg">
              A
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-base font-bold border-b border-black pb-4 mb-6 leading-loose">
            <div>
              <span className="underline decoration-2 underline-offset-4">اسم العميل</span> : <span className="text-blue-700">{viewingOrder.customerName}</span>
            </div>
            <div>
              <span className="underline decoration-2 underline-offset-4">تاريخ التعاقد</span> : <span className="text-blue-700">{viewingOrder.contractDate}</span>
            </div>
            <div>
              <span className="underline decoration-2 underline-offset-4">تاريخ الاستلام</span> : <span className="text-blue-700">{viewingOrder.deliveryDate || '...................'}</span>
            </div>
            {viewingOrder.salesPerson && (
              <div>
                <span className="underline decoration-2 underline-offset-4">مسؤول المبيعات (السيلز)</span> : <span className="text-violet-700">{viewingOrder.salesPerson}</span>
              </div>
            )}
            <div>
              <span className="underline decoration-2 underline-offset-4">حالة الطلب الإجمالية</span> : <span className="text-emerald-700">{viewingOrder.status}</span>
            </div>
            <div>
              <span className="underline decoration-2 underline-offset-4">مجموع القيمة</span> : <span className="text-indigo-700">{(viewingOrder.totalAmount || 0).toLocaleString()} ج.م</span>
            </div>
          </div>

          {viewingOrder.attachmentImage && (
            <div className="mb-6 p-4 border border-slate-200 rounded-[14px] flex flex-col items-center">
              <h4 className="text-sm font-black text-slate-700 mb-2 underline">مستند مرفق لأمر التشغيل (رسم أو كارت الشغل الأصلي)</h4>
              <img 
                src={viewingOrder.attachmentImage} 
                alt="Work Order" 
                className="max-h-96 object-contain rounded-xl border border-slate-100"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-2xl font-black underline decoration-4 underline-offset-4 mb-4 inline-block">تفاصيل الغرف والبنود المتعددة المطلوبة:</h3>
            
            {viewingOrder.rooms && viewingOrder.rooms.length > 0 ? (
              viewingOrder.rooms.map((room, index) => (
                <div key={index} className="p-4 border-2 border-black rounded-xl mb-4 space-y-3 page-break-inside-avoid">
                  <div className="bg-slate-100 p-2 rounded-lg font-black text-lg border-b border-black">
                    البند #{index + 1}: {room.roomCode} | الحالة: {room.status}
                  </div>

                  {room.generalSpecs && (
                    <div>
                      <span className="font-black text-slate-800 underline block text-sm">المواصفات العامة:</span>
                      <p className="text-blue-700 font-bold text-base whitespace-pre-line leading-relaxed">{room.generalSpecs}</p>
                    </div>
                  )}

                  {room.dimensionsAndStructure && (
                    <div>
                      <span className="font-black text-slate-800 underline block text-sm">التفاصيل الفنية (النجارة والتقسيم الداخلي):</span>
                      <p className="text-red-600 font-bold text-base whitespace-pre-line leading-relaxed">{room.dimensionsAndStructure}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {room.paintSpecs && (
                      <div>
                        <span className="font-black text-slate-800 underline block text-sm">الدهانات والرش المطلوبة:</span>
                        <p className="text-slate-800 font-bold text-sm whitespace-pre-line leading-relaxed">{room.paintSpecs}</p>
                      </div>
                    )}
                    {room.upholsterySpecs && (
                      <div>
                        <span className="font-black text-slate-800 underline block text-sm">التنجيد والفرش والأقمشة:</span>
                        <p className="text-slate-800 font-bold text-sm whitespace-pre-line leading-relaxed">{room.upholsterySpecs}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4">
                {viewingOrder.generalSpecs && (
                  <div className="p-4 border border-black rounded-xl">
                    <h4 className="font-black text-slate-800">المواصفات العامة:</h4>
                    <p className="text-blue-700 font-bold text-base whitespace-pre-line leading-relaxed">{viewingOrder.generalSpecs}</p>
                  </div>
                )}
                {viewingOrder.dimensionsAndStructure && (
                  <div className="p-4 border border-black rounded-xl">
                    <h4 className="font-black text-red-600">التفاصيل والمقاسات (نجارة):</h4>
                    <p className="text-red-600 font-bold text-base whitespace-pre-line leading-relaxed">{viewingOrder.dimensionsAndStructure}</p>
                  </div>
                )}
                {viewingOrder.paintSpecs && (
                  <div className="p-4 border border-black rounded-xl">
                    <h4 className="font-black text-slate-800">الدهان:</h4>
                    <p className="text-slate-800 font-bold text-sm whitespace-pre-line leading-relaxed">{viewingOrder.paintSpecs}</p>
                  </div>
                )}
                {viewingOrder.upholsterySpecs && (
                  <div className="p-4 border border-black rounded-xl">
                    <h4 className="font-black text-slate-800">التنجيد:</h4>
                    <p className="text-slate-800 font-bold text-sm whitespace-pre-line leading-relaxed">{viewingOrder.upholsterySpecs}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {viewingOrder.notes && (
            <div className="mt-6 p-4 border border-dashed border-black rounded-xl">
              <span className="font-black text-slate-800 block">شروط أو ملاحظات تسليم عامة:</span>
              <p className="font-bold text-slate-700 whitespace-pre-line leading-relaxed">{viewingOrder.notes}</p>
            </div>
          )}

          <div className="mt-20 flex justify-between items-end text-lg font-black px-12">
            <div className="text-center">
              <p className="mb-8">العميل</p>
              <p className="text-slate-400">.......................</p>
            </div>
            <div className="text-center">
              <p className="mb-8">يعتمد / مدير الإنتاج</p>
              <p className="text-slate-400">.......................</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Filtered Work Orders List Print Template */}
      <div id="print-list-area" className="hidden print:block p-6 bg-white min-h-[800px] font-sans text-right dir-rtl" dir="rtl">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-black text-black">تقرير فرز وتتبع أوامر التشغيل والإنتاج</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')} | عدد الأوامر: {filteredOrders.length}</p>
        </div>

        <table className="w-full text-right border-collapse text-xs border border-black">
          <thead>
            <tr className="bg-slate-100 text-black border-b border-black font-black">
              <th className="p-2 border border-black">رقم الأمر</th>
              <th className="p-2 border border-black">اسم العميل</th>
              <th className="p-2 border border-black">مسؤول المبيعات</th>
              <th className="p-2 border border-black">الغرف المشمولة</th>
              <th className="p-2 border border-black">تاريخ التعاقد</th>
              <th className="p-2 border border-black">تاريخ الاستلام</th>
              <th className="p-2 border border-black">القيمة</th>
              <th className="p-2 border border-black">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="border-b border-black font-bold">
                <td className="p-2 border border-black font-mono font-black">{order.orderNumber}</td>
                <td className="p-2 border border-black">{order.customerName}</td>
                <td className="p-2 border border-black">{order.salesPerson || '-'}</td>
                <td className="p-2 border border-black">
                  {order.rooms && order.rooms.length > 0 
                    ? order.rooms.map(r => r.roomCode).join(' + ') 
                    : order.roomCode}
                </td>
                <td className="p-2 border border-black">{order.contractDate}</td>
                <td className="p-2 border border-black">{order.deliveryDate || 'غير محدد'}</td>
                <td className="p-2 border border-black">{(order.totalAmount || 0).toLocaleString()} ج.م</td>
                <td className="p-2 border border-black">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end gap-6 text-sm font-black">
          <div>
            <span>إجمالي قيمة الأوامر المفلترة:</span>
            <span className="underline block text-lg">{filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>

      {/* 3. Room Workshop Ticket Print */}
      {printingRoom && (
        <div id="print-room-card-area" className="hidden print:block p-6 bg-white min-h-[800px] font-sans text-right dir-rtl" dir="rtl">
          <div className="text-center border-b-4 border-black pb-4 mb-6">
            <h1 className="text-3xl font-black text-black">كارت تشغيل الورشة الفني 🏭</h1>
            <p className="text-sm text-slate-600 font-black mt-1">رقم أمر الشغل: {printingRoom.orderNumber} | العميل: {printingRoom.customerName}</p>
            <p className="text-xs text-slate-500 font-mono mt-1">تاريخ الاستلام المطلوب: {printingRoom.deliveryDate || 'غير محدد'}</p>
          </div>

          <div className="bg-slate-100 p-4 border-2 border-black rounded-xl mb-6 text-center">
            <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">البند المطلوب تصنيعه</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">{printingRoom.roomCode}</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {printingRoom.dimensionsAndStructure && (
              <div className="border-2 border-black p-4 rounded-xl bg-red-50/20">
                <h3 className="text-lg font-black text-red-700 border-b border-black pb-1 mb-2">📐 مقاسات الهيكل والنجارة والتقسيم الداخلي:</h3>
                <p className="text-red-700 font-bold text-base whitespace-pre-line leading-relaxed">{printingRoom.dimensionsAndStructure}</p>
              </div>
            )}

            {printingRoom.paintSpecs && (
              <div className="border-2 border-black p-4 rounded-xl bg-amber-50/20">
                <h3 className="text-lg font-black text-amber-700 border-b border-black pb-1 mb-2">🎨 مواصفات دهان ورش الأخشاب:</h3>
                <p className="text-slate-800 font-bold text-base whitespace-pre-line leading-relaxed">{printingRoom.paintSpecs}</p>
              </div>
            )}

            {printingRoom.upholsterySpecs && (
              <div className="border-2 border-black p-4 rounded-xl bg-indigo-50/20">
                <h3 className="text-lg font-black text-indigo-700 border-b border-black pb-1 mb-2">🛋️ تفاصيل التنجيد والأقمشة المطلوبة:</h3>
                <p className="text-slate-800 font-bold text-base whitespace-pre-line leading-relaxed">{printingRoom.upholsterySpecs}</p>
              </div>
            )}

            {printingRoom.generalSpecs && (
              <div className="border-2 border-black p-4 rounded-xl bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-700 border-b border-black pb-1 mb-2">📋 مواصفات عامة أخرى للبند:</h3>
                <p className="text-slate-700 font-bold text-base whitespace-pre-line leading-relaxed">{printingRoom.generalSpecs}</p>
              </div>
            )}
          </div>

          <div className="mt-8 border-2 border-black rounded-xl overflow-hidden">
            <div className="bg-black text-white p-2.5 font-black text-center text-sm">
              تتبع مراحل الإنجاز والاعتماد بالورشة
            </div>
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 font-black border-b border-black">
                  <th className="p-3 border-l border-black">المرحلة</th>
                  <th className="p-3 border-l border-black">اسم الفني المسؤول</th>
                  <th className="p-3 border-l border-black">توقيع الفني</th>
                  <th className="p-3">اعتماد الجودة للخط</th>
                </tr>
              </thead>
              <tbody className="font-bold text-slate-800">
                <tr className="border-b border-black">
                  <td className="p-4 border-l border-black bg-orange-50/20 text-orange-700 font-black">1. النجارة والقطع</td>
                  <td className="p-4 border-l border-black">............................</td>
                  <td className="p-4 border-l border-black">...................</td>
                  <td className="p-4">▢ مقبول ▢ مرفوض</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-4 border-l border-black bg-amber-50/20 text-amber-700 font-black">2. الدهان والرش</td>
                  <td className="p-4 border-l border-black">............................</td>
                  <td className="p-4 border-l border-black">...................</td>
                  <td className="p-4">▢ مقبول ▢ مرفوض</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-4 border-l border-black bg-indigo-50/20 text-indigo-700 font-black">3. التنجيد والفرش</td>
                  <td className="p-4 border-l border-black">............................</td>
                  <td className="p-4 border-l border-black">...................</td>
                  <td className="p-4">▢ مقبول ▢ مرفوض</td>
                </tr>
                <tr>
                  <td className="p-4 border-l border-black bg-purple-50/20 text-purple-700 font-black">4. التجميع والتعبئة</td>
                  <td className="p-4 border-l border-black">............................</td>
                  <td className="p-4 border-l border-black">...................</td>
                  <td className="p-4">▢ مقبول ▢ مرفوض</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-12 flex justify-between items-end text-sm font-black px-8">
            <div>
              <p className="mb-6">مسؤول قسم الجودة</p>
              <p className="text-slate-400">.......................</p>
            </div>
            <div>
              <p className="mb-6">مدير المصنع / المشرف</p>
              <p className="text-slate-400">.......................</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Shipping Vehicle Manifest Print Layout */}
      {selectedManifestForPrint && (
        <div id="print-manifest-area" className="hidden print:block p-6 bg-white min-h-[800px] font-sans text-right dir-rtl" dir="rtl">
          <div className="text-center border-b-4 border-black pb-4 mb-6 relative">
            <h1 className="text-3xl font-black text-black">بيان حمولة سيارة شحن بضائع وموبيليا 🚚</h1>
            <p className="text-sm text-slate-600 font-black mt-1">Ref: {selectedManifestForPrint.id?.substring(0, 8) || 'N/A'} | تاريخ الشحن: {selectedManifestForPrint.date}</p>
            <p className="text-xs text-slate-500 font-bold mt-1">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-black border border-black p-4 rounded-xl mb-6 bg-slate-50">
            <div>
              <span className="text-slate-500 block">اسم سائق السيارة المندوب:</span>
              <span className="text-slate-900 text-sm">{selectedManifestForPrint.driverName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">رقم لوحة السيارة ونوعها:</span>
              <span className="text-slate-900 text-sm font-mono">{selectedManifestForPrint.carNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">المسؤول عن التحميل:</span>
              <span className="text-slate-900 text-sm">{selectedManifestForPrint.loaderName || 'أمين مستودع غرف الأثاث'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">خط السير / الوجهة:</span>
              <span className="text-slate-900 text-sm">{selectedManifestForPrint.notes || '-'}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-black border border-black p-2.5 rounded-lg mb-4 bg-slate-100">
            <div>👥 إجمالي العملاء للحملة: <span className="font-mono font-black text-sm">{selectedManifestForPrint.distinctClients?.length || Array.from(new Set(selectedManifestForPrint.items?.map((i: any) => i.customerName).filter(Boolean))).length}</span> عميل</div>
            <div>📄 إجمالي الأوامر للحملة: <span className="font-mono font-black text-sm">{selectedManifestForPrint.distinctOrders?.length || Array.from(new Set(selectedManifestForPrint.items?.map((i: any) => i.orderNumber).filter(Boolean))).length}</span> أمر شغل</div>
            <div>📦 إجمالي الغرف والقطع: <span className="font-mono font-black text-sm">{selectedManifestForPrint.items?.length || 0}</span> بند</div>
          </div>

          <h3 className="text-sm font-black text-slate-800 mb-3 border-r-4 border-indigo-500 pr-2">📦 تفاصيل الأثاث والبنود المحملة بالسيارة:</h3>
          <table className="w-full text-right border-collapse text-xs border border-black mb-8">
            <thead>
              <tr className="bg-slate-100 font-black border-b border-black">
                <th className="p-2 border-l border-black">ت</th>
                <th className="p-2 border-l border-black">اسم العميل</th>
                <th className="p-2 border-l border-black">رقم أمر الشغل</th>
                <th className="p-2 border-l border-black">الغرفة / البند المطلوب</th>
                <th className="p-2">تفاصيل البند وملاحظات التحميل</th>
              </tr>
            </thead>
            <tbody className="font-bold text-slate-800">
              {selectedManifestForPrint.items?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-black">
                  <td className="p-2 border-l border-black font-mono">{index + 1}</td>
                  <td className="p-2 border-l border-black font-black">{item.customerName}</td>
                  <td className="p-2 border-l border-black font-mono">{item.orderNumber}</td>
                  <td className="p-2 border-l border-black text-indigo-800">{item.roomCode}</td>
                  <td className="p-2">{item.specs || 'تام التشطيب بالمواصفات المعتمدة.'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border border-black p-3 rounded-xl bg-slate-50/50 text-[10px] font-bold leading-relaxed mb-12">
            <span className="font-black text-slate-800 block mb-1">✍️ تعهد وإقرار السائق المندوب:</span>
            <p className="text-slate-700">
              أقر أنا السائق المذكور أعلاه بأنني استلمت البنود والمشغولات الخشبية والموبيليا الموضحة في هذا البيان بحالة سليمة ومغلفة بالكامل وتامة التشطيب، وأتعهد بتسليمها كاملة لعنوان العميل أو المعرض وتسليم محضر استلام موقع من العميل وإلا أتحمل المسؤولية كاملة.
            </p>
          </div>

          <div className="mt-12 flex justify-between items-end text-sm font-black px-8">
            <div>
              <p className="mb-6">توقيع السائق المستلم</p>
              <p className="text-slate-400">.......................</p>
            </div>
            <div>
              <p className="mb-6">أمين المستودع (التحميل)</p>
              <p className="text-slate-400">.......................</p>
            </div>
            <div>
              <p className="mb-6">مدير إدارة الشحن</p>
              <p className="text-slate-400">.......................</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Customer Delivery Receipt Print Layout */}
      {selectedReceiptForPrint && (
        <div id="print-receipt-area" className="hidden print:block p-6 bg-white min-h-[800px] font-sans text-right dir-rtl" dir="rtl">
          <div className="text-center border-b-4 border-black pb-4 mb-6 relative">
            <h1 className="text-3xl font-black text-black">محضـــــــــــــــــــر تسليم واستلام موبيليا وأثاث ✨</h1>
            <p className="text-sm text-slate-600 font-black mt-1">Ref: {selectedReceiptForPrint.receiptNumber} | تاريخ الاستلام: {selectedReceiptForPrint.date}</p>
            <p className="text-xs text-slate-500 font-bold mt-1">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-black border border-black p-4 rounded-xl mb-6 bg-indigo-50/10">
            <div>
              <span className="text-slate-500 block">اسم العميل المستلم:</span>
              <span className="text-slate-900 text-sm font-black">{selectedReceiptForPrint.clientName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">أرقام أوامر الشغل المشمولة:</span>
              <span className="text-slate-900 text-sm font-mono">{selectedReceiptForPrint.orderNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">مندوب مبيعات العميل (السيلز):</span>
              <span className="text-slate-900 text-sm">{selectedReceiptForPrint.salesPerson || 'إدارة المصنع'}</span>
            </div>
          </div>

          <h3 className="text-sm font-black text-slate-800 mb-3 border-r-4 border-emerald-500 pr-2">📋 كشف البنود والغرف المستلمة فعلياً:</h3>
          <table className="w-full text-right border-collapse text-xs border border-black mb-8">
            <thead>
              <tr className="bg-slate-100 font-black border-b border-black">
                <th className="p-2 border-l border-black">ت</th>
                <th className="p-2 border-l border-black">الغرفة / البند</th>
                <th className="p-2 border-l border-black">الكمية</th>
                <th className="p-2">مواصفات الفرز والنجارة والدهان المستلمة</th>
              </tr>
            </thead>
            <tbody className="font-bold text-slate-800">
              {selectedReceiptForPrint.products?.map((prod: any, idx: number) => (
                <tr key={idx} className="border-b border-black">
                  <td className="p-2 border-l border-black font-mono">{idx + 1}</td>
                  <td className="p-2 border-l border-black font-black text-slate-900">{prod.name}</td>
                  <td className="p-2 border-l border-black font-mono">{prod.quantity || 1}</td>
                  <td className="p-2">{prod.notes || 'تام التشطيب مطبق للمواصفات المتفق عليها.'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border border-black p-3 rounded-xl bg-slate-50 text-[10px] font-bold leading-relaxed mb-12">
            <span className="font-black text-slate-800 block mb-1">✍️ إقرار العميل بالاستلام الفعلي:</span>
            <p className="text-slate-700">
              أقر أنا الموقع أدناه بأنني استلمت الغرف والبنود والقطع الموضحة أعلاه تامة التشطيب والدهان والتنجيد وخالية تماماً من العيوب الفنية والظاهرة وتم تركيبها في منزلي على الوجه الأكمل وتعتبر ذمتي المالية والتعاقدية مشغولة بباقي مبالغ العقد المستحقة.
            </p>
          </div>

          <div className="mt-12 flex justify-between items-end text-sm font-black px-8">
            <div>
              <p className="mb-6">توقيع العميل المستلم</p>
              <p className="text-slate-400">.......................</p>
            </div>
            <div>
              <p className="mb-6">فني التركيب / المندوب</p>
              <p className="text-slate-400">.......................</p>
            </div>
            <div>
              <p className="mb-6">اعتماد إدارة الجودة</p>
              <p className="text-slate-400">.......................</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delivered Log Print Slip */}
      {selectedDeliveryLogForPrint && (
        <div id="print-delivery-log-area" className="hidden print:block p-8 bg-white text-black font-sans dir-rtl" dir="rtl">
          <div className="border-2 border-black p-6 space-y-6">
            <div className="flex justify-between items-center border-b-2 border-black pb-4">
              <div>
                <h1 className="text-2xl font-black">محضر تسليم واستلام موبيليا ونواقص ومرتجعات ✨</h1>
                <p className="text-sm font-bold mt-1">سند معتمد للتسليمات والمعاينة الميدانية</p>
              </div>
              <div className="text-left font-mono font-bold text-sm">
                <div>رقم المحضر: REC-LOG-{selectedDeliveryLogForPrint.id?.slice(0, 6)}</div>
                <div>تاريخ التسليم: {selectedDeliveryLogForPrint.deliveryDate}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm font-bold border p-4 bg-slate-50">
              <div><strong>رقم الأوردر:</strong> #{selectedDeliveryLogForPrint.orderNumber}</div>
              <div><strong>اسم العميل:</strong> {selectedDeliveryLogForPrint.customerName}</div>
              <div><strong>هاتف العميل:</strong> {selectedDeliveryLogForPrint.customerPhone || '-'}</div>
              <div><strong>اسم البند / الغرفة:</strong> {selectedDeliveryLogForPrint.roomCode}</div>
              <div><strong>اسم السائق:</strong> {selectedDeliveryLogForPrint.driverName || 'غير مسجل'}</div>
              <div><strong>رقم السيارة:</strong> {selectedDeliveryLogForPrint.carNumber || '-'}</div>
              <div className="col-span-2"><strong>حالة التسليم:</strong> {selectedDeliveryLogForPrint.deliveryStatus}</div>
            </div>

            {selectedDeliveryLogForPrint.shortagesDescription && (
              <div className="border-2 border-dashed border-black p-4 bg-amber-50/50">
                <h3 className="font-black text-base underline mb-1">⚠️ بيان النواقص المسجلة بالتعهد:</h3>
                <p className="text-sm font-bold whitespace-pre-line">{selectedDeliveryLogForPrint.shortagesDescription}</p>
              </div>
            )}

            {selectedDeliveryLogForPrint.returnsDescription && (
              <div className="border-2 border-dashed border-black p-4 bg-rose-50/50">
                <h3 className="font-black text-base underline mb-1">🔄 بيان المرتجعات وأسباب الإرجاع:</h3>
                <p className="text-sm font-bold whitespace-pre-line">{selectedDeliveryLogForPrint.returnsDescription}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 pt-12 text-center text-sm font-black border-t-2 border-black">
              <div>
                <p className="mb-12">توقيع السائق والمسؤول بالاستلام:</p>
                <p className="border-t border-black pt-1 w-48 mx-auto">...........................................</p>
              </div>
              <div>
                <p className="mb-12">توقيع العميل بالمعاينة والموافقة:</p>
                <p className="border-t border-black pt-1 w-48 mx-auto">...........................................</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
