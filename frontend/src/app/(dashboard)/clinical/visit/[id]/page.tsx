"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { visitsService } from "@/services/visits.service";
import { patientsService } from "@/services/patients.service";
import { clinicalService } from "@/services/clinical.service";
import { UpdateVisitNotesDto } from "@/types/clinical";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  Save, 
  CheckCircle2, 
  Stethoscope,
  ClipboardList,
  Activity,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import TreatmentInVisit from "./_components/treatment-in-visit";

export default function ActiveVisitPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const visitId = id as string;

  const { data: visit, isLoading: isVisitLoading } = useQuery({
    queryKey: ["visit", visitId],
    queryFn: () => visitsService.getById(visitId),
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", visit?.patientId],
    queryFn: () => patientsService.getById(visit!.patientId),
    enabled: !!visit?.patientId,
  });

  const { data: history } = useQuery({
    queryKey: ["medical-history", visit?.patientId],
    queryFn: () => clinicalService.getMedicalHistory(visit!.patientId),
    enabled: !!visit?.patientId,
  });

  const [notes, setNotes] = useState<UpdateVisitNotesDto>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  useEffect(() => {
    if (visit) {
      setNotes({
        subjective: visit.subjectiveNotes || "",
        objective: visit.objectiveNotes || "",
        assessment: visit.assessment || "",
        plan: visit.plan || "",
      });
    }
  }, [visit]);

  const saveMutation = useMutation({
    mutationFn: (data: UpdateVisitNotesDto) => visitsService.updateNotes(visitId, data),
    onSuccess: () => {
      toast.success("Notes saved successfully");
      queryClient.invalidateQueries({ queryKey: ["visit", visitId] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => visitsService.complete(visitId),
    onSuccess: () => {
      toast.success("Visit completed");
      router.push("/appointments");
    },
  });

  const handleSave = () => {
    saveMutation.mutate(notes);
  };

  if (isVisitLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="text-slate-400 hover:text-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-50">Clinical Encounter</h1>
              <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20">
                {visit?.status}
              </Badge>
            </div>
            <p className="text-slate-400">
              Patient: <span className="text-slate-200 font-medium">{visit?.patientName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            className="bg-slate-900 border-slate-800 text-slate-300"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Draft"}
          </Button>
          <Button 
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete Visit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Documentation Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-500" />
                <CardTitle className="text-slate-100">SOAP Notes</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Subjective, Objective, Assessment, and Plan documentation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="subjective" className="w-full">
                <TabsList className="w-full justify-start rounded-none bg-slate-900/50 border-b border-slate-800 h-12">
                  <TabsTrigger value="subjective" className="data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400">Subjective</TabsTrigger>
                  <TabsTrigger value="objective" className="data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400">Objective</TabsTrigger>
                  <TabsTrigger value="assessment" className="data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400">Assessment</TabsTrigger>
                  <TabsTrigger value="plan" className="data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400">Plan</TabsTrigger>
                </TabsList>
                <div className="p-6">
                  <TabsContent value="subjective" className="mt-0 space-y-4">
                    <Label className="text-slate-300">Patient's chief complaint and symptoms</Label>
                    <Textarea 
                      placeholder="Enter what the patient reports..."
                      className="min-h-[300px] bg-slate-950 border-slate-800 focus-visible:ring-teal-500 text-slate-200"
                      value={notes.subjective}
                      onChange={(e) => setNotes({...notes, subjective: e.target.value})}
                    />
                  </TabsContent>
                  <TabsContent value="objective" className="mt-0 space-y-4">
                    <Label className="text-slate-300">Clinical findings, exam results, and vitals</Label>
                    <Textarea 
                      placeholder="Enter clinical observations..."
                      className="min-h-[300px] bg-slate-950 border-slate-800 focus-visible:ring-teal-500 text-slate-200"
                      value={notes.objective}
                      onChange={(e) => setNotes({...notes, objective: e.target.value})}
                    />
                  </TabsContent>
                  <TabsContent value="assessment" className="mt-0 space-y-4">
                    <Label className="text-slate-300">Diagnosis and evaluation</Label>
                    <Textarea 
                      placeholder="Enter diagnosis..."
                      className="min-h-[300px] bg-slate-950 border-slate-800 focus-visible:ring-teal-500 text-slate-200"
                      value={notes.assessment}
                      onChange={(e) => setNotes({...notes, assessment: e.target.value})}
                    />
                  </TabsContent>
                  <TabsContent value="plan" className="mt-0 space-y-4">
                    <Label className="text-slate-300">Proposed treatment and follow-up</Label>
                    <Textarea 
                      placeholder="Enter treatment plan..."
                      className="min-h-[300px] bg-slate-950 border-slate-800 focus-visible:ring-teal-500 text-slate-200"
                      value={notes.plan}
                      onChange={(e) => setNotes({...notes, plan: e.target.value})}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Patient Context */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-slate-100">Medical History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase text-slate-500">Allergies</Label>
                <p className="text-sm text-red-400 font-medium">{history?.allergies || "None reported"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase text-slate-500">Chronic Diseases</Label>
                <p className="text-sm text-slate-300">{history?.chronicDiseases || "None reported"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase text-slate-500">Current Medications</Label>
                <p className="text-sm text-slate-300">{history?.currentMedications || "None reported"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-slate-100">Patient Vitals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <Label className="text-[10px] uppercase text-slate-500 block mb-1">Blood Type</Label>
                <span className="text-xl font-bold text-slate-100">{history?.bloodType || "N/A"}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <Label className="text-[10px] uppercase text-slate-500 block mb-1">Gender</Label>
                <span className="text-xl font-bold text-slate-100">{patient?.gender || "N/A"}</span>
              </div>
            </CardContent>
          </Card>

          {visit?.patientId && (
            <TreatmentInVisit patientId={visit.patientId} visitId={visitId} />
          )}

          <Button 
            variant="outline" 
            className="w-full h-12 bg-slate-900 border-slate-800 hover:bg-slate-800 text-teal-400 border-dashed"
            onClick={() => window.open(`/patients/${visit?.patientId}`, '_blank')}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            View Full Patient File
          </Button>
        </div>
      </div>
    </div>
  );
}
