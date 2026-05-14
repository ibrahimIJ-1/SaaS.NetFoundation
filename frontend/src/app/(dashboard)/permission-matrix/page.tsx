"use client";

import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/admin.service";
import { permissionsService } from "@/services/admin.service";
import { UserPermissionMatrixDto } from "@/types/admin";
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
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default function PermissionMatrixPage() {
  const { data: allPermissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionsService.getAll,
  });

  const { data: matrixData, isLoading: matrixLoading } = useQuery({
    queryKey: ["permission-matrix"],
    queryFn: () => usersService.getPermissionMatrix(),
  });

  const permissionNames = allPermissions?.map((p) => p.name) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ShieldCheck className="w-8 h-8 text-teal-400" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            مصفوفة الصلاحيات
          </h1>
          <p className="text-slate-400 mt-1">
            عرض صلاحيات جميع المستخدمين في مكان واحد
          </p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">المستخدمون والصلاحيات</CardTitle>
          <CardDescription className="text-slate-400">
            نظرة شاملة على صلاحيات كل مستخدم
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matrixLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 min-w-[200px]">المستخدم</TableHead>
                    <TableHead className="text-slate-400">الأدوار</TableHead>
                    <TableHead className="text-slate-400">عدد الصلاحيات</TableHead>
                    <TableHead className="text-slate-400">الصلاحيات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrixData?.map((user: UserPermissionMatrixDto) => (
                    <TableRow
                      key={user.userId}
                      className="border-slate-800 hover:bg-slate-800/50"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-200">
                            {user.email}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {user.userId.substring(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-xs"
                            >
                              {role}
                            </Badge>
                          ))}
                          {user.roles.length === 0 && (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <Badge
                          variant="outline"
                          className="bg-slate-950 text-slate-300 border-slate-700"
                        >
                          {user.permissions.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.slice(0, 5).map((perm) => (
                            <Badge
                              key={perm}
                              variant="outline"
                              className="bg-slate-950 text-slate-400 border-slate-700 text-xs"
                            >
                              {perm}
                            </Badge>
                          ))}
                          {user.permissions.length > 5 && (
                            <Badge
                              variant="outline"
                              className="bg-slate-950 text-slate-500 border-slate-700 text-xs"
                            >
                              +{user.permissions.length - 5}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {matrixData?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        لا توجد بيانات
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}