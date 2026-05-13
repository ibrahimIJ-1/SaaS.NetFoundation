'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { knowledgeService, LegalArea, KnowledgeArticle } from '@/services/knowledge.service';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Library, 
  Search, 
  Plus, 
  BookOpen, 
  Tag, 
  ChevronRight, 
  Filter,
  Gavel,
  ShieldCheck,
  Building,
  Heart,
  Users,
  Briefcase
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const AREA_MAP: Record<number, { label: string, icon: any, color: string }> = {
  0: { label: 'جنائي', icon: Gavel, color: 'bg-red-500/10 text-red-500' },
  1: { label: 'مدني', icon: Scale, color: 'bg-blue-500/10 text-blue-500' },
  2: { label: 'شركات', icon: Building, color: 'bg-purple-500/10 text-purple-500' },
  3: { label: 'أحوال شخصية', icon: Heart, color: 'bg-pink-500/10 text-pink-500' },
  4: { label: 'عمالي', icon: Users, color: 'bg-orange-500/10 text-orange-500' },
  5: { label: 'ملكية فكرية', icon: ShieldCheck, color: 'bg-yellow-500/10 text-yellow-500' },
  7: { label: 'أخرى', icon: Library, color: 'bg-slate-500/10 text-slate-500' },
};

import { Scale } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [selectedArea, setSelectedArea] = useState<LegalArea | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['knowledge', selectedArea],
    queryFn: () => knowledgeService.getArticles(selectedArea)
  });

  const filteredArticles = articles?.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <Library className="w-10 h-10 text-legal-gold" />
            المكتبة القانونية
          </h1>
          <p className="text-muted-foreground">مرجع شامل للاجتهادات القضائية، القوانين، ونماذج العقود.</p>
        </div>
        <Button className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold gap-2 px-6">
          <Plus className="w-5 h-5" />
          إضافة مورد جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <GlassCard className="p-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Filter className="w-3 h-3" /> التخصصات القانونية
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedArea(undefined)}
                className={cn(
                  "w-full text-right px-3 py-2 rounded-lg text-sm transition-all duration-200",
                  selectedArea === undefined ? "bg-legal-gold text-legal-primary font-bold" : "hover:bg-secondary/50 text-muted-foreground"
                )}
              >
                الكل
              </button>
              {Object.entries(AREA_MAP).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setSelectedArea(Number(key))}
                  className={cn(
                    "w-full text-right px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition-all duration-200",
                    selectedArea === Number(key) ? "bg-legal-gold/20 text-legal-gold font-bold border border-legal-gold/30" : "hover:bg-secondary/50 text-muted-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <value.icon className="w-4 h-4" />
                    {value.label}
                  </span>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-legal-gold/5 border-legal-gold/20">
            <h4 className="text-sm font-bold text-legal-gold mb-2">أشهر الوسوم</h4>
            <div className="flex flex-wrap gap-2">
              {['محكمة_التمييز', 'عقود_تجارية', 'قانون_العمل', 'إجراءات_مدنية'].map(tag => (
                <Badge key={tag} variant="outline" className="text-[10px] cursor-pointer hover:bg-legal-gold hover:text-legal-primary">#{tag}</Badge>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="ابحث في العناوين، المحتوى، أو الوسوم..." 
              className="pr-12 h-14 text-lg bg-card/50 border-border focus-visible:ring-legal-gold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              [1, 2, 4].map(i => <div key={i} className="h-48 bg-secondary/30 animate-pulse rounded-2xl" />)
            ) : filteredArticles?.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد موارد مطابقة لمعايير البحث.</p>
              </div>
            ) : (
              filteredArticles?.map(article => {
                const Area = AREA_MAP[article.area] || AREA_MAP[7];
                return (
                  <GlassCard key={article.id} className="p-6 group cursor-pointer hover:border-legal-gold/50 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className={cn("py-1", Area.color)}>{Area.label}</Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(article.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-legal-gold transition-colors leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                      {article.content.substring(0, 150)}...
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-legal-gold/20 flex items-center justify-center text-[10px] font-bold text-legal-gold">
                          {article.authorName?.[0]}
                        </div>
                        <span className="text-xs font-medium text-foreground/70">{article.authorName}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-legal-gold gap-2 group/btn">
                        اقرأ المزيد
                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-[-4px]" />
                      </Button>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
