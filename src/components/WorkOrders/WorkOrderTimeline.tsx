import React from 'react';
import { CheckCircle2, Clock, Hammer, Sofa, Paintbrush, PackageCheck } from 'lucide-react';

interface WorkOrderTimelineProps {
  currentStatus: string;
  onUpdateStatus?: (newStatus: string) => void;
  readOnly?: boolean;
}

const STAGES = [
  { name: 'بانتظار التعميد', icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { name: 'التحشير والتقطيع', icon: Hammer, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { name: 'القشرة والتجميع', icon: Hammer, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  { name: 'مستودع المنجور', icon: Sofa, color: 'text-purple-500 bg-purple-50 border-purple-200' },
  { name: 'قسم الدهانات', icon: Paintbrush, color: 'text-pink-500 bg-pink-50 border-pink-200' },
  { name: 'التنجيد والتشطيب', icon: Sofa, color: 'text-teal-500 bg-teal-50 border-teal-200' },
  { name: 'في المخزن تام التشطيب', icon: PackageCheck, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  { name: 'سلم للعميل', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100 border-emerald-300' }
];

export function WorkOrderTimeline({ currentStatus, onUpdateStatus, readOnly = false }: WorkOrderTimelineProps) {
  const currentIndex = STAGES.findIndex(s => s.name === currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 right-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 100)}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.name} className="relative z-10 flex flex-col items-center group">
              <button
                disabled={readOnly || !onUpdateStatus}
                onClick={() => onUpdateStatus?.(stage.name)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                  isCurrent 
                    ? 'scale-110 shadow-lg shadow-indigo-200 bg-indigo-600 text-white border-indigo-600'
                    : isCompleted
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-slate-300 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon size={18} />
              </button>
              <span className={`text-[10px] font-black mt-2 max-w-[70px] text-center leading-tight ${
                isCurrent ? 'text-indigo-600 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-300'
              }`}>
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
