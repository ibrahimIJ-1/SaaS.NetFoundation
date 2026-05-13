import * as React from "react"
import { cn } from "@/lib/utils"

export type CaseStatus = 'Active' | 'Pending' | 'Won' | 'Lost' | 'Archived'

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: CaseStatus
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-legal-success/10 text-legal-success border-legal-success/20'
      case 'Pending':
        return 'bg-legal-warning/10 text-legal-warning border-legal-warning/20'
      case 'Won':
        return 'bg-legal-gold/10 text-legal-gold border-legal-gold/20'
      case 'Lost':
        return 'bg-legal-danger/10 text-legal-danger border-legal-danger/20'
      case 'Archived':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getStatusLabel = (status: CaseStatus) => {
    switch (status) {
      case 'Active': return 'نشط'
      case 'Pending': return 'قيد الانتظار'
      case 'Won': return 'مكتسبة'
      case 'Lost': return 'خاسرة'
      case 'Archived': return 'مؤرشفة'
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getStatusColor(status),
        className
      )}
      {...props}
    >
      {getStatusLabel(status)}
    </span>
  )
}
