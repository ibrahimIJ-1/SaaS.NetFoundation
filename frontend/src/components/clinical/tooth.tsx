"use client";

import { ToothStatus } from "@/types/clinical";
import { cn } from "@/lib/utils";

interface ToothProps {
  toothNumber: number;
  status: ToothStatus;
  isSelected?: boolean;
  onClick?: (toothNumber: number) => void;
  className?: string;
}

const statusColors: Record<ToothStatus, string> = {
  Healthy: "fill-slate-800 stroke-slate-700",
  Caries: "fill-red-500/40 stroke-red-500",
  Filling: "fill-blue-500/40 stroke-blue-500",
  RootCanal: "fill-amber-500/40 stroke-amber-500",
  Crown: "fill-teal-500/40 stroke-teal-500",
  Bridge: "fill-indigo-500/40 stroke-indigo-500",
  Implant: "fill-emerald-500/40 stroke-emerald-500",
  Missing: "fill-transparent stroke-slate-800 opacity-20",
  Impacted: "fill-orange-500/20 stroke-orange-500 dashed",
  Fractured: "fill-red-900/40 stroke-red-700",
  Mobility: "fill-yellow-500/20 stroke-yellow-500",
  Gingivitis: "fill-pink-500/20 stroke-pink-500",
  ExtractionNeeded: "fill-red-600/60 stroke-red-600",
};

export function Tooth({ toothNumber, status, isSelected, onClick, className }: ToothProps) {
  // Simplified tooth shape: a rounded box for the crown and a smaller one for the root
  return (
    <div 
      className={cn(
        "group cursor-pointer flex flex-col items-center gap-1 transition-all",
        isSelected && "scale-110",
        className
      )}
      onClick={() => onClick?.(toothNumber)}
    >
      <span className="text-[10px] font-mono text-slate-500 group-hover:text-teal-400">
        {toothNumber}
      </span>
      <svg 
        viewBox="0 0 40 60" 
        className={cn(
          "w-8 h-12 transition-colors",
          statusColors[status],
          isSelected && "filter drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]"
        )}
      >
        {/* Tooth Crown */}
        <rect 
          x="5" y="5" width="30" height="25" rx="8" 
          className="stroke-2 transition-all"
        />
        {/* Tooth Root */}
        <path 
          d="M10 30 Q10 55 20 55 Q30 55 30 30" 
          className="stroke-2 fill-none"
        />
        
        {/* Status Indicators */}
        {status === 'Missing' && (
          <line x1="5" y1="5" x2="35" y2="55" className="stroke-slate-700 stroke-2" />
        )}
        {status === 'Caries' && (
          <circle cx="20" cy="17" r="4" className="fill-red-500 animate-pulse" />
        )}
        {status === 'Implant' && (
          <path d="M15 35 L25 35 M20 30 L20 50" className="stroke-emerald-400 stroke-2" />
        )}
        {status === 'RootCanal' && (
          <line x1="20" y1="30" x2="20" y2="50" className="stroke-amber-400 stroke-2 stroke-dasharray-2" />
        )}
      </svg>
    </div>
  );
}
