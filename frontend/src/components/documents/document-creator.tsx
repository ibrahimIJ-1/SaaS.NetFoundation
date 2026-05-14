"use client";

import { useState, useRef } from "react";
import { useCreateFromImages } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import {
  X,
  Plus,
  GripVertical,
  Image,
  FileText,
  Loader2,
  ArrowUp,
  ArrowDown,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentCreatorProps {
  caseId: string;
  onClose: () => void;
  onCreated: () => void;
}

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

export function DocumentCreator({ caseId, onClose, onCreated }: DocumentCreatorProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateFromImages();

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems = files
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      }));
    setImages((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  };

  const handleDragEnd = () => setDragIndex(null);

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleCreate = () => {
    if (images.length === 0) {
      toast.error("يرجى إضافة صورة واحدة على الأقل");
      return;
    }
    createMutation.mutate(
      {
        caseId,
        files: images.map((i) => i.file),
        order: images.map((i) => i.file.name),
      },
      { onSuccess: () => onCreated() },
    );
  };

  // Drop zone
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    const newItems = files.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            إنشاء مستند PDF من الصور
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
            <p className="text-sm font-medium text-slate-500">
              اسحب وأفلت الصور هنا أو انقر للاختيار
            </p>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG, GIF, WebP
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleAddFiles}
            />
          </div>

          {/* Image list */}
          {images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-600">
                {images.length} صورة — اسحب لترتيب أو استخدم الأسهم
              </p>
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 transition-all",
                    dragIndex === idx && "opacity-50 border-primary",
                  )}
                >
                  <GripVertical className="w-4 h-4 text-slate-400 cursor-grab flex-shrink-0" />
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                    <img
                      src={img.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">
                    {img.file.name}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === 0}
                      onClick={(e) => { e.stopPropagation(); moveImage(idx, -1); }}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === images.length - 1}
                      onClick={(e) => { e.stopPropagation(); moveImage(idx, 1); }}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-500"
                      onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between gap-3">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            onClick={handleCreate}
            disabled={images.length === 0 || createMutation.isPending}
            className="gap-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {createMutation.isPending ? "جارٍ الإنشاء..." : "إنشاء PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
