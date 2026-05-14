"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, rolesService } from "@/services/admin.service";
import { UserDto, CreateUserDto, UpdateUserDto, RoleDto } from "@/types/admin";
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
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Edit, Trash, Shield, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

export default function UsersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRolesOpen, setIsRolesOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  const [createData, setCreateData] = useState<CreateUserDto>({ email: "", fullName: "", password: "", role: "User" });
  const [editData, setEditData] = useState<UpdateUserDto>({ email: "", fullName: "" });
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: usersService.getAll,
  });

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: rolesService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("تم إنشاء المستخدم بنجاح");
      setIsCreateOpen(false);
      setCreateData({ email: "", fullName: "", password: "", role: "User" });
    },
    onError: () => toast.error("فشل إنشاء المستخدم"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => usersService.update(selectedUser!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("تم تحديث المستخدم بنجاح");
      setIsEditOpen(false);
    },
    onError: () => toast.error("فشل تحديث المستخدم"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersService.delete(selectedUser!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("تم حذف المستخدم بنجاح");
      setIsDeleteOpen(false);
    },
    onError: () => toast.error("فشل حذف المستخدم"),
  });

  const assignRolesMutation = useMutation({
    mutationFn: () => usersService.assignRoles(selectedUser!.id, selectedRoleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("تم تعيين الأدوار بنجاح");
      setIsRolesOpen(false);
    },
    onError: () => toast.error("فشل تعيين الأدوار"),
  });

  const openEdit = (user: UserDto) => {
    setSelectedUser(user);
    setEditData({
      email: user.email,
      fullName: user.fullName || "",
    });
    setIsEditOpen(true);
  };

  const openDelete = (user: UserDto) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const openRoles = (user: UserDto) => {
    setSelectedUser(user);
    setSelectedRoleIds([]);
    setIsRolesOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            المستخدمون
          </h1>
          <p className="text-slate-400 mt-1">
            إدارة المستخدمين والصلاحيات
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            onClick={() => router.push("/roles")}
          >
            <Shield className="w-4 h-4 mr-2" />
            إدارة الأدوار
          </Button>
          <Can permission="Users.Create">
            <Button 
              className="bg-teal-600 hover:bg-teal-500 text-white"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة مستخدم
            </Button>
          </Can>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">قائمة المستخدمين</CardTitle>
          <CardDescription className="text-slate-400">
            جميع المستخدمين المسجلين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">المستخدم</TableHead>
                  <TableHead className="text-slate-400">البريد الإلكتروني</TableHead>
                  <TableHead className="text-slate-400">الأدوار</TableHead>
                  <TableHead className="text-right text-slate-400">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-slate-800 hover:bg-slate-800/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold overflow-hidden">
                          {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">
                            {user.fullName || "بدون اسم"}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(role => (
                          <Badge key={role} variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-xs">
                            {role}
                          </Badge>
                        ))}
                        {(!user.roles || user.roles.length === 0) && (
                          <span className="text-xs text-slate-500">لا يوجد</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-slate-900 border-slate-800 text-slate-300"
                        >
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem className="focus:bg-slate-800 focus:text-slate-200 cursor-pointer" onClick={() => openEdit(user)}>
                            <Edit className="w-4 h-4 mr-2" /> تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-slate-800 focus:text-slate-200 cursor-pointer" onClick={() => openRoles(user)}>
                            <Shield className="w-4 h-4 mr-2" /> تعيين الأدوار
                          </DropdownMenuItem>
                          <Can permission="Users.Delete">
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400 text-red-400 cursor-pointer" onClick={() => openDelete(user)}>
                              <Trash className="w-4 h-4 mr-2" /> حذف
                            </DropdownMenuItem>
                          </Can>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {users?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500"
                    >
                      لا يوجد مستخدمون
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(createData); }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">الاسم الكامل *</Label>
                <Input
                  id="fullName"
                  required
                  value={createData.fullName}
                  onChange={(e) => setCreateData({ ...createData, fullName: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">كلمة المرور المؤقتة *</Label>
                <Input
                  id="password"
                  required
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">الدور الأولي</Label>
                <select
                  id="role"
                  value={createData.role}
                  onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  {roles?.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                  {(!roles || roles.length === 0) && <option value="User">User</option>}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending} className="bg-teal-600 hover:bg-teal-500 text-white">
                {createMutation.isPending ? "جارٍ الحفظ..." : "إنشاء مستخدم"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(editData); }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editFullName" className="text-slate-300">الاسم الكامل *</Label>
                <Input
                  id="editFullName"
                  required
                  value={editData.fullName}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail" className="text-slate-300">البريد الإلكتروني *</Label>
                <Input
                  id="editEmail"
                  type="email"
                  required
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-teal-600 hover:bg-teal-500 text-white">
                {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              هل أنت متأكد من حذف <strong>{selectedUser?.fullName}</strong>؟ هذا الإجراء لا يمكن التراجع عنه.
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

      {/* Assign Roles Modal */}
      <Dialog open={isRolesOpen} onOpenChange={setIsRolesOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>تعيين الأدوار</DialogTitle>
            <DialogDescription className="text-slate-400">
              اختر الأدوار لـ <strong>{selectedUser?.fullName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[50vh] overflow-y-auto">
            {roles?.map((role) => (
              <div key={role.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="rounded border-slate-800 bg-slate-950 text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <Label htmlFor={`role-${role.id}`} className="text-slate-200 cursor-pointer flex-1">
                  {role.name}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRolesOpen(false)} className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
              إلغاء
            </Button>
            <Button onClick={() => assignRolesMutation.mutate()} disabled={assignRolesMutation.isPending} className="bg-teal-600 hover:bg-teal-500 text-white">
              {assignRolesMutation.isPending ? "جارٍ الحفظ..." : "حفظ الأدوار"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}