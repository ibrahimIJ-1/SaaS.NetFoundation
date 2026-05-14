"use client";

import { useState, useRef, useCallback } from "react";
import { DocumentVideoAnnotation } from "@/types/document";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, Pause, Clock, Trash2 } from "lucide-react";

interface VideoViewerProps {
  fileUrl: string;
  annotations: DocumentVideoAnnotation[];
  onAddAnnotation: (annotation: { timeStart: number; timeEnd: number; comment: string; color: string }) => void;
  onDeleteAnnotation: (id: string) => void;
  onAnnotationClick: (annotation: DocumentVideoAnnotation) => void;
  selectedAnnotationId?: string | null;
  annotationColors: { id: string; value: string; label: string }[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function VideoViewer({
  fileUrl,
  annotations,
  onAddAnnotation,
  onDeleteAnnotation,
  onAnnotationClick,
  selectedAnnotationId,
  annotationColors,
}: VideoViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [clickTime, setClickTime] = useState(0);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const ratio = (e.clientX - rect.left) / rect.width;
      const time = ratio * duration;
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
      setClickTime(time);
      setShowAddMenu(true);
    },
    [duration],
  );

  const handleAddAtTime = useCallback(
    (color: string) => {
      onAddAnnotation({
        timeStart: Math.max(0, clickTime - 2),
        timeEnd: Math.min(duration, clickTime + 2),
        comment: "",
        color,
      });
      setShowAddMenu(false);
    },
    [clickTime, duration, onAddAnnotation],
  );

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Video Player */}
      <div className="relative flex-1 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={fileUrl}
          className="max-w-full max-h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          controls={false}
        />
        {/* Big play button overlay when paused */}
        {!isPlaying && (
          <button
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
              <Play className="w-8 h-8 text-slate-900 ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Controls & Timeline */}
      <div className="bg-slate-900 px-6 py-4 space-y-3">
        {/* Timeline */}
        <div className="relative">
          <div
            ref={timelineRef}
            className="relative h-8 bg-slate-700 rounded-lg cursor-pointer overflow-hidden group"
            onClick={handleTimelineClick}
          >
            {/* Progress bar */}
            <div
              className="absolute h-full bg-primary/60 rounded-lg transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Annotation markers */}
            {annotations.map((a) => {
              const left = duration > 0 ? (a.timeStart / duration) * 100 : 0;
              const width = duration > 0 ? ((a.timeEnd - a.timeStart) / duration) * 100 : 0;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "absolute h-full top-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer",
                    selectedAnnotationId === a.id && "opacity-100 ring-2 ring-white",
                  )}
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(width, 1)}%`,
                    backgroundColor: a.color,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnnotationClick(a);
                  }}
                />
              );
            })}
            {/* Time indicator dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md border-2 border-primary z-10"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
          </div>

          {/* Time labels */}
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Add annotation menu */}
        {showAddMenu && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-white text-sm mb-3">
              أضف تمييزاً عند {formatTime(clickTime)}
            </p>
            <div className="flex gap-2">
              {annotationColors.map((c) => (
                <button
                  key={c.value}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 border-2 border-transparent hover:border-white"
                  style={{ backgroundColor: c.value }}
                  onClick={() => handleAddAtTime(c.value)}
                  title={c.label}
                />
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="mr-auto text-slate-400"
                onClick={() => setShowAddMenu(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {/* Play/Pause button */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          <span className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Annotations list sidebar */}
      {annotations.length > 0 && (
        <div className="bg-slate-800 border-t border-slate-700 max-h-48 overflow-y-auto">
          <div className="p-3 border-b border-slate-700">
            <h3 className="text-white text-sm font-bold">التعليقات</h3>
          </div>
          <div className="divide-y divide-slate-700">
            {annotations.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "flex items-center gap-3 p-3 hover:bg-slate-700/50 cursor-pointer transition-colors",
                  selectedAnnotationId === a.id && "bg-slate-700",
                )}
                onClick={() => {
                  seekTo(a.timeStart);
                  onAnnotationClick(a);
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: a.color }}
                />
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-300 text-xs font-mono flex-shrink-0">
                  {formatTime(a.timeStart)}
                </span>
                <p className="text-slate-400 text-xs truncate flex-1">
                  {a.comment || (a.label || "ملاحظة")}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAnnotation(a.id);
                  }}
                  className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
