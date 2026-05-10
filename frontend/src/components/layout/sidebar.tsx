'use client';

import { useAuth } from '@/providers/auth-provider';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  ClipboardList, 
  FileText, 
  Pill, 
  Activity,
  Image as ImageIcon,
  Receipt,
  CreditCard,
  Shield,
  Package,
  Truck,
  Building2,
  Settings,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { hasFeature, hasPermission, logout, user } = useAuth();
  const pathname = usePathname();

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, requiredFeature: null },
    
    // Admin / Core
    { name: 'Users & Roles', href: '/users', icon: Users, requiredFeature: null, requiredPermission: 'Users.View' },
    { name: 'Branches', href: '/branches', icon: Building2, requiredFeature: 'Branches', requiredPermission: 'Branches.View' },
    
    // Clinical Flow
    { name: 'Patients', href: '/patients', icon: ClipboardList, requiredFeature: 'Patients', requiredPermission: 'Patients.View' },
    { name: 'Appointments', href: '/appointments', icon: Calendar, requiredFeature: 'Appointments', requiredPermission: 'Appointments.View' },
    { name: 'Dental Chart', href: '/clinical/chart', icon: Stethoscope, requiredFeature: 'DentalChart', requiredPermission: 'Clinical.ViewDentalChart' },
    { name: 'Treatment Plans', href: '/clinical/plans', icon: FileText, requiredFeature: 'TreatmentPlans', requiredPermission: 'TreatmentPlans.View' },
    
    // Additional Clinical
    { name: 'Prescriptions', href: '/clinical/prescriptions', icon: Pill, requiredFeature: 'Prescriptions', requiredPermission: 'Prescriptions.View' },
    { name: 'Lab Requests', href: '/clinical/labs', icon: Activity, requiredFeature: 'LabRequests', requiredPermission: 'LabRequests.View' },
    { name: 'Imaging', href: '/clinical/imaging', icon: ImageIcon, requiredFeature: 'Imaging', requiredPermission: 'Imaging.View' },
    
    // Financial & Inventory
    { name: 'Billing', href: '/billing', icon: Receipt, requiredFeature: 'Billing', requiredPermission: 'Billing.View' },
    { name: 'Insurance', href: '/insurance', icon: Shield, requiredFeature: 'Insurance', requiredPermission: 'Insurance.View' },
    { name: 'Inventory', href: '/inventory', icon: Package, requiredFeature: 'Inventory', requiredPermission: 'Inventory.View' },
    
    // Settings
    { name: 'Settings', href: '/settings', icon: Settings, requiredFeature: null, requiredPermission: 'Settings.View' },
  ];

  const filteredNavigation = navigationItems.filter(item => {
    if (item.requiredFeature && !hasFeature(item.requiredFeature)) return false;
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) return false;
    return true;
  });

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Activity className="w-6 h-6 text-teal-500 mr-2" />
        <span className="text-lg font-bold text-slate-100 tracking-tight">TeethDen</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-teal-500/10 text-teal-400" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className={cn("mr-3 flex-shrink-0 h-5 w-5", isActive ? "text-teal-400" : "text-slate-500")} aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold uppercase overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              user?.email?.charAt(0) || 'U'
            )}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.roles.join(', ')}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-slate-500" />
          Sign out
        </button>
      </div>
    </div>
  );
}
