"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicalService } from "@/services/clinical.service";
import { Odontogram } from "@/components/clinical/odontogram";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  History, 
  Stethoscope, 
  Info, 
  Calendar,
  User,
  Clock,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ToothStatus } from "@/types/clinical";
import { cn } from "@/lib/utils";

interface Props {
  patientId: string;
}

const statusOptions: { value: ToothStatus; label: string; color: string }[] = [
  { value: 'Healthy', label: 'Healthy', color: 'bg-slate-500' },
  { value: 'Caries', label: 'Caries (Decay)', color: 'bg-red-500' },
  { value: 'Filling', label: 'Filling', color: 'bg-blue-500' },
  { value: 'RootCanal', label: 'Root Canal', color: 'bg-amber-500' },
  { value: 'Crown', label: 'Crown', color: 'bg-teal-500' },
  { value: 'Bridge', label: 'Bridge', color: 'bg-indigo-500' },
  { value: 'Implant', label: 'Implant', color: 'bg-emerald-500' },
  { value: 'Missing', label: 'Missing', color: 'bg-slate-700' },
  { value: 'Impacted', label: 'Impacted', color: 'bg-orange-500' },
  { value: 'Fractured', label: 'Fractured', color: 'bg-red-900' },
  { value: 'ExtractionNeeded', label: 'Extraction Needed', color: 'bg-red-600' },
];

export default function OdontogramTab({ patientId }: Props) {
  const queryClient = useQueryClient();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateData, setUpdateData] = useState<{ status: ToothStatus; notes: string }>({
    status: 'Healthy',
    notes: ''
  });

  const { data: chart, isLoading: isChartLoading } = useQuery({
    queryKey: ["dental-chart", patientId],
    queryFn: () => clinicalService.getDentalChart(patientId),
  });

  const { data: toothHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["tooth-history", patientId, selectedTooth],
    queryFn: () => selectedTooth ? clinicalService.getToothHistory(patientId, selectedTooth) : Promise.resolve([]),
    enabled: !!selectedTooth,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => clinicalService.updateToothCondition(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dental-chart", patientId] });
      queryClient.invalidateQueries({ queryKey: ["tooth-history", patientId, selectedTooth] });
      toast.success("Tooth condition updated");
      setIsUpdateOpen(false);
    },
  });

  const handleToothSelect = (num: number) => {
    setSelectedTooth(num);
    const existing = chart?.teeth.find(t => t.toothNumber === num);
    setUpdateData({
      status: existing?.status || 'Healthy',
      notes: existing?.notes || ''
    });
  };

  const handleUpdate = () => {
    if (selectedTooth === null) return;
    updateMutation.mutate({
      toothNumber: selectedTooth,
      status: updateData.status,
      notes: updateData.notes
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column: Interactive Odontogram */}
      <div className="xl:col-span-2 space-y-6">
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <CardHeader className="border-b border-slate-800 bg-slate-900/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-50 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-400" />
                  Interactive Dental Chart
                </CardTitle>
                <CardDescription>Select a tooth to view history or update clinical status.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-xs">
                  Adult (32)
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-500 text-xs cursor-not-allowed">
                  Child (20)
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-12">
            {isChartLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-teal-500"></div>
              </div>
            ) : (
              <Odontogram 
                teeth={chart?.teeth || []} 
                selectedToothNumber={selectedTooth}
                onToothSelect={handleToothSelect}
              />
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-slate-400">Legend & Indicators</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-wrap gap-4">
              {statusOptions.slice(1).map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", opt.color)} />
                  <span className="text-xs text-slate-400">{opt.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Tooth History & Details */}
      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-lg text-slate-50 flex items-center gap-2">
              <History className="w-5 h-5 text-teal-400" />
              Tooth Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto py-6">
            {!selectedTooth ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 opacity-50">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                  <Info className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <p className="text-slate-200 font-medium">No Tooth Selected</p>
                  <p className="text-sm text-slate-500 mt-1">Select a tooth on the chart to see its full clinical history and current status.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-slate-50 tracking-tight">Tooth #{selectedTooth}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          statusOptions.find(o => o.value === updateData.status)?.color || "bg-slate-500"
                        )}>
                          {updateData.status}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setIsUpdateOpen(true)} className="bg-teal-600 hover:bg-teal-500 text-white">
                      Update
                    </Button>
                  </div>
                  {updateData.notes && (
                    <div className="text-sm text-slate-400 italic bg-slate-900 p-2 rounded mt-2 border-l-2 border-teal-500/50">
                      "{updateData.notes}"
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    Clinical History
                  </h4>
                  
                  {isHistoryLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-teal-500"></div>
                    </div>
                  ) : toothHistory && toothHistory.length > 0 ? (
                    <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                      {toothHistory.map((item, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[1.35rem] top-1.5 w-2 h-2 rounded-full bg-teal-500 border-4 border-slate-900 shadow-[0_0_0_1px_rgba(45,212,191,0.2)]" />
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-teal-500 uppercase tracking-tighter">
                                {item.type}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {format(new Date(item.date), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <p className="text-sm text-slate-200 font-medium leading-tight">
                              {item.description}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-slate-500 line-clamp-2">
                                {item.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-2 pt-1">
                                <User className="w-3 h-3 text-slate-600" />
                                <span className="text-[10px] text-slate-500">Dr. {item.doctorName || "Main Dentist"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-950/20 rounded-lg border border-dashed border-slate-800">
                      <p className="text-xs text-slate-600 italic">No clinical records found for this tooth.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Update Status Modal */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>Update Tooth #{selectedTooth}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Change the clinical status and add notes for this tooth.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <Label className="text-slate-300">Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setUpdateData({ ...updateData, status: opt.value })}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md border text-left transition-all",
                      updateData.status === opt.value 
                        ? "bg-teal-500/10 border-teal-500 text-teal-400" 
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full shrink-0", opt.color)} />
                    <span className="text-xs font-medium truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-300">Clinical Notes</Label>
              <Input
                id="notes"
                placeholder="e.g. Incipient caries, needs monitoring..."
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsUpdateOpen(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              {updateMutation.isPending ? "Saving..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
