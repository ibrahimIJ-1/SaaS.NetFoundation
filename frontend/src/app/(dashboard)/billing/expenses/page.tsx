"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financialService, Expense } from "@/services/financial.service";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Receipt,
  Plus,
  Trash2,
  Search,
  FileText,
  TrendingDown,
  Building2,
  Scale,
  Car,
  Package,
  Megaphone,
  MoreHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_MAP: Record<
  number,
  { label: string; icon: any; color: string }
> = {
  0: { label: "رسوم محكمة", icon: Scale, color: "text-blue-500" },
  1: { label: "مواصلات", icon: Car, color: "text-orange-500" },
  2: { label: "إيجار المكتب", icon: Building2, color: "text-purple-500" },
  3: { label: "خدمات (كهرباء/ماء)", icon: Package, color: "text-yellow-500" },
  4: { label: "قرطاسية", icon: FileText, color: "text-green-500" },
  5: { label: "تسويق", icon: Megaphone, color: "text-pink-500" },
  6: { label: "أخرى", icon: Receipt, color: "text-slate-400" },
};

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: financialService.getExpenses,
  });

  const deleteMutation = useMutation({
    mutationFn: financialService.deleteExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const totalExpenses =
    expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <Receipt className="w-8 h-8 text-legal-gold" />
            مصاريف المكتب
          </h1>
          <p className="text-muted-foreground mt-1">
            تتبع المصاريف التشغيلية وتكاليف القضايا.
          </p>
        </div>
        <Button className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold gap-2">
          <Plus className="w-4 h-4" />
          إضافة مصروف جديد
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-r-4 border-r-legal-danger">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                إجمالي المصاريف (هذا الشهر)
              </p>
              <h3 className="text-2xl font-bold text-foreground font-mono">
                ${totalExpenses.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-legal-danger/10 rounded-xl text-legal-danger">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/20 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث في المصاريف..."
              className="pr-10 bg-background border-border"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border">
              <TableHead className="text-right font-bold text-foreground">
                التاريخ
              </TableHead>
              <TableHead className="text-right font-bold text-foreground">
                البند
              </TableHead>
              <TableHead className="text-right font-bold text-foreground">
                الفئة
              </TableHead>
              <TableHead className="text-right font-bold text-foreground">
                القيمة
              </TableHead>
              <TableHead className="text-right font-bold text-foreground">
                الارتباط
              </TableHead>
              <TableHead className="text-left font-bold text-foreground">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground italic"
                >
                  جاري تحميل المصاريف...
                </TableCell>
              </TableRow>
            ) : expenses?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground italic"
                >
                  لا توجد مصاريف مسجلة.
                </TableCell>
              </TableRow>
            ) : (
              expenses?.map((expense) => {
                const Category =
                  CATEGORY_MAP[expense.category] || CATEGORY_MAP[6];
                const Icon = Category.icon;
                return (
                  <TableRow
                    key={expense.id}
                    className="border-border hover:bg-secondary/10 transition-colors group"
                  >
                    <TableCell className="font-mono text-xs">
                      {new Date(expense.expenseDate).toLocaleDateString(
                        "ar-SA",
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold">{expense.title}</div>
                      {expense.description && (
                        <div className="text-xs text-muted-foreground">
                          {expense.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "gap-1.5 py-1 px-3 border border-transparent",
                          Category.color,
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {Category.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-foreground font-mono">
                      ${expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {expense.legalCaseId ? (
                        <Badge
                          variant="outline"
                          className="text-legal-gold border-legal-gold/30"
                        >
                          قضية مرتبطة
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          مصروف عام
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-legal-danger opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteMutation.mutate(expense.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
}
