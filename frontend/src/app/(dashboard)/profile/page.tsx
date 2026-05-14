"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { profileService, UpdateProfileDto } from "@/services/admin.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Lock } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<UpdateProfileDto>({
    fullName: user?.fullName || "",
    jobTitle: user?.jobTitle || "",
    preferredLanguage: user?.preferredLanguage || "ar",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateMutation = useMutation({
    mutationFn: profileService.update,
    onSuccess: () => {
      toast.success("تم تحديث الملف الشخصي بنجاح");
    },
    onError: () => toast.error("فشل تحديث الملف الشخصي"),
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }
    updateMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <User className="w-8 h-8 text-teal-400" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            الملف الشخصي
          </h1>
          <p className="text-slate-400 mt-1">
            عرض وتعديل معلومات حسابك
          </p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">معلومات الحساب</CardTitle>
          <CardDescription className="text-slate-400">
            بريدك الإلكتروني والأدوار لا يمكن تغييرها من هنا
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 rounded-lg bg-slate-950 border border-slate-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500 text-sm">البريد الإلكتروني</Label>
                <p className="text-slate-200 font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-slate-500 text-sm">الأدوار</Label>
                <p className="text-slate-200 font-medium">{user?.roles?.join("، ") || "لا يوجد"}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">الاسم الكامل</Label>
              <Input
                id="fullName"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-slate-300">المسمى الوظيفي</Label>
              <Input
                id="jobTitle"
                value={profileData.jobTitle}
                onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language" className="text-slate-300">اللغة</Label>
              <select
                id="language"
                value={profileData.preferredLanguage}
                onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-400" />
            تغيير كلمة المرور
          </CardTitle>
          <CardDescription className="text-slate-400">
            أدخل كلمة المرور الحالية والجديدة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-slate-300">كلمة المرور الحالية</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-300">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">تأكيد كلمة المرور الجديدة</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              {updateMutation.isPending ? "جارٍ الحفظ..." : "تغيير كلمة المرور"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}