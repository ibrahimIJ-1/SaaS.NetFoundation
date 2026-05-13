"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { caseService } from "@/services/case.service";
import { billingService } from "@/services/billing.service";
import { useAuth } from "@/providers/auth-provider";
import { usePortalDocuments, useSignDocument } from "@/hooks/use-documents";
import { toast } from "sonner";
import { SignaturePad } from "@/components/portal/signature-pad";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Briefcase,
  FileText,
  MessageSquare,
  Clock,
  CreditCard,
  ChevronLeft,
  Search,
  Scale,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatPortal } from "@/components/portal/chat-portal";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PortalDashboard() {
  const { user } = useAuth();
  const { data: cases } = useQuery({
    queryKey: ["portal-cases"],
    queryFn: () => caseService.getAllCases(),
  });
  const { data: sharedDocs } = usePortalDocuments();
  const signDocument = useSignDocument();
  const { data: invoices } = useQuery({
    queryKey: ["portal-invoices"],
    queryFn: () => billingService.getInvoices(),
  });

  const [signingDoc, setSigningDoc] = useState<{ id: string; name: string } | null>(null);

  const activeCasesCount =
    cases?.filter((c) => c.status !== "Archived").length || 0;
  const totalBalance =
    invoices?.reduce(
      (sum, inv) => sum + (inv.status !== "Cancelled" ? (inv.totalAmount - inv.paidAmount) : 0),
      0,
    ) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700" dir="rtl">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-legal-primary to-legal-secondary p-8 border border-legal-secondary/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-legal-gold rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-legal-gold mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">
                بوابة الموكل الآمنة
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-50 font-heading mb-2">
              مرحباً، {user?.fullName || "عزيزي الموكل"}
            </h1>
            <p className="text-slate-400 max-w-lg">
              يمكنك من هنا متابعة قضاياك، تحميل المستندات المشتركة، والتواصل
              المباشر مع فريقك القانوني بكل خصوصية.
            </p>
          </div>

          <div className="flex gap-3">
            <GlassCard className="p-4 text-center min-w-[120px] bg-slate-900/40 border-legal-gold/20">
              <p className="text-xs text-slate-500 mb-1">القضايا النشطة</p>
              <p className="text-2xl font-bold text-legal-gold">
                {activeCasesCount}
              </p>
            </GlassCard>
            <GlassCard className="p-4 text-center min-w-[120px] bg-slate-900/40 border-legal-gold/20">
              <p className="text-xs text-slate-500 mb-1">الجلسة القادمة</p>
              <p className="text-2xl font-bold text-slate-50">15 مايو</p>
            </GlassCard>
          </div>
        </div>
      </div>

      <Tabs defaultValue="cases" className="w-full">
        <TabsList className="bg-slate-900/50 border border-slate-800 p-1 rounded-xl w-full max-w-md">
          <TabsTrigger
            value="cases"
            className="rounded-lg data-[state=active]:bg-legal-gold data-[state=active]:text-legal-primary py-2.5"
          >
            <Briefcase className="w-4 h-4 ml-2" />
            قضاياي
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-lg data-[state=active]:bg-legal-gold data-[state=active]:text-legal-primary py-2.5"
          >
            <FileText className="w-4 h-4 ml-2" />
            المستندات
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="rounded-lg data-[state=active]:bg-legal-gold data-[state=active]:text-legal-primary py-2.5"
          >
            <MessageSquare className="w-4 h-4 ml-2" />
            المحادثة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases?.map((c) => (
              <GlassCard
                key={c.id}
                className="group hover:border-legal-gold/30 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <StatusBadge status={c.status} />
                    <span className="text-[10px] text-slate-500">
                      {new Date(c.openDate).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-legal-gold transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mb-4">
                    {c.caseNumber}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">المحامي المسؤول:</span>
                      <span className="text-slate-300">
                        {c.assignedLawyerName}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">نوع القضية:</span>
                      <span className="text-slate-300">{c.caseType}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-slate-300 gap-2 border border-slate-700">
                    التفاصيل الكاملة
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </GlassCard>
            ))}
            {!cases?.length && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 text-slate-700">
                  <Briefcase className="w-8 h-8" />
                </div>
                <p className="text-slate-500">
                  لا توجد قضايا نشطة مسجلة باسمك حالياً.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedDocs?.map((doc) => (
              <GlassCard key={doc.id} className="p-5 border-slate-800 hover:border-legal-gold/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-900 rounded-lg text-legal-gold border border-slate-800">
                    <FileText className="w-5 h-5" />
                  </div>
                  {doc.needsSignature && !doc.isSigned && (
                    <Badge className="bg-legal-danger/20 text-legal-danger border-legal-danger/30 animate-pulse">
                      بانتظار التوقيع
                    </Badge>
                  )}
                  {doc.isSigned && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      تم التوقيع
                    </Badge>
                  )}
                </div>
                
                <h4 className="text-slate-100 font-bold mb-1 truncate">{doc.fileName}</h4>
                <p className="text-[10px] text-slate-500 mb-4">تم الرفع في: {new Date(doc.uploadDate).toLocaleDateString('ar-SA')}</p>

                <div className="flex gap-2">
                  <Button render={<a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">عرض</a>} variant="outline" size="sm" className="flex-1 border-slate-800 text-slate-400 text-xs" />
                  {doc.needsSignature && !doc.isSigned && (
                    <Dialog open={signingDoc?.id === doc.id} onOpenChange={(open) => !open && setSigningDoc(null)}>
                      <DialogTrigger render={
                        <Button size="sm" className="flex-1 bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold text-xs" onClick={() => setSigningDoc({ id: doc.id, name: doc.fileName })}>
                          توقيع
                        </Button>
                      } />
                      <DialogContent className="bg-slate-950 border-slate-800 max-w-xl">
                        <DialogHeader>
                          <DialogTitle className="text-slate-100">توقيع مستند: {doc.fileName}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <SignaturePad 
                            documentId={doc.id} 
                            onSigned={() => {
                              setSigningDoc(null);
                              toast.success("تم توقيع المستند بنجاح");
                            }} 
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </GlassCard>
            ))}
            {!sharedDocs?.length && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 text-slate-700">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-slate-500">لا توجد مستندات مشاركة معك حالياً.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <div className="max-w-4xl mx-auto">
            {cases && cases.length > 0 ? (
              <ChatPortal 
                otherUserId={cases[0].assignedLawyerId} 
                otherUserName={cases[0].assignedLawyerName}
                caseId={cases[0].id}
              />
            ) : (
              <div className="py-20 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                سيتم تفعيل المحادثة فور تعيين محامي لقضيتك.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
