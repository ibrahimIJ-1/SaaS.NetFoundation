import { apiClient } from './api-client';
import { CalendarEvent, UserTask } from '../types/calendar';

export const calendarService = {

  getEvents: async (start: string, end: string): Promise<CalendarEvent[]> => {
    const response = await apiClient.get('/calendar/events', {
      params: { start, end }
    });
    return response.data;
  },

  createEvent: async (data: any): Promise<CalendarEvent> => {
    const response = await apiClient.post('/calendar/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: any): Promise<CalendarEvent> => {
    const response = await apiClient.put(`/calendar/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await apiClient.delete(`/calendar/events/${id}`);
  },

  // Tasks
  getTasks: async (): Promise<UserTask[]> => {
    const response = await apiClient.get('/calendar/tasks');
    return response.data;
  },

  createTask: async (data: any): Promise<UserTask> => {
    const response = await apiClient.post('/calendar/tasks', data);
    return response.data;
  },

  updateTask: async (id: string, data: any): Promise<UserTask> => {
    const response = await apiClient.put(`/calendar/tasks/${id}`, data);
    return response.data;
  },

  toggleTask: async (id: string, isCompleted: boolean): Promise<UserTask> => {
    const response = await apiClient.patch(`/calendar/tasks/${id}/toggle`, { isCompleted });
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {

    await apiClient.delete(`/calendar/tasks/${id}`);
  }
};

