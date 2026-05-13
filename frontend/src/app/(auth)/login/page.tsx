"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/providers/auth-provider";
import { apiClient } from "@/services/api-client";
import { AuthResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Scale, ShieldCheck, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/glass-card";

const loginSchema = z.object({
  tenantId: z.string().min(1, "معرف المكتب مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.roles.includes("Client")) {
        router.push("/portal");
      } else {
        router.push("/");
      }
    }
  }, [user, isAuthLoading, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantId: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", data, {
        headers: {
          "X-Tenant-ID": data.tenantId,
        },
      });

      login(response.data.token, response.data.tenantId, response.data.user);
      toast.success("تم تسجيل الدخول بنجاح");
      
      if (response.data.user.roles.includes("Client")) {
        router.push("/portal");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data || "فشل تسجيل الدخول. يرجى التحقق من البيانات."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-legal-primary p-4 overflow-hidden relative" dir="rtl">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-full h-full opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-legal-gold/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-legal-secondary/40 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-legal-secondary/30">
        {/* Left Side: Branding & Welcome */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-legal-primary to-legal-secondary text-slate-50 border-l border-legal-secondary/50">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-legal-gold/20 rounded-xl flex items-center justify-center border border-legal-gold/30">
                <Scale className="w-7 h-7 text-legal-gold" />
              </div>
              <span className="text-3xl font-bold tracking-tight font-heading text-legal-gold">
                قانوني | Qanuni
              </span>
            </div>
            <h1 className="text-4xl font-bold font-heading leading-tight mb-6">
              نظام إدارة المكاتب والشركات القانونية الحديث
            </h1>
            <p className="text-slate-400 text-lg max-w-md">
              منصة ذكية متكاملة لإدارة القضايا، الموكلين، المستندات، والجلسات
              بدقة واحترافية عالية.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-legal-gold/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-legal-gold" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">أمان عالي</h4>
                <p className="text-sm text-slate-400">تشفير كامل لجميع المستندات والبيانات الحساسة.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-legal-gold/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4 text-legal-gold" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">إدارة شاملة</h4>
                <p className="text-sm text-slate-400">تتبع القضايا والجلسات والمهام في مكان واحد.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="bg-slate-900/40 backdrop-blur-3xl p-8 lg:p-12 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Scale className="w-8 h-8 text-legal-gold" />
            <span className="text-2xl font-bold font-heading text-legal-gold">قانوني</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-50 font-heading">تسجيل الدخول</h2>
            <p className="text-slate-400 mt-2">مرحباً بك مجدداً، يرجى إدخال بياناتك للوصول.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">معرف المكتب (Office ID)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مثال: tenant1"
                        className="bg-legal-primary/50 border-legal-secondary h-12 focus:ring-legal-gold/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@lawfirm.com"
                        type="email"
                        className="bg-legal-primary/50 border-legal-secondary h-12 focus:ring-legal-gold/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">كلمة المرور</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-legal-primary/50 border-legal-secondary h-12 focus:ring-legal-gold/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="rounded border-legal-secondary bg-legal-primary" />
                  <label htmlFor="remember" className="text-slate-400">تذكرني</label>
                </div>
                <a href="#" className="text-legal-gold hover:underline">نسيت كلمة المرور؟</a>
              </div>

              <Button
                type="submit"
                className="w-full bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold h-12 text-lg shadow-lg shadow-legal-gold/10 mt-4 transition-all hover:scale-[1.01]"
                disabled={isLoading}
              >
                {isLoading ? "جاري التحميل..." : "دخول"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-slate-500 text-sm mt-8">
            &copy; {new Date().getFullYear()} Qanuni Platform. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}

