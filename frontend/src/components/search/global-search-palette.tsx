'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  FileText, 
  User, 
  Briefcase, 
  History, 
  Star, 
  Command,
  Loader2,
  X,
  SearchCode,
  Scale
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchService, SearchResults } from '@/services/search.service';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function GlobalSearchPalette({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => searchService.globalSearch(debouncedQuery),
    enabled: debouncedQuery.length > 2
  });

  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    if (type === 'Case') router.push(`/cases/${id}`);
    if (type === 'Contact') router.push(`/contacts/${id}`);
    if (type === 'Document') router.push(`/cases/documents?id=${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-border bg-background/80 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center px-4 py-4 border-b border-border gap-3">
          <Search className="w-5 h-5 text-legal-gold animate-pulse" />
          <input
            className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground font-heading"
            placeholder="بحث عن قضايا، موكلين، أو محتوى المستندات..."
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1">
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">ESC</span>
            </kbd>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!debouncedQuery || debouncedQuery.length <= 2 ? (
            <div className="p-12 text-center">
              <SearchCode className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">ابدأ الكتابة للبحث في الأرشيف القانوني والمستندات المؤرشفة.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cases Section */}
              {(results?.cases?.length ?? 0) > 0 && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> القضايا
                  </div>
                  {results?.cases?.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect('Case', c.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-legal-gold/10 rounded-md text-legal-gold group-hover:bg-legal-gold group-hover:text-legal-primary transition-colors">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{c.title}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{c.caseNumber}</div>
                        </div>
                      </div>
                      <History className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              )}

              {/* Documents Section with Deep Indexing Indicator */}
              {(results?.documents?.length ?? 0) > 0 && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3" /> المستندات (البحث العميق)
                  </div>
                  {results?.documents?.map(d => (
                    <button
                      key={d.id}
                      onClick={() => handleSelect('Document', d.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-md text-blue-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{d.fileName}</div>
                          {d.hasMatchInContent && (
                            <Badge variant="outline" className="text-[9px] py-0 border-legal-gold/30 text-legal-gold bg-legal-gold/5">
                              تم العثور في المحتوى
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Search className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {results && !(results.cases?.length ?? 0) && !(results.contacts?.length ?? 0) && !(results.documents?.length ?? 0) && (
                <div className="p-12 text-center text-muted-foreground">
                  لا توجد نتائج مطابقة لـ "{debouncedQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border bg-secondary/10 flex justify-between items-center text-[10px] text-muted-foreground">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Command className="w-3 h-3" /> للانتقال</span>
            <span className="flex items-center gap-1"><X className="w-3 h-3" /> للإغلاق</span>
          </div>
          <div className="flex items-center gap-1 text-legal-gold font-bold uppercase tracking-tighter">
            <Star className="w-3 h-3" /> ميزة البحث العميق مفعلة
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
