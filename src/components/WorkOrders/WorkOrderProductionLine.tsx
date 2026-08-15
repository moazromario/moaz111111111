import React, { useState } from 'react';
import { FurnitureWorkOrder } from '../../types';
import { Button } from './ui/WorkOrderCardUI';
import { 
  Search, Clock, Hammer, Paintbrush, Sofa, Layers, CheckCircle2, 
  ChevronDown, ArrowRight, ArrowLeft, Printer 
} from 'lucide-react';

interface ProductionRoom {
  orderId: string;
  orderNumber: string;
  customerName: string;
  deliveryDate: string;
  salesPerson: string;
  costCenterId?: string;
  roomIndex: number;
  roomCode: string;
  generalSpecs: string;
  dimensionsAndStructure: string;
  paintSpecs: string;
  upholsterySpecs: string;
  status: string;
  notes: string;
  attachmentImage?: string;
}

interface WorkOrderProductionLineProps {
  productionRooms: ProductionRoom[];
  costCenters: any[];
  updateOrderCostCenter: (orderId: string, costCenterId: string) => void;
  updateRoomStage: (orderId: string, roomIndex: number, newStage: string) => void;
  getRemainingDaysBadge: (deliveryDate: string) => React.ReactNode;
  setPrintingRoom: (room: ProductionRoom) => void;
}

export function WorkOrderProductionLine({
  productionRooms,
  costCenters,
  updateOrderCostCenter,
  updateRoomStage,
  getRemainingDaysBadge,
  setPrintingRoom
}: WorkOrderProductionLineProps) {
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [pipelineCostCenterFilter, setPipelineCostCenterFilter] = useState('الكل');
  const [expandedSpecs, setExpandedSpecs] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-[14px] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-800">تتبع مراحل خط الإنتاج والتصنيع الفعلي</h3>
          <p className="text-slate-400 font-bold text-[11px]">تابع سير الغرف والبنود في أقسام المصنع المختلفة من التجهيز وحتى التعبئة وجاهزية الاستلام</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالعميل، كود الغرفة..."
              className="w-full pr-8 pl-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={pipelineSearch}
              onChange={(e) => setPipelineSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-slate-500 whitespace-nowrap">الورشة / القسم الفعلي:</span>
            <select
              value={pipelineCostCenterFilter}
              onChange={(e) => setPipelineCostCenterFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="الكل">كل الورش والمراكز</option>
              {costCenters.map(cc => (
                <option key={cc.id} value={cc.id}>{cc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'بانتظار التعميد', count: productionRooms.filter(r => r.status === 'بانتظار التعميد').length, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100' },
          { label: 'في قسم النجارة', count: productionRooms.filter(r => r.status === 'نجارة').length, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
          { label: 'في كابينة الدهان', count: productionRooms.filter(r => r.status === 'دهان').length, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
          { label: 'في قسم التنجيد', count: productionRooms.filter(r => r.status === 'تنجيد').length, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
          { label: 'في التجميع والتعبئة', count: productionRooms.filter(r => r.status === 'تجميع وتعبئة').length, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
          { label: 'جاهز للتسليم', count: productionRooms.filter(r => r.status === 'جاهز للتسليم').length, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} ${stat.border} border rounded-xl p-3 text-center shadow-xs`}>
            <span className="text-[10px] font-black text-slate-500 block">{stat.label}</span>
            <span className={`text-lg font-black block mt-0.5 ${stat.text}`}>{stat.count} غرف / بنود</span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 snap-x select-none">
        {[
          { id: 'بانتظار التعميد', name: 'بانتظار التعميد', icon: <Clock size={15} />, colorClass: 'border-slate-200 bg-slate-50/50 text-slate-700', cardHighlight: 'hover:border-slate-300' },
          { id: 'نجارة', name: 'قسم النجارة', icon: <Hammer size={15} />, colorClass: 'border-orange-200 bg-orange-50/30 text-orange-700', cardHighlight: 'hover:border-orange-300' },
          { id: 'دهان', name: 'قسم الدهان', icon: <Paintbrush size={15} />, colorClass: 'border-amber-200 bg-amber-50/30 text-amber-700', cardHighlight: 'hover:border-amber-300' },
          { id: 'تنجيد', name: 'قسم التنجيد', icon: <Sofa size={15} />, colorClass: 'border-indigo-200 bg-indigo-50/30 text-indigo-700', cardHighlight: 'hover:border-indigo-300' },
          { id: 'تجميع وتعبئة', name: 'التجميع والتعبئة', icon: <Layers size={15} />, colorClass: 'border-purple-200 bg-purple-50/30 text-purple-700', cardHighlight: 'hover:border-purple-300' },
          { id: 'جاهز للتسليم', name: 'جاهز للتسليم ✨', icon: <CheckCircle2 size={15} />, colorClass: 'border-emerald-200 bg-emerald-50/30 text-emerald-700', cardHighlight: 'hover:border-emerald-300' },
        ].map((stage) => {
          const stageRooms = productionRooms.filter(r => {
            const matchesSearch = r.customerName.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
                                  r.orderNumber.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
                                  r.roomCode.toLowerCase().includes(pipelineSearch.toLowerCase());
            const matchesWorkshop = pipelineCostCenterFilter === 'الكل' || r.costCenterId === pipelineCostCenterFilter;
            return r.status === stage.id && matchesSearch && matchesWorkshop;
          });

          return (
            <div key={stage.id} className="flex-shrink-0 w-80 bg-slate-50/60 border border-slate-100 rounded-[14px] p-4 flex flex-col snap-start min-h-[550px]">
              <div className={`flex items-center justify-between border rounded-xl p-2.5 mb-4 ${stage.colorClass}`}>
                <div className="flex items-center gap-2">
                  {stage.icon}
                  <span className="text-xs font-black">{stage.name}</span>
                </div>
                <span className="bg-white/90 text-[10px] font-black px-2 py-0.5 rounded-md border shadow-xs">
                  {stageRooms.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-0.5" dir="rtl">
                {stageRooms.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-[10px] font-bold p-3 text-center">
                    لا توجد بنود حالياً في هذه المرحلة
                  </div>
                ) : (
                  stageRooms.map((room) => {
                    const roomKey = `${room.orderId}-${room.roomIndex}`;
                    const isExpanded = expandedSpecs[roomKey] || false;

                    return (
                      <div 
                        key={roomKey} 
                        className={`bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs transition-all ${stage.cardHighlight} group relative`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                            {room.orderNumber}
                          </span>
                          {getRemainingDaysBadge(room.deliveryDate)}
                        </div>

                        <h4 className="text-[10px] font-black text-slate-800 line-clamp-1">{room.customerName}</h4>

                        <h3 className="text-xs font-black text-slate-900 mt-1 flex items-center gap-1.5 border-t border-dashed border-slate-100 pt-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                          {room.roomCode}
                        </h3>

                        {room.attachmentImage && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 h-20 w-full relative">
                            <img 
                              src={room.attachmentImage} 
                              alt="تصميم البند" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <div className="mt-3 bg-slate-50 p-2 rounded-lg border border-slate-200/50 space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-black text-slate-500">
                            <span>الورشة المسؤولة:</span>
                            <span className="text-indigo-600">
                              {costCenters.find(cc => cc.id === room.costCenterId)?.name || 'غير محدد ⚠️'}
                            </span>
                          </div>
                          <select
                            value={room.costCenterId || ''}
                            onChange={(e) => updateOrderCostCenter(room.orderId, e.target.value)}
                            className="w-full text-[9px] font-bold bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-700"
                          >
                            <option value="">اختر ورشة عمل...</option>
                            {costCenters.map(cc => (
                              <option key={cc.id} value={cc.id}>{cc.name}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => setExpandedSpecs(prev => ({ ...prev, [roomKey]: !isExpanded }))}
                          className="w-full mt-2 text-[9px] font-black text-slate-500 bg-slate-100/50 hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200/30 flex items-center justify-between"
                        >
                          <span>📋 المواصفات الفنية للبند</span>
                          <ChevronDown size={12} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-2 text-[9px] border-t border-dashed border-slate-100 pt-2 text-right font-bold text-slate-700">
                            {room.dimensionsAndStructure && (
                              <div className="bg-red-50/30 p-1.5 rounded border border-red-100/50">
                                <span className="text-red-700 font-black block">📐 المقاسات والتقسيم:</span>
                                <p className="text-slate-700 whitespace-pre-line leading-relaxed mt-0.5">{room.dimensionsAndStructure}</p>
                              </div>
                            )}
                            {room.paintSpecs && (
                              <div className="bg-amber-50/30 p-1.5 rounded border border-amber-100/50">
                                <span className="text-amber-700 font-black block">🎨 الدهانات والرش:</span>
                                <p className="text-slate-700 whitespace-pre-line leading-relaxed mt-0.5">{room.paintSpecs}</p>
                              </div>
                            )}
                            {room.upholsterySpecs && (
                              <div className="bg-indigo-50/30 p-1.5 rounded border border-indigo-100/50">
                                <span className="text-indigo-700 font-black block">🛋️ التنجيد والفرش:</span>
                                <p className="text-slate-700 whitespace-pre-line leading-relaxed mt-0.5">{room.upholsterySpecs}</p>
                              </div>
                            )}
                            {room.generalSpecs && (
                              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                                <span className="text-slate-600 font-black block">📝 مواصفات عامة:</span>
                                <p className="text-slate-700 whitespace-pre-line leading-relaxed mt-0.5">{room.generalSpecs}</p>
                              </div>
                            )}
                            {room.notes && (
                              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                                <span className="text-slate-500 font-black block">💬 ملاحظات أمر الشغل:</span>
                                <p className="text-slate-700 whitespace-pre-line leading-relaxed mt-0.5">{room.notes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          <button
                            disabled={stage.id === 'بانتظار التعميد'}
                            onClick={() => {
                              const stagesArray = ['بانتظار التعميد', 'نجارة', 'دهان', 'تنجيد', 'تجميع وتعبئة', 'جاهز للتسليم'];
                              const currentIdx = stagesArray.indexOf(room.status);
                              if (currentIdx > 0) {
                                updateRoomStage(room.orderId, room.roomIndex, stagesArray[currentIdx - 1]);
                              }
                            }}
                            className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${
                              stage.id === 'بانتظار التعميد'
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                            title="إرجاع للمرحلة السابقة"
                          >
                            <ArrowRight size={13} />
                          </button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPrintingRoom(room);
                              setTimeout(() => {
                                window.print();
                              }, 250);
                            }}
                            className="flex-1 h-8 text-[10px] font-black border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            <Printer size={12} className="ml-1" /> كارت التشغيل 🖨
                          </Button>

                          <button
                            disabled={stage.id === 'جاهز للتسليم'}
                            onClick={() => {
                              const stagesArray = ['بانتظار التعميد', 'نجارة', 'دهان', 'تنجيد', 'تجميع وتعبئة', 'جاهز للتسليم'];
                              const currentIdx = stagesArray.indexOf(room.status);
                              if (currentIdx < stagesArray.length - 1) {
                                updateRoomStage(room.orderId, room.roomIndex, stagesArray[currentIdx + 1]);
                              }
                            }}
                            className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${
                              stage.id === 'جاهز للتسليم'
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                            title="تطوير للمرحلة القادمة"
                          >
                            <ArrowLeft size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
