"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { usersService, rolesService } from "@/services/admin.service";
import { RoleDto } from "@/types/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, User, Shield, Save } from "lucide-react";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id as string;

  const [editData, setEditData] = useState({ fullName: "", email: "" });
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersService.getById(userId),
    enabled: !!userId,
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: rolesService.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { fullName: string; email: string }) =>
      usersService.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success("تم تحديث المستخدم بنجاح");
    },
    onError: () => toast.error("فشل تحديث المستخدم"),
  });

  const assignRolesMutation = useMutation({
    mutationFn: () => usersService.assignRoles(userId, selectedRoleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success("تم تعيين الأدوار بنجاح");
      setIsRolesOpen(false);
    },
    onError: () => toast.error("فشل تعيين الأدوار"),
  });

  const openRolesDialog = () => {
    const userRoleNames = user?.roles || [];
    const matchedIds = roles
      ?.filter((r) => userRoleNames.includes(r.name))
      .map((r) => r.id) || [];
    setSelectedRoleIds(matchedIds);
    setIsRolesOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-slate-500">
        المستخدم غير موجود
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-2"
          onClick={() => router.push("/users")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <User className="w-8 h-8 text-teal-400" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            {user.fullName || "المستخدم"}
          </h1>
          <p className="text-slate-400 mt-1">{user.email}</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">معلومات المستخدم</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate(editData);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="editFullName" className="text-slate-300">الاسم الكامل</Label>
              <Input
                id="editFullName"
                defaultValue={user.fullName}
                onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail" className="text-slate-300">البريد الإلكتروني</Label>
              <Input
                id="editEmail"
                type="email"
                defaultValue={user.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-slate-50 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              الأدوار
            </CardTitle>
            <CardDescription className="text-slate-400">
              الأدوار المرتبطة بهذا المستخدم
            </CardDescription>
          </div>
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            onClick={openRolesDialog}
          >
            <Shield className="w-4 h-4 mr-2" />
            تعديل الأدوار
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.roles?.map((roleName) => (
              <Badge
                key={roleName}
                variant="outline"
                className="bg-teal-500/10 text-teal-400 border-teal-500/20"
              >
                {roleName}
              </Badge>
            ))}
            {(!user.roles || user.roles.length === 0) && (
              <p className="text-slate-500 text-sm">لا توجد أدوار</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign Roles Dialog */}
      <Dialog open={isRolesOpen} onOpenChange={setIsRolesOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>تعيين الأدوار</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[50vh] overflow-y-auto">
            {roles?.map((role: RoleDto) => (
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