"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsService } from "@/services/appointments.service";
import { patientsService } from "@/services/patients.service";
import { usersService } from "@/services/admin.service";
import { resourcesService } from "@/services/resources.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, User, Armchair } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookAppointmentModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedChairId, setSelectedChairId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const { data: patients } = useQuery({
    queryKey: ["patients", patientSearch],
    queryFn: () => patientsService.getAll(),
    enabled: patientSearch.length > 2,
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => usersService.getAll(),
  });

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => resourcesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: appointmentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment booked successfully");
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.errors?.[0] || "Failed to book appointment";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId) {
      toast.error("Please select a patient and a doctor");
      return;
    }
    createMutation.mutate({
      patientId: selectedPatientId,
      doctorId: selectedDoctorId,
      chairId: selectedChairId || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      reason,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Type patient name..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-8 bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
              />
            </div>
            {patients && patients.length > 0 && (
              <div className="mt-2 border border-slate-800 rounded-md bg-slate-950 max-h-32 overflow-y-auto">
                {patients
                  .filter((p) =>
                    p.fullName
                      .toLowerCase()
                      .includes(patientSearch.toLowerCase()),
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      className={`p-2 cursor-pointer hover:bg-slate-800 flex items-center gap-2 ${selectedPatientId === p.id ? "bg-teal-500/10 text-teal-400" : ""}`}
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setPatientSearch(p.fullName);
                      }}
                    >
                      <User className="w-3 h-3" />
                      {p.fullName}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Doctor / Staff</Label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                required
              >
                <option value="">Select Doctor...</option>
                {doctors?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Dental Chair</Label>
              <select
                value={selectedChairId}
                onChange={(e) => setSelectedChairId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <option value="">Select Chair...</option>
                {rooms?.map((r) => (
                  <optgroup key={r.id} label={r.name}>
                    {r.chairs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {!c.isOperational && "(Maintenance)"}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Start Time</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">End Time</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Reason for Visit</Label>
            <Input
              placeholder="e.g. Tooth Extraction, Cleaning..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              {createMutation.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
