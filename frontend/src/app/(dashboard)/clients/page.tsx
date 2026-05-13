'use client';

import { useContacts } from '@/hooks/use-contacts';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building2, 
  User,
  MoreVertical,
  ChevronLeft
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ContactType } from '@/types/contact';

import { AddContactModal } from '@/components/clients/add-contact-modal';

const TYPE_CONFIG: Record<ContactType, { label: string, icon: any, color: string }> = {
  Individual: { label: 'فرد', icon: User, color: 'bg-blue-500/10 text-blue-400' },
  Organization: { label: 'شركة / منظمة', icon: Building2, color: 'bg-legal-gold/10 text-legal-gold' },
  Government: { label: 'جهة حكومية', icon: Building2, color: 'bg-slate-500/10 text-slate-400' },
};

export default function ClientsPage() {
  const { data: contacts, isLoading } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredContacts = contacts?.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <Users className="w-8 h-8 text-legal-gold" />
            إدارة الموكلين والجهات
          </h1>
          <p className="text-muted-foreground mt-1">إدارة العلاقات والبيانات التعريفية للموكلين والخصوم.</p>
        </div>
        <Button 
          className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة جهة اتصال
        </Button>
      </div>

      <AddContactModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />

      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="بحث بالاسم، البريد، أو الهاتف..." 
              className="pr-10 bg-secondary/30" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none">
              <Filter className="w-4 h-4 ml-2" />
              تصفية
            </Button>
            <Badge variant="outline" className="py-2 px-4 rounded-md border-border bg-secondary/20 font-normal">
              إجمالي: {contacts?.length || 0}
            </Badge>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-xl bg-secondary/20 animate-pulse border border-border" />
          ))
        ) : filteredContacts?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            لا توجد نتائج بحث مطابقة.
          </div>
        ) : filteredContacts?.map((contact) => (
          <Link href={`/clients/${contact.id}`} key={contact.id}>
            <GlassCard className="p-6 hover:border-legal-gold/50 transition-all group relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-legal-gold/20 group-hover:bg-legal-gold transition-colors" />
              
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  TYPE_CONFIG[contact.type as ContactType]?.color || TYPE_CONFIG.Individual.color
                )}>
                  {(() => {
                    const Config = TYPE_CONFIG[contact.type as ContactType] || TYPE_CONFIG.Individual;
                    return <Config.icon className="w-5 h-5" />;
                  })()}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground font-heading mb-1 group-hover:text-legal-gold transition-colors">
                  {contact.fullName}
                </h3>
                {contact.companyName && (
                  <p className="text-sm text-legal-gold/80 mb-4">{contact.companyName} • {contact.jobTitle || 'موظف'}</p>
                )}
                
                <div className="space-y-2 mt-4">
                  {contact.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span dir="ltr">{contact.phoneNumber}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-xs">
                <div className="flex gap-1">
                  {contact.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-secondary rounded text-muted-foreground">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center text-legal-gold group-hover:translate-x-[-4px] transition-transform">
                  عرض الملف
                  <ChevronLeft className="w-3 h-3" />
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
