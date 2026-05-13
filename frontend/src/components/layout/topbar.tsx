'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/auth-provider';

export default function Topbar() {
  const { tenantId } = useAuth();

  return (
    <header className="h-16 bg-legal-primary/80 backdrop-blur-md border-b border-legal-secondary flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center flex-1">
        <button className="md:hidden ml-4 text-slate-400 hover:text-slate-200">
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="max-w-md w-full hidden md:block relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <Input 
            type="search" 
            placeholder="البحث عن القضايا، الموكلين، المستندات..." 
            className="pr-10 bg-legal-secondary/50 border-legal-secondary text-slate-200 placeholder:text-slate-500 w-full focus-visible:ring-legal-gold" 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="hidden sm:flex flex-col items-start ml-4">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">المكتب الحالي</span>
          <span className="text-sm font-medium text-legal-gold">{tenantId || 'المكتب الرئيسي'}</span>
        </div>
        
        <button className="relative p-2 text-slate-400 hover:text-legal-gold rounded-full hover:bg-legal-secondary transition-colors">
          <span className="absolute top-1 left-1 w-2 h-2 bg-legal-danger rounded-full border-2 border-legal-primary"></span>
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
