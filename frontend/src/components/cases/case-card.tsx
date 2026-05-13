import * as React from "react";
import Link from "next/link";
import { LegalCase } from "@/types/case";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Briefcase, User, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseCardProps {
  data: LegalCase;
  className?: string;
}

export function CaseCard({ data, className }: CaseCardProps) {
  return (
    <Link href={`/cases/${data.id}`} className={cn("block group h-full", className)}>
      <GlassCard className="h-full flex flex-col p-5 hover:border-legal-gold/50 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold text-legal-gold bg-legal-gold/10 px-2 py-1 rounded">
            {data.caseNumber}
          </span>
          <StatusBadge status={data.status} />
        </div>
        
        <h3 className="text-lg font-bold text-foreground font-heading mb-1 group-hover:text-legal-gold transition-colors line-clamp-2">
          {data.title}
        </h3>
        
        <div className="flex-1 mt-4 space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="w-4 h-4 mr-2 ml-2 text-slate-400" />
            <span className="truncate">{data.clientName}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4 mr-2 ml-2 text-slate-400" />
            <span className="truncate">{data.caseType}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Scale className="w-4 h-4 mr-2 ml-2 text-slate-400" />
            <span className="truncate">{data.assignedLawyerName}</span>
          </div>
        </div>

        {data.tags && data.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
            {data.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {tag}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground/50">
                +{data.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </GlassCard>
    </Link>
  );
}
