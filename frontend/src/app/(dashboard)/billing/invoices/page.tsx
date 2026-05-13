'use client';

import { useInvoices } from '@/hooks/use-billing';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { 
  Receipt, 
  Plus, 
  Filter, 
  Search,
  Download,
  Eye,
  CreditCard,
  MoreVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { InvoiceStatus } from '@/types/billing';
import { useState } from 'react';

const STATUS_CONFIG: Record<InvoiceStatus, { label: string, color: string }> = {
  Draft: { label: 'مسودة', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  Sent: { label: 'مرسلة', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  Partial: { label: 'جزئية', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  Paid: { label: 'مدفوعة', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  Overdue: { label: 'متأخرة', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  Cancelled: { label: 'ملغاة', color: 'bg-secondary text-muted-foreground border-border' },
};

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices?.filter(i => 
    i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.legalCase?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <Receipt className="w-8 h-8 text-legal-gold" />
            إدارة الفواتير
          </h1>
          <p className="text-muted-foreground mt-1">عرض وإصدار ومتابعة فواتير المكتب.</p>
        </div>
        <Link href="/billing/invoices/new">
          <Button className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold">
            <Plus className="w-4 h-4 ml-2" />
            إنشاء فاتورة
          </Button>
        </Link>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="بحث برقم الفاتورة أو القضية..." 
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
            <Button variant="outline" className="flex-1 md:flex-none">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/20">
                <th className="p-4 font-medium">رقم الفاتورة</th>
                <th className="p-4 font-medium">القضية</th>
                <th className="p-4 font-medium">تاريخ الإصدار</th>
                <th className="p-4 font-medium">تاريخ الاستحقاق</th>
                <th className="p-4 font-medium">المبلغ</th>
                <th className="p-4 font-medium">المتبقي</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={8} className="p-10 text-center">جاري التحميل...</td></tr>
              ) : filteredInvoices?.length === 0 ? (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">لا توجد فواتير مطابقة للبحث.</td></tr>
              ) : filteredInvoices?.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-secondary/10 transition-colors group">
                  <td className="p-4 font-bold text-foreground">#{invoice.invoiceNumber}</td>
                  <td className="p-4">
                    <div className="max-w-[200px] truncate" title={invoice.legalCase?.title}>
                      {invoice.legalCase?.title}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(invoice.issueDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-4 font-medium text-foreground">${invoice.totalAmount.toLocaleString()}</td>
                  <td className="p-4 font-medium text-legal-danger">
                    ${(invoice.totalAmount - invoice.paidAmount).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      STATUS_CONFIG[invoice.status].color
                    )}>
                      {STATUS_CONFIG[invoice.status].label}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-legal-gold">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-green-400">
                        <CreditCard className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
