'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { billingService } from '@/services/billing.service';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  ArrowRight,
  Filter,
  Plus
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import NewInvoiceModal from './_components/new-invoice-modal';

const statusStyles = {
  Draft: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  Unpaid: "bg-red-500/10 text-red-500 border-red-500/20",
  PartiallyPaid: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Void: "bg-slate-900 text-slate-400 border-slate-800"
};

export default function BillingDashboard() {
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['billing-summary'],
    queryFn: billingService.getBillingSummary
  });

  const { data: invoices, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ['billing-invoices'],
    queryFn: () => billingService.getInvoices()
  });

  const stats = [
    {
      title: "Total Outstanding",
      value: summary?.totalOutstanding ?? 0,
      icon: AlertCircle,
      description: "Remaining patient balances",
      color: "text-red-400"
    },
    {
      title: "Monthly Revenue",
      value: summary?.revenueThisMonth ?? 0,
      icon: TrendingUp,
      description: "Total invoiced this month",
      color: "text-teal-400"
    },
    {
      title: "Monthly Collection",
      value: summary?.collectedThisMonth ?? 0,
      icon: CreditCard,
      description: "Payments received this month",
      color: "text-emerald-400"
    },
    {
      title: "Total Collected",
      value: summary?.totalCollected ?? 0,
      icon: Receipt,
      description: "Lifetime collection",
      color: "text-slate-400"
    }
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Billing & Financials</h1>
          <p className="text-slate-400 mt-1">Overview of clinic revenue and patient balances.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button 
            className="bg-teal-600 hover:bg-teal-500 text-white"
            onClick={() => setIsNewInvoiceOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden group hover:border-teal-500/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-24 bg-slate-800" />
              ) : (
                <div className="text-2xl font-bold text-slate-100 tracking-tight">
                  ${stat.value.toLocaleString()}
                </div>
              )}
              <CardDescription className="text-xs text-slate-500 mt-1">
                {stat.description}
              </CardDescription>
            </CardContent>
            <div className={cn("h-1 w-full mt-2", stat.color.replace('text', 'bg').replace('400', '500/20'))} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-100">Recent Invoices</CardTitle>
                <CardDescription>The latest financial transactions across the clinic.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10">
                View All Invoices
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isInvoicesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full bg-slate-800" />)}
              </div>
            ) : (
              <Table>
                <TableHeader className="hover:bg-transparent">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Invoice #</TableHead>
                    <TableHead className="text-slate-400">Patient</TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400">Balance</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary?.recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <TableCell className="font-medium text-slate-200">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-slate-300">{invoice.patientName}</TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-slate-200">${invoice.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className={cn(
                        "font-medium",
                        invoice.balance > 0 ? "text-red-400" : "text-emerald-400"
                      )}>
                        ${invoice.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-normal", statusStyles[invoice.status as keyof typeof statusStyles])}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link 
                          href={`/patients/${invoice.patientId}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-slate-400 hover:text-slate-200")}
                        >
                          Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!summary?.recentInvoices || summary.recentInvoices.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <NewInvoiceModal 
        isOpen={isNewInvoiceOpen} 
        onClose={() => setIsNewInvoiceOpen(false)} 
      />
    </div>
  );
}
