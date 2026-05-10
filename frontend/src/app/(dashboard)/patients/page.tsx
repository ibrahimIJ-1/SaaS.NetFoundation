"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsService } from "@/services/patients.service";
import { CreatePatientDto } from "@/types/clinical";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, User, Phone, MoreHorizontal, Activity } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PatientsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<CreatePatientDto>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Male",
    phoneNumber: "",
    nationalId: "",
  });

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: patientsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: patientsService.create,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient registered successfully");
      setIsCreateOpen(false);
      setFormData({ firstName: "", lastName: "", dateOfBirth: "", gender: "Male", phoneNumber: "", nationalId: "" });
      // Optionally route directly to the patient's file
      // router.push(`/patients/${id}`);
    },
    onError: () => {
      toast.error("Failed to register patient");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredPatients = patients?.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.phoneNumber && p.phoneNumber.includes(searchQuery)) ||
    (p.nationalId && p.nationalId.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            Patient Registry
          </h1>
          <p className="text-slate-400 mt-1">
            Manage all your clinic's patients and medical records.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Patient
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the patient's basic demographics. You can add clinical details later.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
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
                      className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-500 text-white"
                >
                  {createMutation.isPending ? "Saving..." : "Save Patient"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-50">Directory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="Search patients..."
                className="pl-9 bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Patient</TableHead>
                  <TableHead className="text-slate-400">Date of Birth</TableHead>
                  <TableHead className="text-slate-400">Contact</TableHead>
                  <TableHead className="text-slate-400">National ID</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients?.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => router.push(`/patients/${patient.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold overflow-hidden">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">
                            {patient.fullName}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {patient.gender}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {format(new Date(patient.dateOfBirth), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {patient.phoneNumber || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {patient.nationalId || "-"}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300">
                          <DropdownMenuItem 
                            className="focus:bg-slate-800 focus:text-slate-200 cursor-pointer"
                            onClick={() => router.push(`/patients/${patient.id}`)}
                          >
                            <User className="w-4 h-4 mr-2" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="focus:bg-slate-800 focus:text-slate-200 cursor-pointer"
                            onClick={() => router.push(`/patients/${patient.id}/medical-history`)}
                          >
                            <Activity className="w-4 h-4 mr-2 text-teal-500" /> Medical Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPatients?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-slate-500"
                    >
                      <User className="mx-auto h-8 w-8 mb-3 opacity-50" />
                      <p>No patients found.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
