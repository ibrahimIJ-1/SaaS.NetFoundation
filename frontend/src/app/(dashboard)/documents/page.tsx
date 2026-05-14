'use client';

import { useDocuments } from '@/hooks/use-documents';
import { GlassCard } from '@/components/ui/glass-card';
import { FileText, Search, Download, ExternalLink, Calendar, User, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DocumentWorkspace } from '@/components/documents/document-workspace';

export default function GlobalDocumentsPage() {
  const { data: documents, isLoading } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const rootDocs = documents?.filter(d => !d.parentDocumentId);
  const filteredDocs = rootDocs?.filter(doc => 
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <FileText className="w-8 h-8 text-legal-gold" />
            المستندات القانونية
          </h1>
          <p className="text-muted-foreground mt-1">مركز إدارة كافة الوثائق والعقود والمذكرات.</p>
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="بحث في أسماء الملفات أو المسؤولين..." 
            className="pr-10 bg-secondary/20 border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-legal-gold"></div>
          </div>
        ) : filteredDocs?.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-secondary/10 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">لا توجد مستندات مطابقة للبحث.</p>
          </div>
        ) : filteredDocs?.map((doc) => (
          <GlassCard key={doc.id} className="p-5 flex flex-col group hover:border-legal-gold/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-legal-gold/10 rounded-xl text-legal-gold group-hover:bg-legal-gold group-hover:text-legal-primary transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex gap-1">
                {doc.isSharedWithClient && (
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">مشارك</Badge>
                )}
                {doc.isSigned && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">موقع</Badge>
                )}
              </div>
            </div>

            <h3 className="font-bold text-foreground mb-1 truncate" title={doc.fileName}>
              {doc.fileName}
            </h3>
            
            <div className="space-y-2 mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Briefcase className="w-3 h-3" />
                <Link href={`/cases/${doc.legalCaseId}`} className="hover:text-legal-gold truncate">
                  {doc.legalCase?.title || 'قضية غير محددة'}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(doc.uploadDate).toLocaleDateString('ar-SA')}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <User className="w-3 h-3" />
                بواسطة: {doc.uploadedBy}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button 
                onClick={() => setSelectedDocId(doc.id)} 
                variant="outline" 
                size="sm" 
                className="text-xs gap-1 border-border"
              >
                <ExternalLink className="w-3 h-3" />
                فتح
              </Button>
              <Button variant="secondary" size="sm" className="text-xs gap-1">
                <Download className="w-3 h-3" />
                تحميل
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {selectedDocId && (
        <DocumentWorkspace 
          documentId={selectedDocId} 
          onClose={() => setSelectedDocId(null)} 
        />
      )}
    </div>
  );
}
