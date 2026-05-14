"use client";

import { useAuth } from "@/providers/auth-provider";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  FileText,
  Receipt,
  Settings,
  LogOut,
  Scale,
  Bot,
  CheckSquare,
  BarChart3,
  Library,
  Wand2,
  GitBranch,
  Settings2,
  ShieldCheck,
  Clock,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { hasFeature, hasPermission, logout, user } = useAuth();
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "الرئيسية",
      href: "/",
      icon: LayoutDashboard,
      requiredFeature: null,
    },

    // Legal Core
    {
      name: "القضايا",
      href: "/cases",
      icon: Briefcase,
      requiredFeature: null,
      requiredPermission: "Cases.View",
    },
    {
      name: "المعاملات",
      href: "/transactions",
      icon: GitBranch,
      requiredFeature: null,
      requiredPermission: null,
    },
    {
      name: "قوالب الإجراءات",
      href: "/transactions/workflows",
      icon: Settings2,
      requiredFeature: null,
      requiredPermission: null,
    },
    {
      name: "المستندات",
      href: "/documents",
      icon: FileText,
      requiredFeature: null,
      requiredPermission: "Documents.View",
    },
    {
      name: "التقويم القانوني",
      href: "/calendar",
      icon: Calendar,
      requiredFeature: null,
      requiredPermission: null,
    },
    {
      name: "المهام والمواعيد",
      href: "/tasks",
      icon: CheckSquare,
      requiredFeature: null,
      requiredPermission: null,
    },

    // Client & CRM
    {
      name: "الموكلين",
      href: "/clients",
      icon: Users,
      requiredFeature: null,
      requiredPermission: "Clients.View",
    },

    // Financial
    {
      name: "المالية والفواتير",
      href: "/billing",
      icon: Receipt,
      requiredFeature: null,
      requiredPermission: null,
    },
    {
      name: "مصاريف المكتب",
      href: "/billing/expenses",
      icon: Receipt,
      requiredFeature: null,
      requiredPermission: null,
    },
    {
      name: "التقارير والتحليلات",
      href: "/reports",
      icon: BarChart3,
      requiredFeature: null,
      requiredPermission: null,
    },
    {
      name: "المكتبة القانونية",
      href: "/knowledge",
      icon: Library,
      requiredFeature: null,
      requiredPermission: null,
    },

    // Advanced
    {
      name: "مساعد الصياغة الذكي",
      href: "/drafting",
      icon: Wand2,
      requiredFeature: null,
      requiredPermission: null,
    },
    {
      name: "المساعد العام (AI)",
      href: "/ai",
      icon: Bot,
      requiredFeature: "AIAssistant",
      requiredPermission: null,
    },

    // Admin
    {
      name: "المستخدمون",
      href: "/users",
      icon: Users,
      requiredFeature: null,
      requiredPermission: "Users.View",
    },
    {
      name: "الأدوار والصلاحيات",
      href: "/roles",
      icon: ShieldCheck,
      requiredFeature: null,
      requiredPermission: "Roles.View",
    },
    {
      name: "مصفوفة الصلاحيات",
      href: "/permission-matrix",
      icon: ShieldCheck,
      requiredFeature: null,
      requiredPermission: "Users.View",
    },
    {
      name: "الإعدادات",
      href: "/settings",
      icon: Settings,
      requiredFeature: null,
      requiredPermission: "Settings.View",
    },
    {
      name: "سجل التدقيق",
      href: "/audit",
      icon: Clock,
      requiredFeature: null,
      requiredPermission: "Audit.View",
    },
  ];

  const filteredNavigation = navigationItems.filter((item) => {
    if (item.requiredFeature && !hasFeature(item.requiredFeature)) return false;
    if (item.requiredPermission && !hasPermission(item.requiredPermission))
      return false;
    return true;
  });

  return (
    <div className="w-64 bg-legal-primary border-l border-legal-secondary flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-legal-secondary">
        <Scale className="w-6 h-6 text-legal-gold ml-2" />
        <span className="text-xl font-bold text-slate-50 tracking-tight font-heading">
          قانوني
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-legal-gold/10 text-legal-gold"
                  : "text-slate-400 hover:bg-legal-secondary hover:text-slate-200",
              )}
            >
              <item.icon
                className={cn(
                  "ml-3 flex-shrink-0 h-5 w-5",
                  isActive ? "text-legal-gold" : "text-slate-500",
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-legal-secondary">
        <Link
          href="/profile"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors mb-2",
            pathname === "/profile"
              ? "bg-legal-gold/10 text-legal-gold"
              : "text-slate-400 hover:bg-legal-secondary hover:text-slate-200",
          )}
        >
          <User className="ml-3 flex-shrink-0 h-5 w-5 text-slate-500" />
          الملف الشخصي
        </Link>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-legal-secondary flex items-center justify-center text-slate-300 font-bold uppercase overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.email?.charAt(0) || "U"
            )}
          </div>
          <div className="mr-3 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.roles.join(", ")}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-legal-secondary hover:text-slate-200 transition-colors"
        >
          <LogOut className="ml-3 flex-shrink-0 h-5 w-5 text-slate-500" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
