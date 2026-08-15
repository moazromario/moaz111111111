import React from 'react';
import { FurnitureWorkOrder } from '../../types';
import { Card, Button } from './ui/WorkOrderCardUI';
import { Layers, CheckCircle2, Clock, Wrench, ChevronLeft, ArrowRight } from 'lucide-react';

interface WorkOrderOperationsProps {
  order: FurnitureWorkOrder;
  onStatusChange?: (orderId: string, roomIndex: number, newStatus: string) => void;
}

const STAGES = [
  { id: 'النجارة والتقطيع', name: 'مرحلة النجارة والتقطيع', icon: Wrench, color: 'bg-amber-500' },
  { id: 'الأويما والتنعيم', name: 'مرحلة الأويما والتنعيم', icon: Layers, color: 'bg-blue-500' },
  { id: 'الدهانات والرش', name: 'مرحلة الدهانات والرش', icon: Clock, color: 'bg-indigo-500' },
  { id: 'التنجيد والخياطة', name: 'مرحلة التنجيد والخياطة', icon: CheckCircle2, color: 'bg-purple-500' },
  { id: 'التجميع والتشطيب النهائى', name: 'التجميع والتشطيب النهائي', icon: CheckCircle2, color: 'bg-emerald-500' },
  { id: 'في المخزن تام التشطيب', name: 'في المخزن تام التشطيب', icon: CheckCircle2, color: 'bg-teal-500' }
];

export function WorkOrderOperations({ order, onStatusChange }: WorkOrderOperationsProps) {
  const rooms = order.rooms && order.rooms.length > 0 ? order.rooms : [
    {
      roomCode: order.roomCode || 'البند الرئيسي',
      generalSpecs: order.generalSpecs,
      dimensionsAndStructure: order.dimensionsAndStructure,
      paintSpecs: order.paintSpecs,
      upholsterySpecs: order.upholsterySpecs,
      status: order.status
    }
  ];

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
            متابعة خطوط التشغيل والمراحل ⚙️
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
            <Layers size={22} className="text-indigo-600" /> مسار ومراحل العمل التشغيلية
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            تتبع الانتقال بين المراحل الفنية لكل غرفة وبند داخل أمر الشغل #{order.orderNumber}
          </p>
        </div>
      </div>

      {/* Room Operations Kanban/Timeline Grid */}
      <div className="space-y-4">
        {rooms.map((room, roomIdx) => {
          const currentStageIndex = STAGES.findIndex(s => s.id === (room.status || order.status));
          const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
          const progressPercent = Math.round(((activeIndex + 1) / STAGES.length) * 100);

          return (
            <Card key={roomIdx} className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
                <div>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                    البند #{roomIdx + 1}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1">{room.roomCode}</h4>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">الإنجاز: {progressPercent}%</span>
                  <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-full">
                    {room.status || order.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Stages Stepper */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2">
                {STAGES.map((stg, stgIdx) => {
                  const isDone = stgIdx < activeIndex;
                  const isCurrent = stgIdx === activeIndex;

                  return (
                    <button
                      key={stg.id}
                      onClick={() => onStatusChange && onStatusChange(order.id, roomIdx, stg.id)}
                      className={`p-3 rounded-xl text-right transition-all border text-xs font-bold flex flex-col justify-between min-h-[90px] ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105 z-10'
                          : isDone
                          ? 'bg-indigo-50/80 text-indigo-900 border-indigo-100 hover:bg-indigo-100'
                          : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] opacity-80 font-mono">#{stgIdx + 1}</span>
                        {isDone && <CheckCircle2 size={14} className="text-indigo-600" />}
                        {isCurrent && <Clock size={14} className="text-white animate-pulse" />}
                      </div>
                      <span className="font-black mt-2 leading-tight block">{stg.name}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
