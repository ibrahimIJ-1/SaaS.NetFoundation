"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentPlansService } from "@/services/treatment-plans.service";
import { billingService } from "@/services/billing.service";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Circle,
  MoreVertical,
  Trash2,
  Receipt
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CreateTreatmentPlanDto, CreateTreatmentPlanItemDto, ProcedureStatus } from "@/types/clinical";

interface Props {
  patientId: string;
}

export default function TreatmentPlansTab({ patientId }: Props) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [newPlan, setNewPlan] = useState({
    title: "",
    notes: "",
    items: [] as CreateTreatmentPlanItemDto[]
  });

  const [newItem, setNewItem] = useState<CreateTreatmentPlanItemDto>({
    procedureName: "",
    code: "",
    toothNumber: undefined,
    surface: "",
    cost: 0
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ["treatment-plans", patientId],
    queryFn: () => treatmentPlansService.getByPatient(patientId),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTreatmentPlanDto) => treatmentPlansService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", patientId] });
      toast.success("Treatment plan created");
      setIsCreateOpen(false);
      setNewPlan({ title: "", notes: "", items: [] });
    },
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: ProcedureStatus }) => 
      treatmentPlansService.updateItemStatus(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", patientId] });
      toast.success("Procedure status updated");
    },
  });

  const handleAddItem = () => {
    if (!newItem.procedureName) return;
    setNewPlan({
      ...newPlan,
      items: [...newPlan.items, newItem]
    });
    setNewItem({ procedureName: "", code: "", toothNumber: undefined, surface: "", cost: 0 });
  };

  const handleCreatePlan = () => {
    if (!newPlan.title) return;
    createMutation.mutate({
      patientId,
      doctorId: "current-user-id", // This should come from auth context
      title: newPlan.title,
      notes: newPlan.notes,
      items: newPlan.items
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "InProgress": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Proposed": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle2 className="w-4 h-4" />;
      case "InProgress": return <Clock className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  if (isLoading) return <div>Loading plans...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-200">Treatment Plans</h3>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Plan
        </Button>
      </div>

      {!plans || plans.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-400">No treatment plans found for this patient.</p>
            <Button 
              variant="link" 
              className="text-teal-400 mt-2"
              onClick={() => setIsCreateOpen(true)}
            >
              Create the first plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-slate-900 border-slate-800 overflow-hidden">
              <CardHeader className="border-b border-slate-800 bg-slate-900/50 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                      {plan.title}
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                      Created on {format(new Date(plan.createdAt), "dd MMM yyyy")}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Estimated Total</p>
                    <p className="text-lg font-bold text-teal-400">${plan.totalCost.toFixed(2)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                  {plan.items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Checkbox 
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedItems([...selectedItems, item.id]);
                            else setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }}
                          className="border-slate-700 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                        />
                        <div className={item.status === "Completed" ? "text-green-500" : "text-slate-500"}>
                          {getStatusIcon(item.status)}
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">
                            {item.procedureName}
                            {item.toothNumber && <span className="text-teal-400 ml-2">Tooth {item.toothNumber}</span>}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {item.code && <span className="text-xs font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{item.code}</span>}
                            {item.surface && <span className="text-xs text-slate-400">Surface: {item.surface}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-slate-200 font-medium">${item.cost.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">{item.status}</p>
                        </div>
                        
                        <Dialog>
                          <DialogHeader className="hidden">
                            <DialogTitle>Item Actions</DialogTitle>
                          </DialogHeader>
                          {/* Item actions could go here */}
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
                {plan.notes && (
                  <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-slate-400">{plan.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>Create Treatment Plan</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Plan Title *</Label>
              <Input 
                placeholder="e.g., Full Restorative, Orthodontic Phase 1"
                value={newPlan.title}
                onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Add Procedure</Label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <Input 
                    placeholder="Procedure name"
                    value={newItem.procedureName}
                    onChange={(e) => setNewItem({ ...newItem, procedureName: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div className="col-span-2">
                  <Input 
                    type="number"
                    placeholder="Tooth"
                    value={newItem.toothNumber || ""}
                    onChange={(e) => setNewItem({ ...newItem, toothNumber: parseInt(e.target.value) || undefined })}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div className="col-span-3">
                  <Input 
                    type="number"
                    placeholder="Cost"
                    value={newItem.cost || ""}
                    onChange={(e) => setNewItem({ ...newItem, cost: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div className="col-span-1">
                  <Button 
                    type="button"
                    variant="secondary"
                    onClick={handleAddItem}
                    className="w-full bg-slate-800 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {newPlan.items.length > 0 && (
              <div className="border rounded-md border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/50">
                    <tr className="text-slate-400">
                      <th className="px-3 py-2 text-left font-medium">Procedure</th>
                      <th className="px-3 py-2 text-center font-medium">Tooth</th>
                      <th className="px-3 py-2 text-right font-medium">Cost</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {newPlan.items.map((item, idx) => (
                      <tr key={idx} className="text-slate-300">
                        <td className="px-3 py-2">{item.procedureName}</td>
                        <td className="px-3 py-2 text-center">{item.toothNumber || "-"}</td>
                        <td className="px-3 py-2 text-right">${item.cost.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">
                          <button 
                            onClick={() => setNewPlan({ ...newPlan, items: newPlan.items.filter((_, i) => i !== idx) })}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900/50 font-bold border-t border-slate-800">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-slate-400">Total Estimate</td>
                      <td className="px-3 py-2 text-right text-teal-400">
                        ${newPlan.items.reduce((sum, i) => sum + i.cost, 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-300">Notes</Label>
              <Input 
                placeholder="Internal clinical notes..."
                value={newPlan.notes}
                onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                className="bg-slate-950 border-slate-800"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-slate-800 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePlan}
              disabled={!newPlan.title || newPlan.items.length === 0 || createMutation.isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              {createMutation.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
