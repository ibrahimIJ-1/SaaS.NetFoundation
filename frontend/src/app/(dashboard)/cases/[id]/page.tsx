'use client';

import { useParams } from 'next/navigation';
import { useCase } from '@/hooks/use-cases';
import { StatusBadge } from '@/components/ui/status-badge';
import { GlassCard } from '@/components/ui/glass-card';
import { Briefcase, Activity, Users } from 'lucide-react';
import { CaseDetailTabs } from '@/components/cases/case-detail-tabs';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const { data: caseData, isLoading, error } = useCase(caseId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-legal-gold"></div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="bg-legal-danger/10 text-legal-danger p-4 rounded-xl border border-legal-danger/20">
        لم يتم العثور على القضية أو حدث خطأ.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Case Header */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-legal-gold bg-legal-gold/10 px-2 py-1 rounded">
                {caseData.caseNumber}
              </span>
              <StatusBadge status={caseData.status} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {caseData.title}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">تاريخ الفتح</p>
            <p className="text-md font-medium text-foreground">
              {new Date(caseData.openDate).toLocaleDateString('ar-EG')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-legal-gold mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">الموكل</p>
              <p className="font-medium text-foreground/90">{caseData.clientName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-legal-gold mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">نوع القضية / المحكمة</p>
              <p className="font-medium text-foreground/90">{caseData.caseType}</p>
              <p className="text-xs text-muted-foreground">{caseData.courtInfo}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-legal-gold mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">المحامي المسؤول</p>
              <p className="font-medium text-foreground/90">{caseData.assignedLawyerName}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Detail Tabs */}
      <CaseDetailTabs caseData={caseData} />
    </div>
  );
}
