import * as React from "react";
import { LegalCase } from "@/types/case";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseTimeline } from "./case-timeline";
import { GlassCard } from "@/components/ui/glass-card";
import { AddNoteForm } from "./add-note-form";
import { AddSessionForm } from "./add-session-form";
import { AddPartyForm } from "./add-party-form";

import { CaseBillingTab } from "./case-billing-tab";
import {
  useCaseDocuments,
  useUploadDocument,
  useToggleSharing,
} from "@/hooks/use-documents";
import { DocumentVersionsModal } from "@/components/documents/document-versions-modal";

import {
  useUpdateCaseNote,
  useDeleteCaseNote,
  useUpdateCaseSession,
  useDeleteCaseSession,
} from "@/hooks/use-cases";
import { EditSessionModal } from "./edit-session-modal";

import {
  FileText,
  Download,
  ExternalLink,
  Plus,
  Loader2,
  ArrowLeftRight,
  Sparkles,
  MessageSquare,
  Share2,
  Lock,
  Edit2,
  Trash2,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DocumentWorkspace } from "../documents/document-workspace";
import { DocumentComparison } from "../documents/document-comparison";
import { CaseAISummary } from "../ai/case-ai-summary";
import { ChatWindow } from "../chat/chat-window";
import { cn } from "@/lib/utils";
import { EditCaseModal } from "./edit-case-modal";
import {
  getStatusLabel,
  getPriorityLabel,
  getCaseTypeLabel,
} from "@/lib/case-localization";
import { RichEditor } from "../ui/rich-editor";

interface CaseDetailTabsProps {
  caseData: LegalCase;
}

export function CaseDetailTabs({ caseData }: CaseDetailTabsProps) {
  const { data: documents, isLoading: docsLoading } = useCaseDocuments(
    caseData.id,
  );
  const uploadDoc = useUploadDocument();
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
  const [compareMode, setCompareMode] = React.useState(false);
  const [selectedForCompare, setSelectedForCompare] = React.useState<string[]>(
    [],
  );
  const [showComparison, setShowComparison] = React.useState(false);
  const toggleSharing = useToggleSharing();
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = React.useState("");
  const [selectedSession, setSelectedSession] = React.useState<any>(null);
  const [versioningDocId, setVersioningDocId] = React.useState<string | null>(
    null,
  );

  const updateNote = useUpdateCaseNote();

  const deleteNote = useDeleteCaseNote();
  const deleteSession = useDeleteCaseSession();

  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setEditNoteContent(note.noteText);
  };

  const handleSaveNoteEdit = () => {
    if (!editingNoteId) return;
    updateNote.mutate(
      { noteId: editingNoteId, noteText: editNoteContent },
      {
        onSuccess: () => {
          setEditingNoteId(null);
          toast.success("تم تحديث الملاحظة");
        },
      },
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadDoc.mutate(
      { caseId: caseData.id, file },
      {
        onSuccess: () => toast.success("تم رفع المستند بنجاح"),
        onError: () => toast.error("فشل رفع المستند"),
      },
    );
  };

  const toggleCompare = (docId: string) => {
    if (selectedForCompare.includes(docId)) {
      setSelectedForCompare((prev) => prev.filter((id) => id !== docId));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare((prev) => [...prev, docId]);
    }
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto p-1 bg-secondary border border-border">
        <TabsTrigger
          value="overview"
          className="py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger
          value="timeline"
          className="py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          السجل الزمني
        </TabsTrigger>
        <TabsTrigger
          value="documents"
          className="py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          المستندات ({documents?.length || 0})
        </TabsTrigger>
        <TabsTrigger
          value="notes"
          className="py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          الملاحظات ({caseData.notes?.length || 0})
        </TabsTrigger>
        <TabsTrigger
          value="sessions"
          className="py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          الجلسات ({caseData.sessions?.length || 0})
        </TabsTrigger>
        <TabsTrigger
          value="financial"
          className="py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          المالية
        </TabsTrigger>
        <TabsTrigger
          value="chat"
          className="py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground flex items-center gap-2"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          المحادثة
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="overview" className="m-0">
          <div className="space-y-6">
            <CaseAISummary caseId={caseData.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
                  <h3 className="text-lg font-bold text-foreground font-heading">
                    تفاصيل القضية
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-legal-gold gap-1"
                    onClick={() => setShowEditModal(true)}
                  >
                    <Edit2 className="w-3 h-3" />
                    تعديل
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground text-sm">
                      نوع القضية
                    </span>
                    <span className="col-span-2 text-foreground font-medium">
                      {getCaseTypeLabel(caseData.caseType)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground text-sm">
                      المحكمة
                    </span>
                    <span className="col-span-2 text-foreground font-medium">
                      {caseData.courtInfo}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground text-sm">
                      تاريخ الفتح
                    </span>
                    <span className="col-span-2 text-foreground font-medium">
                      {new Date(caseData.openDate).toLocaleDateString("ar")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground text-sm">
                      المحامي
                    </span>
                    <span className="col-span-2 text-foreground font-medium">
                      {caseData.assignedLawyerName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground text-sm">
                      الأولوية
                    </span>
                    <span className="col-span-2 text-foreground font-medium">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        caseData.priority === 'Urgent' && "bg-red-500/10 text-red-400 border-red-500/20",
                        caseData.priority === 'High' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                        caseData.priority === 'Medium' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                        caseData.priority === 'Low' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      )}>
                        {getPriorityLabel(caseData.priority.toString())}
                      </span>
                    </span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 flex flex-col h-full">
                <h3 className="text-lg font-bold text-foreground font-heading mb-4 border-b border-border pb-2">
                  تفاصيل الخصوم والأطراف
                </h3>
                <div className="flex-1 space-y-3 mb-4">
                  {caseData.opponents && caseData.opponents.length > 0 ? (
                    caseData.opponents.map((opp) => (
                      <div
                        key={opp.id}
                        className="p-3 bg-secondary/50 rounded border border-border"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-semibold text-foreground">
                            {opp.name}
                          </div>
                          {opp.partyType && (
                            <span className="text-xs bg-legal-gold/10 text-legal-gold px-2 py-0.5 rounded">
                              {opp.partyType}
                            </span>
                          )}
                        </div>
                        {opp.lawyerName && (
                          <div className="text-sm text-muted-foreground mt-1">
                            المحامي الممثل: {opp.lawyerName}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      لا يوجد أطراف مسجلين
                    </p>
                  )}
                </div>
                <div className="mt-auto">
                  <AddPartyForm caseId={caseData.id} />
                </div>
              </GlassCard>

              {caseData.description && (
                <GlassCard className="p-6 col-span-1 md:col-span-2">
                  <h3 className="text-lg font-bold text-foreground font-heading mb-4 border-b border-border pb-2">
                    الوصف
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {caseData.description}
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="m-0">
          <CaseTimeline caseId={caseData.id} />
        </TabsContent>

        <TabsContent value="documents" className="m-0">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground font-heading">
                المستندات المرفقة
              </h3>
              <div className="flex gap-2">
                {compareMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setCompareMode(false);
                        setSelectedForCompare([]);
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs bg-legal-gold text-legal-primary"
                      disabled={selectedForCompare.length !== 2}
                      onClick={() => setShowComparison(true)}
                    >
                      مقارنة المختار ({selectedForCompare.length})
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-2 text-muted-foreground"
                    onClick={() => setCompareMode(true)}
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    وضع المقارنة
                  </Button>
                )}

                <div className="relative">
                  <input
                    type="file"
                    id="case-doc-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadDoc.isPending}
                  />
                  <Button
                    render={
                      <button
                        className="inline-flex items-center justify-center rounded-lg border border-legal-gold/20 bg-legal-gold/10 px-3 py-1.5 text-sm font-medium text-legal-gold transition-colors hover:bg-legal-gold/20 disabled:opacity-50"
                        onClick={() =>
                          document.getElementById("case-doc-upload")?.click()
                        }
                        disabled={uploadDoc.isPending}
                      >
                        {uploadDoc.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        ) : (
                          <Plus className="w-4 h-4 ml-2" />
                        )}
                        رفع مستند
                      </button>
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {docsLoading ? (
                <div className="py-10 text-center text-muted-foreground">
                  جاري التحميل...
                </div>
              ) : (
                documents?.filter(d => !d.parentDocumentId).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border group hover:border-legal-gold/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-900 rounded-lg text-legal-gold border border-slate-800">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">
                          {doc.fileName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          بواسطة: {doc.uploadedBy} •{" "}
                          {new Date(doc.uploadDate).toLocaleDateString("ar")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-legal-gold"
                        onClick={() => setVersioningDocId(doc.id)}
                        title="سجل الإصدارات"
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 transition-colors",

                          doc.isSharedWithClient
                            ? "text-legal-gold bg-legal-gold/10"
                            : "text-muted-foreground hover:text-legal-gold",
                        )}
                        onClick={() =>
                          toggleSharing.mutate({
                            documentId: doc.id,
                            isShared: !doc.isSharedWithClient,
                          })
                        }
                        title={
                          doc.isSharedWithClient
                            ? "إلغاء المشاركة مع الموكل"
                            : "مشاركة مع الموكل"
                        }
                      >
                        {doc.isSharedWithClient ? (
                          <Share2 className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </Button>

                      {compareMode ? (
                        <input
                          type="checkbox"
                          checked={selectedForCompare.includes(doc.id)}
                          onChange={() => toggleCompare(doc.id)}
                          className="w-5 h-5 accent-legal-gold"
                        />
                      ) : (
                        <>
                          <Button
                            render={
                              <button
                                onClick={() => setSelectedDocId(doc.id)}
                                className="p-2 text-muted-foreground hover:text-legal-gold transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            }
                            variant="ghost"
                            size="icon"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-legal-gold"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              {!documents?.filter(d => !d.parentDocumentId).length && !docsLoading && (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  لا توجد مستندات مرفوعة لهذه القضية حتى الآن.
                </div>
              )}
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="notes" className="m-0">
          <GlassCard className="p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-foreground font-heading mb-4">
              الملاحظات ({caseData.notes?.length || 0})
            </h3>
            <div className="flex-1 space-y-4 mb-4">
              {caseData.notes?.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-secondary/30 rounded-lg border border-border group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {note.authorName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(note.date).toLocaleString("ar")}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-legal-gold"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذه الملاحظة؟")) {
                            deleteNote.mutate(note.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {editingNoteId === note.id ? (
                    <div className="space-y-3 mt-2">
                      <RichEditor
                        value={editNoteContent}
                        onChange={setEditNoteContent}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingNoteId(null)}
                        >
                          إلغاء
                        </Button>
                        <Button
                          size="sm"
                          className="bg-legal-gold text-legal-primary"
                          onClick={handleSaveNoteEdit}
                          disabled={updateNote.isPending}
                        >
                          {updateNote.isPending
                            ? "جاري الحفظ..."
                            : "حفظ التعديلات"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="text-muted-foreground text-sm rich-text-preview"
                      dangerouslySetInnerHTML={{ __html: note.noteText }}
                    />
                  )}
                </div>
              ))}

              {!caseData.notes?.length && (
                <p className="text-center text-muted-foreground py-4">
                  لا توجد ملاحظات لهذه القضية.
                </p>
              )}
            </div>
            <div className="mt-auto border-t border-border pt-4">
              <AddNoteForm caseId={caseData.id} />
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="sessions" className="m-0">
          <GlassCard className="p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-foreground font-heading mb-4">
              الجلسات المحكمة
            </h3>
            <div className="flex-1 space-y-4 mb-4">
              {caseData.sessions?.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-secondary/30 rounded-lg border border-border flex justify-between items-center group"
                >
                  <div className="flex gap-4 items-center">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-legal-gold"
                        onClick={() => setSelectedSession(session)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذه الجلسة؟")) {
                            deleteSession.mutate(session.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">
                        {session.courtName}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        القاضي: {session.judgeName || "غير محدد"}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-legal-danger" dir="ltr">
                      {new Date(session.sessionDate).toLocaleString("ar-SA")}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      القاعة: {session.roomNumber || "-"}
                    </div>
                  </div>
                </div>
              ))}

              {!caseData.sessions?.length && (
                <p className="text-center text-muted-foreground py-4">
                  لا توجد جلسات مجدولة.
                </p>
              )}
            </div>
            <div className="mt-auto border-t border-border pt-4">
              <AddSessionForm caseId={caseData.id} />
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="financial" className="m-0">
          <CaseBillingTab caseId={caseData.id} />
        </TabsContent>

        <TabsContent value="chat" className="m-0">
          {caseData.contactId ? (
            <ChatWindow
              otherUserId={caseData.contactId}
              otherUserName={caseData.clientName}
              caseId={caseData.id}
            />
          ) : (
            <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
              لا يمكن بدء محادثة لعدم وجود جهة اتصال مرتبطة بهذه القضية.
            </div>
          )}
        </TabsContent>
      </div>

      {/* Modals outside the content wrapper for z-index safety */}
      {selectedDocId && (
        <DocumentWorkspace
          documentId={selectedDocId}
          onClose={() => setSelectedDocId(null)}
        />
      )}

      {showComparison && selectedForCompare.length === 2 && (
        <DocumentComparison
          docId1={selectedForCompare[0]}
          docId2={selectedForCompare[1]}
          onClose={() => {
            setShowComparison(false);
            setCompareMode(false);
            setSelectedForCompare([]);
          }}
        />
      )}

      <EditCaseModal
        caseData={caseData}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
      {selectedSession && (
        <EditSessionModal
          session={selectedSession}
          open={!!selectedSession}
          onOpenChange={(open) => !open && setSelectedSession(null)}
        />
      )}

      {versioningDocId && (
        <DocumentVersionsModal
          documentId={versioningDocId}
          caseId={caseData.id}
          open={!!versioningDocId}
          onOpenChange={(open) => !open && setVersioningDocId(null)}
          onOpenWorkspace={(docId) => {
            setSelectedDocId(docId);
            setVersioningDocId(null);
          }}
          onCompare={(docIds) => {
            setSelectedForCompare(docIds);
            setCompareMode(true);
            setVersioningDocId(null);
            setShowComparison(true);
          }}
        />
      )}

    </Tabs>
  );
}
