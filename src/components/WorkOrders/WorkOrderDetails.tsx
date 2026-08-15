import React, { useState } from 'react';
import { FurnitureWorkOrder, Issuance, JobLabor, JobOtherCost, SafeTransaction } from '../../types';
import { Card, Button } from './ui/WorkOrderCardUI';
import { Printer, Calculator, Package, Layers, ShieldCheck, Image as ImageIcon, FileText } from 'lucide-react';

import { WorkOrderCosts } from './WorkOrderCosts';
import { WorkOrderMaterials } from './WorkOrderMaterials';
import { WorkOrderOperations } from './WorkOrderOperations';
import { WorkOrderQuality } from './WorkOrderQuality';
import { WorkOrderAttachments } from './WorkOrderAttachments';

interface WorkOrderDetailsProps {
  order?: FurnitureWorkOrder | null;
  viewingOrder?: FurnitureWorkOrder | null;
  issuances?: Issuance[];
  jobLabors?: JobLabor[];
  jobOtherCosts?: JobOtherCost[];
  safeTransactions?: SafeTransaction[];
  onClose: () => void;
  onPrint?: () => void;
  onRefresh?: () => void;
}

export function WorkOrderDetails({
  order,
  viewingOrder,
  issuances = [],
  jobLabors = [],
  jobOtherCosts = [],
  safeTransactions = [],
  onClose,
  onPrint,
  onRefresh
}: WorkOrderDetailsProps) {
  const currentOrder = order || viewingOrder || null;
  const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'materials' | 'operations' | 'quality' | 'attachments'>('overview');

  if (!currentOrder) return null;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" dir="rtl">
      <Card className="w-full max-w-5xl max-h-[94vh] overflow-y-auto border-none shadow-2xl animate-in zoom-in-95 duration-200 relative">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white z-20 border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-black text-slate-400 block">تفاصيل أمر التشغيل</span>
              <h2 className="text-xl font-black text-slate-900">أمر #{currentOrder.orderNumber}</h2>
            </div>
            <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
              {currentOrder.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint} className="font-black text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs">
              <Printer size={16} className="ml-1.5" /> طباعة أمر الشغل 🖨️
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:bg-slate-100 rounded-full h-9 w-9">
              ×
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar no-print">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={15} /> البيانات الرئيسية والغرف
          </button>

          <button
            onClick={() => setActiveTab('costs')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'costs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator size={15} /> التكاليف والمحاسبة الفعلى ⚖️
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'materials' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package size={15} /> الخامات وأذون الصرف
          </button>

          <button
            onClick={() => setActiveTab('operations')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'operations' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={15} /> مراحل التشغيل
          </button>

          <button
            onClick={() => setActiveTab('quality')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'quality' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={15} /> جودة الفحص QC
          </button>

          <button
            onClick={() => setActiveTab('attachments')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'attachments' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon size={15} /> المرفقات والعقد
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs font-bold border border-slate-100">
                <div>
                  <span className="text-slate-400 block">العميل:</span>
                  <span className="text-slate-900 font-black text-sm">{currentOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">تاريخ التعاقد:</span>
                  <span className="text-slate-900 font-black">{currentOrder.contractDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">تاريخ التسليم:</span>
                  <span className="text-slate-900 font-black">{currentOrder.deliveryDate || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">القيمة الإجمالية:</span>
                  <span className="text-indigo-600 font-black text-sm">{(currentOrder.totalAmount || 0).toLocaleString()} ج.م</span>
                </div>
              </div>

              {currentOrder.attachmentImage && (
                <div className="p-4 border rounded-xl bg-slate-50/50">
                  <h4 className="text-xs font-black text-slate-700 mb-2">كارت الشغل المصور:</h4>
                  <img src={currentOrder.attachmentImage} alt="Attachment" className="max-h-80 rounded-lg object-contain mx-auto" />
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 underline decoration-indigo-500 decoration-2">
                  الغرف والبنود المشمولة ({currentOrder.rooms?.length || 1}):
                </h3>

                {currentOrder.rooms && currentOrder.rooms.length > 0 ? (
                  currentOrder.rooms.map((room, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-xl space-y-2 bg-white shadow-sm">
                      <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg font-black text-sm text-slate-800">
                        <span>البند #{idx + 1}: {room.roomCode}</span>
                        <span className="text-xs bg-white px-2 py-0.5 rounded border">{room.status}</span>
                      </div>

                      {room.generalSpecs && (
                        <div className="text-xs font-bold text-slate-700">
                          <span className="text-slate-400 block">المواصفات العامة:</span>
                          <p className="text-slate-800 whitespace-pre-line">{room.generalSpecs}</p>
                        </div>
                      )}

                      {room.dimensionsAndStructure && (
                        <div className="text-xs font-bold text-slate-700">
                          <span className="text-slate-400 block">النجارة والمقاسات:</span>
                          <p className="text-red-600 whitespace-pre-line">{room.dimensionsAndStructure}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {room.paintSpecs && (
                          <div className="text-xs font-bold text-slate-700">
                            <span className="text-slate-400 block">الدهان:</span>
                            <p className="text-slate-800 whitespace-pre-line">{room.paintSpecs}</p>
                          </div>
                        )}
                        {room.upholsterySpecs && (
                          <div className="text-xs font-bold text-slate-700">
                            <span className="text-slate-400 block">التنجيد:</span>
                            <p className="text-slate-800 whitespace-pre-line">{room.upholsterySpecs}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                    <div className="font-black text-sm text-slate-800">{currentOrder.roomCode || 'غرفة عامة'}</div>
                    {currentOrder.generalSpecs && <p className="text-xs font-bold text-slate-700">{currentOrder.generalSpecs}</p>}
                    {currentOrder.dimensionsAndStructure && <p className="text-xs font-bold text-red-600">{currentOrder.dimensionsAndStructure}</p>}
                  </div>
                )}
              </div>

              {currentOrder.notes && (
                <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-amber-50/30 text-xs font-bold text-slate-800">
                  <span className="font-black text-slate-900 block mb-1">ملاحظات تسليم خاصة:</span>
                  <p className="whitespace-pre-line">{currentOrder.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'costs' && (
            <WorkOrderCosts
              order={currentOrder}
              issuances={issuances}
              jobLabors={jobLabors}
              jobOtherCosts={jobOtherCosts}
              safeTransactions={safeTransactions}
              onRefresh={onRefresh}
            />
          )}

          {activeTab === 'materials' && (
            <WorkOrderMaterials
              order={currentOrder}
              issuances={issuances}
            />
          )}

          {activeTab === 'operations' && (
            <WorkOrderOperations
              order={currentOrder}
            />
          )}

          {activeTab === 'quality' && (
            <WorkOrderQuality
              order={currentOrder}
            />
          )}

          {activeTab === 'attachments' && (
            <WorkOrderAttachments
              order={currentOrder}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
