"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesService, permissionsService } from "@/services/admin.service";
import { RoleDto, CreateRoleDto } from "@/types/admin";
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
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Edit, Trash, ShieldCheck, AlertTriangle, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Can } from "@/components/auth/can";
import { useRouter } from "next/navigation";

const PERMISSION_ARABIC: Record<string, string> = {
  "Users.View": "عرض المستخدمين",
  "Users.Create": "إنشاء مستخدم",
  "Users.Update": "تعديل مستخدم",
  "Users.Delete": "حذف مستخدم",
  "Roles.View": "عرض الأدوار",
  "Roles.Create": "إنشاء دور",
  "Roles.Update": "تعديل دور",
  "Roles.Delete": "حذف دور",
  "Cases.View": "عرض القضايا",
  "Cases.Create": "إنشاء قضية",
  "Cases.Update": "تعديل قضية",
  "Cases.Delete": "حذف قضية",
  "Cases.Assign": "تعيين قضية",
  "Cases.Close": "إغلاق قضية",
  "Documents.View": "عرض المستندات",
  "Documents.Create": "إنشاء مستند",
  "Documents.Update": "تعديل مستند",
  "Documents.Delete": "حذف مستند",
  "Documents.Upload": "رفع مستند",
  "Documents.Sign": "توقيع مستند",
  "Clients.View": "عرض الموكلين",
  "Clients.Create": "إنشاء موكل",
  "Clients.Update": "تعديل موكل",
  "Clients.Delete": "حذف موكل",
  "Clients.Communicate": "التواصل مع الموكل",
  "Calendar.View": "عرض التقويم",
  "Calendar.Create": "إنشاء حدث",
  "Calendar.Update": "تعديل حدث",
  "Calendar.Delete": "حذف حدث",
  "Tasks.View": "عرض المهام",
  "Tasks.Create": "إنشاء مهمة",
  "Tasks.Update": "تعديل مهمة",
  "Tasks.Delete": "حذف مهمة",
  "Tasks.Assign": "تعيين مهمة",
  "Billing.ViewInvoices": "عرض الفواتير",
  "Billing.CreateInvoices": "إنشاء فاتورة",
  "Billing.EditInvoices": "تعديل فاتورة",
  "Billing.DeleteInvoices": "حذف فاتورة",
  "Billing.RecordPayments": "تسجيل دفعة",
  "Billing.ViewReports": "عرض التقارير المالية",
  "Billing.ManageTrust": "إدارة الأمانات",
  "Communication.View": "عرض المراسلات",
  "Communication.Send": "إرسال مراسلة",
  "Reports.ViewOperational": "تقارير تشغيلية",
  "Reports.ViewFinancial": "تقارير مالية",
  "Reports.ViewClinical": "تقارير سريرية",
  "Reports.ViewAdministrative": "تقارير إدارية",
  "Reports.Export": "تصدير التقارير",
  "Settings.View": "عرض الإعدادات",
  "Settings.Update": "تعديل الإعدادات",
  "Settings.ManageFeatures": "إدارة الميزات",
  "Audit.View": "عرض سجل التدقيق",
  "Notifications.View": "عرض الإشعارات",
  "Notifications.Manage": "إدارة الإشعارات",
};

export default function RolesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: rolesService.getAll,
  });

  const { data: allPermissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleDto) => rolesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("تم إنشاء الدور بنجاح");
      setIsCreateOpen(false);
      setNewRoleName("");
    },
    onError: () => toast.error("فشل إنشاء الدور"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => rolesService.delete(selectedRole!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("تم حذف الدور بنجاح");
      setIsDeleteOpen(false);
    },
    onError: () => toast.error("فشل حذف الدور"),
  });

  const fetchRolePermissionsMutation = useMutation({
    mutationFn: (roleId: string) => rolesService.getById(roleId),
    onSuccess: (data) => {
      setSelectedPermissionIds(data.permissions.map(p => p.id));
    }
  });

  const assignPermissionsMutation = useMutation({
    mutationFn: () => rolesService.assignPermissions(selectedRole!.id, selectedPermissionIds),
    onSuccess: () => {
      toast.success("تم تحديث الصلاحيات بنجاح");
      setIsPermissionsOpen(false);
    },
    onError: () => toast.error("فشل تحديث الصلاحيات"),
  });

  const openDelete = (role: RoleDto) => {
    if (role.name === "Admin") {
      toast.error("لا يمكن حذف دور المشرف");
      return;
    }
    setSelectedRole(role);
    setIsDeleteOpen(true);
  };

  const openPermissions = (role: RoleDto) => {
    if (role.name === "Admin") {
      toast.error("دور المشرف لديه جميع الصلاحيات بشكل افتراضي");
      return;
    }
    setSelectedRole(role);
    setIsPermissionsOpen(true);
    fetchRolePermissionsMutation.mutate(role.id);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permissionId) ? prev.filter(p => p !== permissionId) : [...prev, permissionId]
    );
  };

  const handleCreate = () => {
    if (!newRoleName.trim()) {
      toast.error("يرجى إدخال اسم الدور");
      return;
    }
    createMutation.mutate({ name: newRoleName.trim(), permissionIds: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-2"
            onClick={() => router.push("/users")}
          >
            <ArrowLeft className ="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50">
              الأدوار والصلاحيات
            </h1>
            <p className="text-slate-400 mt-1">
              تحديد مستويات الوصول لمجموعات الموظفين المختلفة
            </p>
          </div>
        </div>
        <Can permission="Roles.Create">
          <Button onClick={() => setIsCreateOpen(true)} className="bg-teal-600 hover:bg-teal-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            إنشاء دور
          </Button>
        </Can>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">تعريفات الأدوار</CardTitle>
          <CardDescription className="text-slate-400">إدارة الأدوار والصلاحيات المرتبطة بها</CardDescription>
        </CardHeader>
        <CardContent>
          {rolesLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">اسم الدور</TableHead>
                  <TableHead className="text-slate-400">المعرف</TableHead>
                  <TableHead className="text-right text-slate-400">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles?.map((role) => (
                  <TableRow key={role.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-teal-500/10 flex items-center justify-center text-teal-400">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-200">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">{role.id}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300">
                          {role.name !== 'Admin' ? (
                            <>
                              <DropdownMenuItem className="focus:bg-slate-800 focus:text-slate-200 cursor-pointer" onClick={() => openPermissions(role)}>
                                <Edit className="w-4 h-4 mr-2" /> تعديل الصلاحيات
                              </DropdownMenuItem>
                              <Can permission="Roles.Delete">
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400 text-red-400 cursor-pointer" onClick={() => openDelete(role)}>
                                  <Trash className="w-4 h-4 mr-2" /> حذف
                                </DropdownMenuItem>
                              </Can>
                            </>
                          ) : (
                            <DropdownMenuItem disabled className="text-slate-500">
                              دور النظام (محمي)
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Role Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>إنشاء دور جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="roleName" className="text-slate-300">اسم الدور *</Label>
                <Input
                  id="roleName"
                  required
                  placeholder="مثال: محامٍ، سكرتير، محاسب"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending} className="bg-teal-600 hover:bg-teal-500 text-white">
                {createMutation.isPending ? "جارٍ الحفظ..." : "إنشاء دور"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Role Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              هل أنت متأكد من حذف دور <strong>{selectedRole?.name}</strong>؟ المستخدمون المرتبطون بهذا الدور سيفقدون الصلاحيات المرتبطة.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
              إلغاء
            </Button>
            <Button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="bg-red-600 hover:bg-red-500 text-white">
              {deleteMutation.isPending ? "جارٍ الحذف..." : "نعم، احذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Matrix Modal */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>تعديل الصلاحيات</DialogTitle>
            <DialogDescription className="text-slate-400">
              اختر صلاحيات الوصول لدور <strong>{selectedRole?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {fetchRolePermissionsMutation.isPending ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allPermissions?.map((permission) => {
                  const permLabel = PERMISSION_ARABIC[permission.name] || permission.name.split('.')[1] || permission.name;
                  return (
                    <div key={permission.id} className="flex items-start gap-3 p-3 rounded-md bg-slate-950 border border-slate-800">
                      <input
                        type="checkbox"
                        id={`perm-${permission.id}`}
                        checked={selectedPermissionIds.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="mt-1 rounded border-slate-700 bg-slate-900 text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <Label htmlFor={`perm-${permission.id}`} className="text-sm text-slate-300 cursor-pointer flex-1">
                        <div className="font-medium text-slate-200">{permLabel}</div>
                        <div className="text-xs text-slate-500">{permission.name}</div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)} className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
              إلغاء
            </Button>
            <Button onClick={() => assignPermissionsMutation.mutate()} disabled={assignPermissionsMutation.isPending || fetchRolePermissionsMutation.isPending} className="bg-teal-600 hover:bg-teal-500 text-white">
              {assignPermissionsMutation.isPending ? "جارٍ الحفظ..." : "حفظ الصلاحيات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}