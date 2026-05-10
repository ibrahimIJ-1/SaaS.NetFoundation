"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsService } from "@/services/appointments.service";
import { visitsService } from "@/services/visits.service";
import { Appointment, AppointmentStatus } from "@/types/clinical";
import BookAppointmentModal from "./_components/book-appointment-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  MoreHorizontal,
  Plus,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash,
  Stethoscope,
  Armchair,
} from "lucide-react";
import { toast } from "sonner";

export default function AppointmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", selectedDate.toISOString().split("T")[0]],
    queryFn: () =>
      appointmentsService.getAll({
        startDate: format(selectedDate, "yyyy-MM-dd") + "T00:00:00Z",
        endDate: format(selectedDate, "yyyy-MM-dd") + "T23:59:59Z",
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment status updated");
    },
  });

  const startVisitMutation = useMutation({
    mutationFn: (appointmentId: string) => visitsService.start(appointmentId),
    onSuccess: (visitId) => {
      toast.success("Visit started");
      router.push(`/clinical/visit/${visitId}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment cancelled/deleted");
    },
  });

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Confirmed":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "Arrived":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "InProgress":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "NoShow":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            Appointments
          </h1>
          <p className="text-slate-400 mt-1">
            Manage scheduling and patient flow for{" "}
            {format(selectedDate, "MMMM d, yyyy")}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-slate-900 border-slate-800 text-slate-300"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
          <Button
            onClick={() => setIsBookModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Today's Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">
              {appointments?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-400">
              Arrived
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">
              {appointments?.filter((a) => a.status === "Arrived").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">
              {appointments?.filter((a) => a.status === "InProgress").length ||
                0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-400">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">
              {appointments?.filter((a) => a.status === "Completed").length ||
                0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">Daily Schedule</CardTitle>
          <CardDescription className="text-slate-400">
            Timeline of all scheduled visits for the selected day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
            </div>
          ) : !appointments || appointments.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarIcon className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500">
                No appointments scheduled for this day.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-slate-800 hover:bg-transparent">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Time</TableHead>
                  <TableHead className="text-slate-400">Patient</TableHead>
                  <TableHead className="text-slate-400">Resource / Chair</TableHead>
                  <TableHead className="text-slate-400">Reason</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-right text-slate-400">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments?.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    className="border-slate-800 hover:bg-slate-800/50"
                  >
                    <TableCell className="font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-teal-400" />
                        {format(
                          new Date(appointment.startTime),
                          "HH:mm",
                        )} - {format(new Date(appointment.endTime), "HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-bold">
                          {appointment.patientName.charAt(0)}
                        </div>
                        <div className="text-slate-200 font-medium">
                          {appointment.patientName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {appointment.chairName ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Armchair className="w-3.5 h-3.5 text-teal-500" />
                          <span className="text-sm">{appointment.chairName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">No chair assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {appointment.reason || "General Consultation"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(appointment.status)}
                      >
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex items-center justify-center rounded-md h-8 w-8 p-0 text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-slate-900 border-slate-800 text-slate-200"
                        >
                          <DropdownMenuLabel>
                            Manage Appointment
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-800" />
                          <DropdownMenuItem
                            onClick={() =>
                              statusMutation.mutate({
                                id: appointment.id,
                                status: "Arrived",
                              })
                            }
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2 text-amber-400" />
                            Mark Arrived
                          </DropdownMenuItem>

                          {appointment.status === "Arrived" && (
                            <DropdownMenuItem
                              onClick={() => startVisitMutation.mutate(appointment.id)}
                              className="text-teal-400 font-medium hover:text-teal-300"
                            >
                              <Stethoscope className="w-4 h-4 mr-2" />
                              Start Visit
                            </DropdownMenuItem>
                          )}

                          {appointment.status === "InProgress" && (
                            <DropdownMenuItem
                              onClick={() => {
                                if (appointment.visitId) {
                                  router.push(`/clinical/visit/${appointment.visitId}`);
                                } else {
                                  startVisitMutation.mutate(appointment.id);
                                }
                              }}
                              className="text-teal-400 font-medium hover:text-teal-300"
                            >
                              <ActivityIcon className="w-4 h-4 mr-2" />
                              Go to Active Visit
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() =>
                              statusMutation.mutate({
                                id: appointment.id,
                                status: "Completed",
                              })
                            }
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                            Complete
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-slate-800" />
                          <DropdownMenuItem
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to cancel this appointment?",
                                )
                              ) {
                                deleteMutation.mutate(appointment.id);
                              }
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Cancel / Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </div>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
