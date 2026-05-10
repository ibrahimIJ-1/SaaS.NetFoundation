"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsService } from "@/services/patients.service";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ArrowLeft, Edit, Activity, Stethoscope, User, Trash, AlertTriangle, ClipboardList, CreditCard } from "lucide-react";
import MedicalHistoryTab from "./_components/medical-history-tab";
import OdontogramTab from "./_components/odontogram-tab";
import TreatmentPlansTab from "./_components/treatment-plans-tab";
import BillingTab from "./_components/billing-tab";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreatePatientDto } from "@/types/clinical";

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const patientId = params.id as string;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState<CreatePatientDto>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Male",
    phoneNumber: "",
    nationalId: "",
    email: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientsService.getById(patientId),
  });

  const openEditModal = () => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "yyyy-MM-dd") : "",
        gender: patient.gender,
        phoneNumber: patient.phoneNumber || "",
        nationalId: patient.nationalId || "",
        email: patient.email || "",
        address: patient.address || "",
        emergencyContactName: patient.emergencyContactName || "",
        emergencyContactPhone: patient.emergencyContactPhone || "",
      });
      setIsEditOpen(true);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreatePatientDto>) => patientsService.update(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Profile updated successfully");
      setIsEditOpen(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => patientsService.delete(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient deleted successfully");
      router.push("/patients");
    },
    onError: () => {
      toast.error("Failed to delete patient");
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-50 mb-2">
          Patient Not Found
        </h2>
        <p className="text-slate-400 mb-6">
          The patient you are looking for does not exist or you don't have
          access.
        </p>
        <Button onClick={() => router.push("/patients")} variant="outline">
          Return to Registry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="p-2 text-slate-400 hover:text-slate-50"
          onClick={() => router.push("/patients")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            {patient.fullName}
          </h1>
          <p className="text-slate-400 mt-1">
            Patient ID:{" "}
            <span className="font-mono">{patient.id.substring(0, 8)}</span>
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={openEditModal} className="bg-teal-600 hover:bg-teal-500 text-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400"
          >
            <User className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="medical-history"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400"
          >
            <Activity className="w-4 h-4 mr-2" />
            Medical History
          </TabsTrigger>
          <TabsTrigger
            value="odontogram"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400"
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Dental Chart
          </TabsTrigger>
          <TabsTrigger
            value="treatment-plans"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400"
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Treatment Plans
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-50">Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      Date of Birth
                    </p>
                    <p className="text-slate-200">
                      {format(new Date(patient.dateOfBirth), "dd MMMM yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Gender</p>
                    <p className="text-slate-200">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      National ID
                    </p>
                    <p className="text-slate-200">
                      {patient.nationalId || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-50">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Phone</p>
                    <p className="text-slate-200">
                      {patient.phoneNumber || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Email</p>
                    <p className="text-slate-200">{patient.email || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-400">
                      Address
                    </p>
                    <p className="text-slate-200">{patient.address || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-50">
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Name</p>
                    <p className="text-slate-200">
                      {patient.emergencyContactName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Phone</p>
                    <p className="text-slate-200">
                      {patient.emergencyContactPhone || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-500/10 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">
                  Deleting a patient will archive their record and all associated clinical data. This action cannot be easily undone.
                </p>
                <Button 
                  onClick={() => setIsDeleteOpen(true)}
                  variant="outline" 
                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border-red-500/30"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Patient
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical-history" className="mt-6">
          <MedicalHistoryTab patientId={patient.id} />
        </TabsContent>

        <TabsContent value="odontogram" className="mt-6">
          <OdontogramTab patientId={patient.id} />
        </TabsContent>

        <TabsContent value="treatment-plans" className="mt-6">
          <TreatmentPlansTab patientId={patient.id} />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingTab patientId={patient.id} />
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>Edit Patient Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-300">First Name *</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-300">Last Name *</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-slate-300">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-slate-300">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId" className="text-slate-300">National ID</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-300">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName" className="text-slate-300">Emerg. Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone" className="text-slate-300">Emerg. Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                  />
                </div>
              </div>

            </div>
            <DialogFooter className="mt-4">
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="bg-teal-600 hover:bg-teal-500 text-white"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete <strong>{patient.fullName}</strong>? This will archive their record and all associated clinical data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteOpen(false)}
              className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => deleteMutation.mutate()} 
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
