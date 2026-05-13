"use client";

import * as React from "react";
import { 
  useDocumentVersions, 
  useUploadDocument, 
  usePromoteVersion 
} from "@/hooks/use-documents";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  History,
  Download,
  Upload,
  FileText,
  User,
  Calendar,
  Loader2,
  CheckCircle2,
  Eye,
  Columns,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

interface DocumentVersionsModalProps {
  documentId: string;
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenWorkspace: (docId: string) => void;
  onCompare: (docIds: string[]) => void;
}


export function DocumentVersionsModal({
  documentId,
  caseId,
  open,
  onOpenChange,
  onOpenWorkspace,
  onCompare,
}: DocumentVersionsModalProps) {
  const { data: versions, isLoading } = useDocumentVersions(documentId);
  const uploadDoc = useUploadDocument();
  const promoteVersion = usePromoteVersion();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedForCompare, setSelectedForCompare] = React.useState<string[]>([]);

  const handleCompareToggle = (id: string) => {
    setSelectedForCompare(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };


  const handleUploadNewVersion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadDoc.mutate(
      { caseId, file, parentId: documentId },
      {
        onSuccess: () => {
          toast.success("تم رفع نسخة جديدة بنجاح");
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-heading">
            <History className="w-5 h-5 text-legal-gold" />
            سجل إصدارات المستند
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                يمكنك الاطلاع على الإصدارات السابقة أو رفع نسخة جديدة.
              </p>
              {selectedForCompare.length > 0 && (
                <p className="text-xs text-legal-gold font-medium">
                  تم اختيار {selectedForCompare.length} إصدارات للمقارنة
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {selectedForCompare.length === 2 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="gap-2 border-legal-gold text-legal-gold hover:bg-legal-gold/10"
                  onClick={() => onCompare(selectedForCompare)}
                >
                  <Columns className="w-4 h-4" />
                  مقارنة المختار
                </Button>
              )}
              <Button 
                size="sm" 
                className="gap-2 bg-legal-gold text-legal-primary hover:bg-legal-gold-light"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadDoc.isPending}
              >
                {uploadDoc.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                نسخة جديدة
              </Button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleUploadNewVersion} 
            />
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-legal-gold" />
              </div>
            ) : versions?.map((v, index) => (
              <div 
                key={v.id} 
                className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                  index === 0 
                    ? "bg-legal-gold/5 border-legal-gold/20" 
                    : "bg-secondary/20 border-border hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Checkbox 
                    checked={selectedForCompare.includes(v.id)}
                    onCheckedChange={() => handleCompareToggle(v.id)}
                    className="border-legal-gold data-[state=checked]:bg-legal-gold data-[state=checked]:text-legal-primary"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${index === 0 ? "bg-legal-gold/20" : "bg-background"}`}>
                      <FileText className={`w-5 h-5 ${index === 0 ? "text-legal-gold" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">إصدار {v.version}</h4>
                        {index === 0 && (
                          <span className="text-[10px] bg-legal-gold text-legal-primary px-1.5 py-0.5 rounded font-bold">
                            الحالي
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(v.uploadDate), "PPP p", { locale: ar })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {v.uploadedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-legal-gold hover:bg-legal-gold/10"
                    onClick={() => onOpenWorkspace(v.id)}
                    title="فتح للمعاينة والتعليق"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {index !== 0 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-muted-foreground hover:text-green-600 hover:bg-green-50"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من تعيين هذا الإصدار كنسخة حالية؟")) {
                          promoteVersion.mutate(v.id);
                        }
                      }}
                      title="تعيين كنسخة حالية"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-legal-gold hover:bg-legal-gold/10"
                    asChild
                  >
                    <a href={v.fileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
