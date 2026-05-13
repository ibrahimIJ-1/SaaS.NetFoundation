'use client';

import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Receipt,
  MessageSquare,
  LogOut,
  Scale
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

export default function PortalSidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const navigationItems = [
    { name: 'لوحة التحكم', href: '/portal', icon: LayoutDashboard },
    { name: 'قضاياي', href: '/portal/cases', icon: Briefcase },
    { name: 'المستندات المشتركة', href: '/portal/documents', icon: FileText },
    { name: 'الفواتير والمدفوعات', href: '/portal/billing', icon: Receipt },
    { name: 'التواصل مع المحامي', href: '/portal/chat', icon: MessageSquare },
  ];

  return (
    <div className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Scale className="w-6 h-6 text-legal-gold ml-2" />
        <span className="text-xl font-bold text-slate-50 tracking-tight font-heading">بوابة الموكل</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-legal-gold/10 text-legal-gold" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className={cn("ml-3 flex-shrink-0 h-5 w-5", isActive ? "text-legal-gold" : "text-slate-500")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <LogOut className="ml-3 flex-shrink-0 h-5 w-5 text-slate-500" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
