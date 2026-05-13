import * as React from "react"
import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className, ...props }: StatCardProps) {
  return (
    <GlassCard className={cn("p-6 flex flex-col hover:border-legal-gold/50 transition-colors", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-secondary rounded-lg">
          <Icon className="w-4 h-4 text-legal-gold" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold font-heading">{value}</div>
        {trend && (
          <p className={cn("text-xs mt-1", trendUp ? "text-legal-success" : "text-legal-danger")}>
            {trend}
          </p>
        )}
      </div>
    </GlassCard>
  )
}
