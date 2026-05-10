'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/providers/auth-provider';
import { apiClient } from '@/services/api-client';
import { AuthResponse } from '@/types/auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  tenantId: z.string().min(1, 'Clinic ID is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantId: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data, {
        headers: {
          'X-Tenant-ID': data.tenantId,
        },
      });

      login(response.data.token, response.data.tenantId, response.data.user);
      toast.success('Logged in successfully');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-950 to-slate-950"></div>
      
      <Card className="w-full max-w-md relative z-10 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader className="space-y-3 items-center text-center pb-8">
          <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center mb-2">
            <Activity className="w-6 h-6 text-teal-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-50">
            TeethDen Platform
          </CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to access your clinic workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Clinic ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. tenant1" className="bg-slate-950/50 border-slate-800" {...field} />
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
                    <FormLabel className="text-slate-300">Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@clinic.com" type="email" className="bg-slate-950/50 border-slate-800" {...field} />
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
                    <FormLabel className="text-slate-300">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="bg-slate-950/50 border-slate-800" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-500 text-white mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
