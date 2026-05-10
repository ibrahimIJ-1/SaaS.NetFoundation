"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicalService } from "@/services/clinical.service";
import { MedicalHistory } from "@/types/clinical";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface Props {
  patientId: string;
}

export default function MedicalHistoryTab({ patientId }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<MedicalHistory>>({});

  const { data: history, isLoading } = useQuery({
    queryKey: ["medicalHistory", patientId],
    queryFn: () => clinicalService.getMedicalHistory(patientId),
  });

  useEffect(() => {
    if (history) {
      setFormData({
        bloodType: history.bloodType || "",
        allergies: history.allergies || "",
        chronicDiseases: history.chronicDiseases || "",
        currentMedications: history.currentMedications || "",
        generalNotes: history.generalNotes || "",
      });
    }
  }, [history]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<MedicalHistory>) => clinicalService.updateMedicalHistory(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalHistory", patientId] });
      toast.success("Medical history updated successfully");
    },
    onError: () => {
      toast.error("Failed to update medical history");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-slate-900 rounded-xl"></div>;
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-slate-50">Medical History</CardTitle>
        <CardDescription className="text-slate-400">
          Update the patient's critical medical information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bloodType" className="text-slate-300">Blood Type</Label>
            <select
              id="bloodType"
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
              className="flex h-10 w-full md:w-1/3 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <option value="">Select...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies" className="text-slate-300">Allergies</Label>
            <Input
              id="allergies"
              placeholder="e.g. Penicillin, Latex (leave blank if none)"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chronicDiseases" className="text-slate-300">Chronic Diseases</Label>
            <Input
              id="chronicDiseases"
              placeholder="e.g. Hypertension, Diabetes"
              value={formData.chronicDiseases}
              onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
              className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications" className="text-slate-300">Current Medications</Label>
            <Input
              id="currentMedications"
              placeholder="List all current medications..."
              value={formData.currentMedications}
              onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
              className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="generalNotes" className="text-slate-300">General Medical Notes</Label>
            <textarea
              id="generalNotes"
              rows={4}
              value={formData.generalNotes}
              onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
              className="flex w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 resize-y"
            ></textarea>
          </div>

          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="bg-teal-600 hover:bg-teal-500 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
