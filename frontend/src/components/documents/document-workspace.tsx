"use client";

import { useState, useRef, useEffect } from "react";
import {
  useDocument,
  useSaveHighlight,
  useUpdateHighlight,
  useDeleteHighlight,
  useToggleSharing,
} from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/ui/rich-editor";
import {
  Highlighter,
  MessageSquare,
  Trash2,
  ChevronRight,
  Download,
  ShieldCheck,
  X,
  Check,
  Search,
  FileText,
  Navigation2,
  Edit2,
  Save,
} from "lucide-react";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import {
  highlightPlugin,
  RenderHighlightTargetProps,
} from "@react-pdf-viewer/highlight";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import { cn } from "@/lib/utils";
import { SignaturePad } from "../portal/signature-pad";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DocumentWorkspaceProps {
  documentId: string;
  onClose: () => void;
}

const COLORS = [
  { id: "gold", value: "#D4AF37", label: "مهم" },
  { id: "red", value: "#EF4444", label: "خطر / موعد" },
  { id: "green", value: "#22C55E", label: "دليل" },
  { id: "blue", value: "#3B82F6", label: "ملاحظة" },
];

export function DocumentWorkspace({
  documentId,
  onClose,
}: DocumentWorkspaceProps) {
  const { data: doc, isLoading } = useDocument(documentId);
  const saveHighlight = useSaveHighlight();
  const updateHighlight = useUpdateHighlight();
  const deleteHighlight = useDeleteHighlight();
  const toggleSharing = useToggleSharing();

  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectionText, setSelectionText] = useState("");
  const [annotationInput, setAnnotationInput] = useState("");
  const [pendingRegion, setPendingRegion] = useState<any>(null);
  const [showSignPad, setShowSignPad] = useState(false);

  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(
    null,
  );
  const [editContent, setEditContent] = useState("");

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  const lastCapturedRef = useRef<string>("");
  const SelectionCollector = ({ props }: { props: any }) => {
    useEffect(() => {
      const region = props.selectionRegion;
      const selectionKey = `${region.top}-${region.left}-${region.width}-${region.height}-${props.selectedText}`;

      if (lastCapturedRef.current !== selectionKey) {
        lastCapturedRef.current = selectionKey;
        let rects = props.highlightAreas || region.rects || [];

        if (rects.length <= 1) {
          try {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const clientRects = range.getClientRects();
              const pageElement =
                document.querySelector(
                  `[data-page-index="${props.pageIndex}"] .rpv-core__text-layer`,
                ) ||
                document.querySelector(
                  `[data-page-index="${props.pageIndex}"]`,
                );

              if (pageElement && clientRects.length > 0) {
                const pageRect = pageElement.getBoundingClientRect();
                const manualRects = Array.from(clientRects)
                  .filter((r: any) => r.width > 1 && r.height > 1)
                  .map((r: any) => ({
                    left: ((r.left - pageRect.left) / pageRect.width) * 100,
                    top: ((r.top - pageRect.top) / pageRect.height) * 100,
                    width: (r.width / pageRect.width) * 100,
                    height: (r.height / pageRect.height) * 100,
                  }));

                if (manualRects.length > rects.length) rects = manualRects;
              }
            }
          } catch (e) {}
        }

        setSelectionText(props.selectedText);
        console.log(props);

        setPendingRegion({
          ...region,
          rects,
          pageIndex: props.selectionData.startPageIndex,
        });
      }
    }, [
      props.selectedText,
      props.selectionRegion,
      props.selectionData.startPageIndex,
    ]);

    return null;
  };

  const renderHighlightTarget = (props: RenderHighlightTargetProps) => (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(0, 0, 0, .3)",
        borderRadius: "2px",
        padding: "8px",
        position: "absolute",
        left: `${props.selectionRegion.left}%`,
        top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
        zIndex: 100,
      }}
    >
      <Button
        size="sm"
        className="h-8 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg"
        onClick={props.toggle}
      >
        <Highlighter className="w-3.5 h-3.5" />
        <span className="text-xs font-bold">إضافة ملاحظة</span>
      </Button>
    </div>
  );

  const renderHighlightContent = (props: any) => (
    <SelectionCollector props={props} />
  );

  const renderHighlights = (props: any) => (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
      {doc?.highlights
        ?.filter((h: any) => h.pageNumber === props.pageIndex + 1)
        .map((h: any) => {
          if (h.rectsJson) {
            try {
              const rects = JSON.parse(h.rectsJson);
              return rects.map((rect: any, idx: number) => (
                <div
                  key={`${h.id}-${idx}`}
                  className="absolute mix-blend-multiply"
                  style={{
                    left: `${rect.left}%`,
                    top: `${rect.top}%`,
                    width: `${rect.width}%`,
                    height: `${rect.height}%`,
                    backgroundColor: h.color + "66",
                  }}
                />
              ));
            } catch (e) {}
          }
          return (
            <div
              key={h.id}
              className="absolute mix-blend-multiply"
              style={{
                left: `${h.x1}%`,
                top: `${h.y1}%`,
                width: `${h.x2 - h.x1}%`,
                height: `${h.y2 - h.y1}%`,
                backgroundColor: h.color + "66",
              }}
            />
          );
        })}
    </div>
  );

  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget,
    renderHighlightContent,
    renderHighlights,
  });

  const handleSaveHighlight = () => {
    if (!selectionText || !doc || !pendingRegion) return;
    saveHighlight.mutate(
      {
        documentId: doc.id,
        highlight: {
          color: selectedColor,
          textContent: selectionText,
          pageNumber: pendingRegion.pageIndex + 1,
          x1: pendingRegion.left,
          y1: pendingRegion.top,
          x2: pendingRegion.left + pendingRegion.width,
          y2: pendingRegion.top + pendingRegion.height,
          rectsJson: JSON.stringify(
            pendingRegion.rects.map((r: any) => ({
              left: r.left,
              top: r.top,
              width: r.width,
              height: r.height,
            })),
          ),
          label: COLORS.find((c) => c.value === selectedColor)?.label,
          comment: annotationInput.trim() || undefined,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success("تم حفظ التمييز والملاحظة");
          setPendingRegion(null);
          setAnnotationInput("");
          setSelectionText("");
        },
      },
    );
  };

  const handleToggleSharing = () => {
    if (!doc) return;
    toggleSharing.mutate({
      documentId: doc.id,
      isShared: !doc.isSharedWithClient,
    });
  };

  const handleJump = (highlight: any) => {
    jumpToPage(highlight.pageNumber - 1);
    toast.info(`انتقال إلى الصفحة ${highlight.pageNumber}`);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full font-bold">
        جاري التحميل...
      </div>
    );
  if (!doc)
    return (
      <div className="p-20 text-center text-red-500">Document not found</div>
    );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden text-right"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-slate-800 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronRight className="rotate-180" />
          </Button>
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {doc.fileName}
            </h1>
            <p className="text-xs text-slate-500">مساحة عمل الوثائق</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSignPad(true)}
            className="gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> توقيع رقمي
          </Button>
          <Button
            variant={doc.isSharedWithClient ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSharing}
          >
            {doc.isSharedWithClient ? "مشترك" : "مشاركة"}
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="w-4/6 relative overflow-hidden flex flex-col p-4">
          <div className="h-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer
                fileUrl={doc.fileUrl}
                plugins={[
                  highlightPluginInstance,
                  pageNavigationPluginInstance,
                ]}
                theme="light"
                defaultScale={SpecialZoomLevel.PageFit}
              />
            </Worker>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-2/6 border-r bg-white dark:bg-slate-900 flex flex-col shadow-2xl z-30">
          <div className="p-5 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <MessageSquare className="w-5 h-5 text-primary" />
              التعليقات والتمييز
              <Badge variant="secondary" className="mr-2">
                {doc.highlights?.length || 0}
              </Badge>
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* New Highlight Card */}
            {pendingRegion && (
              <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                    تحديد نشط
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => setPendingRegion(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-white rounded-xl p-4 border border-primary/10 mb-4 italic text-sm text-slate-600 line-clamp-4 relative pr-3">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary/40 rounded-r-xl" />
                  "{selectionText}"
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2.5">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setSelectedColor(c.value)}
                        className={cn(
                          "w-7 h-7 rounded-full transition-all border-2",
                          selectedColor === c.value
                            ? "border-primary scale-110 shadow-md"
                            : "border-transparent",
                        )}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>

                  <RichEditor
                    value={annotationInput}
                    onChange={setAnnotationInput}
                    placeholder="أضف ملاحظاتك أو تعليقاتك القانونية هنا (يمكنك لصق صور أيضاً)..."
                  />

                  <Button
                    className="w-full h-11 font-bold"
                    onClick={handleSaveHighlight}
                  >
                    <Check className="w-4 h-4 ml-2" /> حفظ التمييز
                  </Button>
                </div>
              </div>
            )}

            {/* List of saved highlights */}
            <div className="space-y-4 text-right">
              {!doc.highlights?.length && !pendingRegion && (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <FileText className="w-12 h-12 mb-4" />
                  <p className="text-sm font-medium">لا توجد ملاحظات بعد</p>
                </div>
              )}

              {doc.highlights?.map((h: any) => (
                <div
                  key={h.id}
                  className={cn(
                    "group bg-white border border-slate-200 rounded-2xl p-5 transition-all relative overflow-hidden",
                    editingHighlightId === h.id
                      ? "ring-2 ring-primary border-transparent"
                      : "hover:border-primary/30 hover:shadow-xl cursor-pointer",
                  )}
                  onClick={() => editingHighlightId !== h.id && handleJump(h)}
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: h.color }}
                  />

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-black"
                        style={{ color: h.color, borderColor: h.color + "33" }}
                      >
                        صفحة {h.pageNumber}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400">
                        {h.label}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingHighlightId !== h.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingHighlightId(h.id);
                              setEditContent(h.comment || "");
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("حذف الملاحظة؟"))
                                deleteHighlight.mutate(h.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingHighlightId(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic mb-4 line-clamp-3 leading-relaxed border-r-2 border-slate-100 pr-3 text-right">
                    "{h.textContent}"
                  </p>

                  {editingHighlightId === h.id ? (
                    <div
                      className="space-y-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RichEditor
                        value={editContent}
                        onChange={setEditContent}
                      />
                      <Button
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => {
                          updateHighlight.mutate(
                            {
                              highlightId: h.id,
                              highlight: { comment: editContent },
                            },
                            {
                              onSuccess: () => setEditingHighlightId(null),
                            },
                          );
                        }}
                        disabled={updateHighlight.isPending}
                      >
                        <Save className="w-4 h-4 ml-2" />
                        تحديث التعليق
                      </Button>
                    </div>
                  ) : h.comment ? (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-right">
                      <div
                        className="text-sm text-slate-800 leading-normal font-medium rich-text-preview"
                        dangerouslySetInnerHTML={{ __html: h.comment }}
                      />
                    </div>
                  ) : null}

                  {editingHighlightId !== h.id && (
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Navigation2 className="w-3 h-3 rotate-180" /> انقر
                        للانتقال
                      </span>
                      <span>
                        {new Date(h.createdAt || Date.now()).toLocaleDateString(
                          "ar-EG",
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Pad */}
      {showSignPad && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-white rounded-3xl p-1 shadow-2xl overflow-hidden text-right">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800">توقيع المستند</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSignPad(false)}
              >
                <X />
              </Button>
            </div>
            <div className="p-6">
              <SignaturePad
                documentId={documentId}
                onSigned={() => {
                  setShowSignPad(false);
                  window.location.reload();
                }}
                onCancel={() => setShowSignPad(false)}
              />
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .rich-text-preview {
          color: #000000;
        }
        .rich-text-preview img {
          max-width: 100%;
          border-radius: 8px;
          margin: 8px 0;
        }
      `}</style>

    </div>
  );
}
