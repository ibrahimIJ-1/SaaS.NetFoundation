"use client";

import { useState, useRef, useEffect, useCallback, createElement } from "react";
import {
  useDocument,
  useSaveHighlight,
  useUpdateHighlight,
  useDeleteHighlight,
  useToggleSharing,
  useSaveVideoAnnotation,
  useDeleteVideoAnnotation,
  useRunOcr,
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
  ScanSearch,
  FileText,
  Navigation2,
  Edit2,
  Save,
  Image,
  Video,
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
import { ImageViewer } from "./image-viewer";
import { VideoViewer } from "./video-viewer";
import { DocumentHighlight, DocumentVideoAnnotation } from "@/types/document";

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
  const saveVideoAnnotation = useSaveVideoAnnotation();
  const deleteVideoAnnotation = useDeleteVideoAnnotation();
  const runOcr = useRunOcr();

  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectionText, setSelectionText] = useState("");
  const [annotationInput, setAnnotationInput] = useState("");
  const [pendingRegion, setPendingRegion] = useState<any>(null);
  const [showSignPad, setShowSignPad] = useState(false);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");


  const [pendingVideoAnnotation, setPendingVideoAnnotation] = useState<{
    timeStart: number;
    timeEnd: number;
    color: string;
  } | null>(null);

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  // --- Determine content type ---
  const contentType = doc?.contentType || "";
  const isPdf =
    contentType === "application/pdf" || (!contentType && doc?.fileUrl?.endsWith(".pdf"));
  const isImage = contentType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(doc?.fileName || "");
  const isVideo = contentType.startsWith("video/") || /\.(mp4|webm|mov|avi)$/i.test(doc?.fileName || "");
  const isOffice = !isPdf && !isImage && !isVideo;
  const effectiveFileUrl = (isOffice && doc?.convertedPdfUrl) || doc?.fileUrl || "";

  // --- PDF highlight logic ---
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
        setPendingRegion({
          ...region,
          rects,
          pageIndex: props.selectionData.startPageIndex,
        });
      }
    }, [props.selectedText, props.selectionRegion, props.selectionData.startPageIndex]);

    return null;
  };

  const renderHighlightTarget = useCallback((props: RenderHighlightTargetProps) => (
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
  ), []);

  const renderHighlightContent = useCallback((props: any) => (
    <SelectionCollector props={props} />
  ), []);

  const renderHighlights = useCallback((props: any) => (
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
  ), [doc?.highlights]);

  const pdfHighlightPlugin = highlightPlugin({
    renderHighlightTarget,
    renderHighlightContent,
    renderHighlights,
  });

  // --- Save PDF highlight ---
  // --- Save Image highlight ---
  const handleImageSelection = useCallback(
    (selection: { x1: number; y1: number; x2: number; y2: number; pageNumber: number }) => {
      setPendingRegion({
        left: selection.x1,
        top: selection.y1,
        width: selection.x2 - selection.x1,
        height: selection.y2 - selection.y1,
        pageIndex: 0,
        rects: [],
      });
      setSelectionText("");
    },
    [],
  );

  // --- Commit image/video annotation ---
  const commitPendingAnnotation = () => {
    if (!doc || !pendingRegion) return;

    if (isPdf || isOffice) {
      if (!selectionText) return;
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
              (pendingRegion.rects || []).map((r: any) => ({
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
    } else if (isImage) {
      saveHighlight.mutate(
        {
          documentId: doc.id,
          highlight: {
            color: selectedColor,
            textContent: "",
            pageNumber: 1,
            x1: pendingRegion.left,
            y1: pendingRegion.top,
            x2: pendingRegion.left + pendingRegion.width,
            y2: pendingRegion.top + pendingRegion.height,
            label: COLORS.find((c) => c.value === selectedColor)?.label,
            comment: annotationInput.trim() || undefined,
          } as any,
        },
        {
          onSuccess: () => {
            toast.success("تم حفظ التمييز");
            setPendingRegion(null);
            setAnnotationInput("");
          },
        },
      );
    } else if (pendingVideoAnnotation) {
      saveVideoAnnotation.mutate(
        {
          documentId: doc.id,
          annotation: {
            timeStart: pendingVideoAnnotation.timeStart,
            timeEnd: pendingVideoAnnotation.timeEnd,
            comment: annotationInput.trim() || "",
            color: selectedColor,
            label: COLORS.find((c) => c.value === selectedColor)?.label,
          } as any,
        },
        {
          onSuccess: () => {
            toast.success("تم حفظ التعليق");
            setPendingRegion(null);
            setPendingVideoAnnotation(null);
            setAnnotationInput("");
          },
        },
      );
    }
  };

  // --- Video annotation handlers ---
  const handleAddVideoAnnotation = useCallback(
    (a: { timeStart: number; timeEnd: number; comment: string; color: string }) => {
      setPendingVideoAnnotation({ timeStart: a.timeStart, timeEnd: a.timeEnd, color: a.color });
      setSelectedColor(a.color);
      setPendingRegion({ left: 0, top: 0, width: 0, height: 0, pageIndex: 0, rects: [] });
      setAnnotationInput(a.comment);
    },
    [],
  );

  const handleDeleteVideoAnnotation = useCallback(
    (id: string) => {
      if (confirm("حذف التعليق؟")) deleteVideoAnnotation.mutate(id);
    },
    [deleteVideoAnnotation],
  );

  const handleVideoAnnotationClick = useCallback(
    (a: DocumentVideoAnnotation) => {
      setActiveHighlightId(a.id);
    },
    [],
  );

  // --- Shared ---
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

  const handleDownload = () => {
    if (!doc?.fileUrl) return;
    const a = document.createElement("a");
    a.href = doc.fileUrl;
    a.download = doc.fileName;
    a.click();
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

  const typeIcon = isPdf || isOffice ? FileText : isImage ? Image : Video;
  const typeLabel = isPdf ? "PDF" : isImage ? "صورة" : isVideo ? "فيديو" : "مستند";

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
            {createElement(typeIcon, { className: "w-6 h-6 text-primary" })}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {doc.fileName}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{typeLabel}</Badge>
              مساحة عمل الوثائق
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(isPdf || isImage) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => runOcr.mutate(doc.id)}
              disabled={runOcr.isPending}
              className="gap-2"
            >
              <ScanSearch className="w-4 h-4" />
              {runOcr.isPending ? "جارٍ OCR..." : "OCR"}
            </Button>
          )}
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
          <Button variant="ghost" size="icon" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Viewer area */}
        <div className="w-4/6 relative overflow-hidden flex flex-col p-4">
          <div className="h-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            {isPdf || (isOffice && doc.convertedPdfUrl) ? (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={effectiveFileUrl}
                  plugins={[
                    pdfHighlightPlugin,
                    pageNavigationPluginInstance,
                  ]}
                  theme="light"
                  defaultScale={SpecialZoomLevel.PageFit}
                />
              </Worker>
            ) : isImage ? (
              <ImageViewer
                fileUrl={doc.fileUrl}
                highlights={doc.highlights || []}
                onSelectionComplete={handleImageSelection}
                onHighlightClick={(h) => setActiveHighlightId(h.id)}
                activeHighlightId={activeHighlightId}
              />
            ) : isVideo ? (
              <VideoViewer
                fileUrl={doc.fileUrl}
                annotations={doc.videoAnnotations || []}
                onAddAnnotation={handleAddVideoAnnotation}
                onDeleteAnnotation={handleDeleteVideoAnnotation}
                onAnnotationClick={handleVideoAnnotationClick}
                selectedAnnotationId={activeHighlightId}
                annotationColors={COLORS}
              />
            ) : isOffice ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    لا يمكن معاينة هذا المستند — يرجى تنزيله لفتحه بالبرنامج المناسب
                  </p>
                </div>
                <iframe
                  src={doc.fileUrl}
                  className="w-full flex-1"
                  title={doc.fileName}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                <FileText className="w-16 h-16 mb-4 opacity-40" />
                <p className="text-sm font-medium">نوع الملف غير مدعوم للمعاينة</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-2/6 border-r bg-white dark:bg-slate-900 flex flex-col shadow-2xl z-30">
          <div className="p-5 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <MessageSquare className="w-5 h-5 text-primary" />
              التعليقات والتمييز
              <Badge variant="secondary" className="mr-2">
                {(doc.highlights?.length || 0) + (doc.videoAnnotations?.length || 0)}
              </Badge>
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* New annotation card */}
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
                    onClick={() => {
                      setPendingRegion(null);
                      setPendingVideoAnnotation(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {selectionText && (
                  <div className="bg-white rounded-xl p-4 border border-primary/10 mb-4 italic text-sm text-slate-600 line-clamp-4 relative pr-3">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary/40 rounded-r-xl" />
                    "{selectionText}"
                  </div>
                )}

                {pendingVideoAnnotation && (
                  <div className="bg-white rounded-xl p-4 border border-primary/10 mb-4 text-sm text-slate-600 relative pr-3">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary/40 rounded-r-xl" />
                    تعليق فيديو عند{" "}
                    {Math.floor(pendingVideoAnnotation.timeStart / 60)}
                    :{(pendingVideoAnnotation.timeStart % 60).toFixed(0).padStart(2, "0")}
                  </div>
                )}

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
                    onClick={commitPendingAnnotation}
                  >
                    <Check className="w-4 h-4 ml-2" /> حفظ التمييز
                  </Button>
                </div>
              </div>
            )}

            {/* List of saved highlights (PDF + Image) */}
            <div className="space-y-4 text-right">
              {!doc.highlights?.length &&
                !doc.videoAnnotations?.length &&
                !pendingRegion && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <MessageSquare className="w-12 h-12 mb-4" />
                    <p className="text-sm font-medium">لا توجد ملاحظات بعد</p>
                    <p className="text-xs mt-2">
                      {isImage
                        ? "اسحب على الصورة لتحديد منطقة"
                        : isVideo
                          ? "انقر على شريط الوقت لإضافة تعليق"
                          : "حدد نصاً في المستند لإضافة ملاحظة"}
                    </p>
                  </div>
                )}

              {/* PDF/Image highlights */}
              {doc.highlights?.map((h: any) => (
                <div
                  key={h.id}
                  className={cn(
                    "group bg-white border border-slate-200 rounded-2xl p-5 transition-all relative overflow-hidden",
                    editingHighlightId === h.id
                      ? "ring-2 ring-primary border-transparent"
                      : activeHighlightId === h.id
                        ? "ring-2 ring-primary/40 border-primary/30"
                        : "hover:border-primary/30 hover:shadow-xl cursor-pointer",
                  )}
                  onClick={() => {
                    if (editingHighlightId !== h.id) {
                      setActiveHighlightId(h.id);
                      if (isPdf || isOffice) handleJump(h);
                    }
                  }}
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: h.color }}
                  />

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {!isImage && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-black"
                          style={{ color: h.color, borderColor: h.color + "33" }}
                        >
                          صفحة {h.pageNumber}
                        </Badge>
                      )}
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

                  {h.textContent && (
                    <p className="text-xs text-slate-500 italic mb-4 line-clamp-3 leading-relaxed border-r-2 border-slate-100 pr-3 text-right">
                      "{h.textContent}"
                    </p>
                  )}

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

                  {editingHighlightId !== h.id && !isImage && (
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

              {/* Video annotations */}
              {doc.videoAnnotations?.map((a: any) => (
                <div
                  key={a.id}
                  className={cn(
                    "group bg-white border border-slate-200 rounded-2xl p-5 transition-all relative overflow-hidden cursor-pointer",
                    activeHighlightId === a.id && "ring-2 ring-primary/40 border-primary/30",
                  )}
                  onClick={() => setActiveHighlightId(a.id)}
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: a.color }}
                  />
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-black font-mono"
                      style={{ color: a.color, borderColor: a.color + "33" }}
                    >
                      {Math.floor(a.timeStart / 60)}:
                      {(a.timeStart % 60).toFixed(0).padStart(2, "0")}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("حذف التعليق؟"))
                          deleteVideoAnnotation.mutate(a.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {a.comment && (
                    <div
                      className="text-sm text-slate-800 leading-normal font-medium rich-text-preview"
                      dangerouslySetInnerHTML={{ __html: a.comment }}
                    />
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
