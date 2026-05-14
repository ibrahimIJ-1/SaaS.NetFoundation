"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export default function AuditLogPage() {
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  if (!hasPermission("Audit.View")) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <AlertTriangle className="w-12 h-12 mb-4 text-slate-600" />
        <h2 className="text-xl font-semibold text-slate-400 mb-2">غير مصرح</h2>
        <p>ليس لديك صلاحية الوصول إلى سجل التدقيق</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Clock className="w-8 h-8 text-teal-400" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            سجل التدقيق
          </h1>
          <p className="text-slate-400 mt-1">
            تتبع التغييرات والإجراءات في النظام
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="بحث في سجل التدقيق..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border-slate-800 pr-10 focus-visible:ring-teal-500"
          />
        </div>
        <Button variant="outline" className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800">
          تصفية
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">الأحداث الأخيرة</CardTitle>
          <CardDescription className="text-slate-400">
            سجل التغييرات والإجراءات في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-950/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">الوقت</TableHead>
                <TableHead className="text-slate-400">المستخدم</TableHead>
                <TableHead className="text-slate-400">الإجراء</TableHead>
                <TableHead className="text-slate-400">الكيان</TableHead>
                <TableHead className="text-slate-400">التفاصيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="w-8 h-8 text-slate-600" />
                    <p>سجل التدقيق يتطلب إعداد خادم الخلفية</p>
                    <p className="text-xs text-slate-600">
                      ستظهر هنا أحداث التدقيق عند توفرها
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}