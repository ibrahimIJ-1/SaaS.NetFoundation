'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/auth-provider';

export default function Topbar() {
  const { tenantId } = useAuth();

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center flex-1">
        <button className="md:hidden mr-4 text-slate-400 hover:text-slate-200">
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="max-w-md w-full hidden md:block relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <Input 
            type="search" 
            placeholder="Search patients, appointments..." 
            className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-500 w-full" 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex flex-col items-end mr-4">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Clinic</span>
          <span className="text-sm font-medium text-teal-400">{tenantId}</span>
        </div>
        
        <button className="relative p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors">
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
