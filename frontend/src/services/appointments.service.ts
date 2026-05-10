import { apiClient } from "./api-client";
import {
  Appointment,
  CreateAppointmentDto,
  AppointmentStatus,
} from "@/types/clinical";

export const appointmentsService = {
  getAll: (filters?: {
    startDate?: string;
    endDate?: string;
    patientId?: string;
    doctorId?: string;
  }) =>
    apiClient
      .get<Appointment[]>("/tenant/appointments", { params: filters })
      .then((res) => res.data),

  create: (data: CreateAppointmentDto) =>
    apiClient
      .post<string>("/tenant/appointments", data)
      .then((res) => res.data),

  updateStatus: (id: string, status: AppointmentStatus) =>
    apiClient
      .put(`/tenant/appointments/${id}/status`, {
        newStatus: status,
        appointmentId: id,
      })
      .then((res) => res.data),

  reschedule: (
    id: string,
    data: { newStartTime: string; newEndTime: string },
  ) =>
    apiClient
      .put(`/tenant/appointments/${id}/reschedule`, data)
      .then((res) => res.data),

  delete: (id: string) =>
    apiClient.delete(`/tenant/appointments/${id}`).then((res) => res.data),
};
