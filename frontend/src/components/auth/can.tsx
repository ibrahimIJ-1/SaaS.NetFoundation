"use client";

import { ReactNode } from "react";
import { useAuth } from "@/providers/auth-provider";

interface CanProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const { hasPermission } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface CanRoleProps {
  role: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function CanRole({ role, fallback = null, children }: CanRoleProps) {
  const { hasRole } = useAuth();

  if (hasRole(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface CanFeatureProps {
  feature: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function CanFeature({ feature, fallback = null, children }: CanFeatureProps) {
  const { hasFeature } = useAuth();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}