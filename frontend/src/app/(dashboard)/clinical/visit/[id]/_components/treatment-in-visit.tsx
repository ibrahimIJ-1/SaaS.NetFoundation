"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentPlansService } from "@/services/treatment-plans.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { ProcedureStatus } from "@/types/clinical";

interface Props {
  patientId: string;
  visitId: string;
}

export default function TreatmentInVisit({ patientId, visitId }: Props) {
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["treatment-plans", patientId],
    queryFn: () => treatmentPlansService.getByPatient(patientId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: ProcedureStatus }) => 
      treatmentPlansService.updateItemStatus(itemId, status, visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", patientId] });
      toast.success("Procedure updated");
    },
  });

  const pendingItems = plans?.flatMap(p => 
    p.items.filter(i => i.status === "Proposed" || i.status === "InProgress")
      .map(i => ({ ...i, planTitle: p.title }))
  ) || [];

  const completedItems = plans?.flatMap(p => 
    p.items.filter(i => i.status === "Completed" && i.completionDate) // Ideally filter by current visit but for now just show completed
  ) || [];

  if (isLoading) return <div className="text-slate-500 text-sm">Loading treatment plans...</div>;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-teal-500" />
          <CardTitle className="text-slate-100">Treatment Items</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingItems.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No pending procedures in treatment plans.</p>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-800/50 transition-colors">
                <Checkbox 
                  id={item.id} 
                  checked={item.status === "Completed"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateStatusMutation.mutate({ itemId: item.id, status: "Completed" });
                    }
                  }}
                  className="mt-1 border-slate-700 data-[state=checked]:bg-teal-600"
                />
                <div className="grid gap-0.5 leading-none">
                  <Label 
                    htmlFor={item.id}
                    className="text-sm font-medium text-slate-200 cursor-pointer"
                  >
                    {item.procedureName}
                  </Label>
                  <p className="text-[10px] text-slate-500">
                    {item.toothNumber ? `Tooth ${item.toothNumber}` : "General"} • {item.planTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {completedItems.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <Label className="text-[10px] uppercase text-slate-500 block mb-2">Completed Today</Label>
            <div className="space-y-2">
              {completedItems.filter(i => i.status === "Completed").slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>{item.procedureName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
