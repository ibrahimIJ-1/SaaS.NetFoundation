"use client";

import { Tooth } from "./tooth";
import { ToothStatus, ToothCondition } from "@/types/clinical";
import { cn } from "@/lib/utils";

interface OdontogramProps {
  teeth: ToothCondition[];
  selectedToothNumber: number | null;
  onToothSelect: (toothNumber: number) => void;
  className?: string;
}

const ADULT_TEETH_TOP = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28
];
const ADULT_TEETH_BOTTOM = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

export function Odontogram({ teeth, selectedToothNumber, onToothSelect, className }: OdontogramProps) {
  const getToothStatus = (num: number): ToothStatus => {
    return teeth.find(t => t.toothNumber === num)?.status || 'Healthy';
  };

  return (
    <div className={cn("flex flex-col gap-12 p-6 bg-slate-950/30 rounded-2xl border border-slate-800/50 backdrop-blur-sm", className)}>
      {/* Upper Arch */}
      <div className="flex justify-center gap-1.5 md:gap-3">
        {ADULT_TEETH_TOP.map((num) => (
          <Tooth 
            key={num} 
            toothNumber={num} 
            status={getToothStatus(num)}
            isSelected={selectedToothNumber === num}
            onClick={onToothSelect}
          />
        ))}
      </div>

      {/* Midline Indicator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-0.5 rounded-full border border-slate-800 text-[8px] uppercase tracking-widest text-slate-500">
          Midline
        </div>
      </div>

      {/* Lower Arch */}
      <div className="flex justify-center gap-1.5 md:gap-3">
        {ADULT_TEETH_BOTTOM.map((num) => (
          <Tooth 
            key={num} 
            toothNumber={num} 
            status={getToothStatus(num)}
            isSelected={selectedToothNumber === num}
            onClick={onToothSelect}
            className="flex-col-reverse"
          />
        ))}
      </div>
    </div>
  );
}
