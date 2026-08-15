import React from 'react';
import { Loader2 } from 'lucide-react';

export const Card = ({ children, className }: any) => (
  <div className={`bg-white rounded-[14px] border border-slate-100 shadow-sm shadow-slate-200/30 hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-200 overflow-hidden relative ${className || ''}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className }: any) => (
  <div className={`p-6 pb-2 ${className || ''}`}>{children}</div>
);

export const CardTitle = ({ children, className }: any) => (
  <h3 className={`text-xl font-black text-slate-900 tracking-tighter leading-none ${className || ''}`}>{children}</h3>
);

export const CardDescription = ({ children, className }: any) => (
  <p className={`text-sm font-bold text-slate-400 mt-1 ${className || ''}`}>{children}</p>
);

export const CardContent = ({ children, className }: any) => (
  <div className={`p-6 pt-2 ${className || ''}`}>{children}</div>
);

export const Button = ({ children, className, variant, size, loading, ...props }: any) => { 
  const base = 'inline-flex items-center justify-center rounded-[14px] font-black transition-all duration-200 outline-none select-none active:scale-95 disabled:pointer-events-none disabled:opacity-50 text-sm whitespace-nowrap tracking-tight'; 
  const v = variant === 'outline' ? 'border-2 border-slate-100 bg-white text-slate-600 hover:border-indigo-100 hover:bg-indigo-50/30 shadow-sm' : 
            variant === 'ghost' ? 'bg-transparent hover:bg-slate-100 text-slate-500' : 
            variant === 'danger' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200/40' :
            variant === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200/40' :
            variant === 'secondary' ? 'bg-white border-2 border-slate-100 text-slate-900 shadow-sm hover:bg-slate-50' :
            'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200/40'; 
  const s = size === 'icon' ? 'size-12 p-0' : size === 'sm' ? 'h-10 px-5 text-xs' : 'h-12 px-6'; 
  return (
    <button 
      className={`${base} ${v} ${s} ${className || ''}`} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
      {children}
    </button>
  ); 
};
