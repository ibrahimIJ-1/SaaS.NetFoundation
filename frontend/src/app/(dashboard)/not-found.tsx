"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <FileQuestion className="w-16 h-16 mb-4 text-slate-600" />
      <h2 className="text-2xl font-semibold text-slate-400 mb-2">
        الصفحة غير موجودة
      </h2>
      <p className="text-slate-500 mb-6">
        الصفحة التي تبحث عنها غير متوفرة
      </p>
      <Link href="/">
        <Button className="bg-teal-600 hover:bg-teal-500 text-white">
          العودة إلى الرئيسية
        </Button>
      </Link>
    </div>
  );
}