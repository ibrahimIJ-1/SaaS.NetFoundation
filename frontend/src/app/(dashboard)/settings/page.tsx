"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { featuresService, FeatureDto } from "@/services/admin.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Can } from "@/components/auth/can";
import { Settings, ToggleLeft } from "lucide-react";

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: features, isLoading } = useQuery({
    queryKey: ["features"],
    queryFn: featuresService.getAll,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ featureKey, isEnabled }: { featureKey: string; isEnabled: boolean }) =>
      featuresService.toggle(featureKey, isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
      toast.success("تم تحديث الميزة بنجاح");
    },
    onError: () => toast.error("فشل تحديث الميزة"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Settings className="w-8 h-8 text-teal-400" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            الإعدادات
          </h1>
          <p className="text-slate-400 mt-1">
            إدارة إعدادات النظام والميزات
          </p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50 flex items-center gap-2">
            <ToggleLeft className="w-5 h-5 text-teal-400" />
            الميزات
          </CardTitle>
          <CardDescription className="text-slate-400">
            تفعيل أو تعطيل ميزات النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {features?.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-950 border border-slate-800"
                >
                  <div>
                    <Label
                      htmlFor={`feature-${feature.featureKey}`}
                      className="text-slate-200 font-medium cursor-pointer"
                    >
                      {feature.featureKey}
                    </Label>
                    {feature.description && (
                      <p className="text-sm text-slate-500 mt-1">
                        {feature.description}
                      </p>
                    )}
                  </div>
                  <Can permission="Settings.ManageFeatures">
                    <Switch
                      id={`feature-${feature.featureKey}`}
                      checked={feature.isEnabled}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({
                          featureKey: feature.featureKey,
                          isEnabled: checked,
                        })
                      }
                      disabled={toggleMutation.isPending}
                      className="data-[state=checked]:bg-teal-600"
                    />
                  </Can>
                </div>
              ))}
              {features?.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  لا توجد ميزات متاحة
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}