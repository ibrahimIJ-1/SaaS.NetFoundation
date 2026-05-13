'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCases } from '@/hooks/use-cases';
import Link from 'next/link';
import { CaseFilters } from '@/components/cases/case-filters';
import { CaseCard } from '@/components/cases/case-card';

export default function CasesPage() {
  const { data: cases, isLoading, error } = useCases();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredCases = cases?.filter(c => 
    c.title.includes(searchTerm) || 
    c.caseNumber.includes(searchTerm) ||
    c.clientName.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">القضايا</h1>
          <p className="text-muted-foreground mt-1">إدارة قضايا الموكلين ومتابعة حالتها.</p>
        </div>
        <Link href="/cases/new">
          <Button className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold">
            <Plus className="w-4 h-4 ml-2" />
            قضية جديدة
          </Button>
        </Link>
      </div>

      <CaseFilters 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-legal-gold"></div>
        </div>
      ) : error ? (
        <div className="bg-legal-danger/10 text-legal-danger p-4 rounded-xl border border-legal-danger/20">
          حدث خطأ أثناء تحميل القضايا.
        </div>
      ) : filteredCases?.length === 0 ? (
        <div className="text-center py-20 bg-secondary/10 rounded-xl border border-border border-dashed">
          <p className="text-muted-foreground">لا توجد قضايا مطابقة للبحث.</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            : "flex flex-col gap-4"
        }>
          {filteredCases?.map((c) => (
            <CaseCard key={c.id} data={c} />
          ))}
        </div>
      )}
    </div>
  );
}
