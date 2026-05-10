"use client";

import { useAuth } from "@/providers/auth-provider";

export default function Dashboard() {
  const { user } = useAuth();

  return <div></div>;
}
