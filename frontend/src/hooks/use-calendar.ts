import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '@/services/calendar.service';
import { CalendarEvent, UserTask } from '@/types/calendar';

import { toast } from 'sonner';

export function useCalendarEvents(start: string, end: string) {
  return useQuery({
    queryKey: ['calendar', 'events', start, end],
    queryFn: () => calendarService.getEvents(start, end),
    enabled: !!start && !!end,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => calendarService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('تمت إضافة الموعد للتقويم');
    }
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      calendarService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('تم تحديث الموعد');
    }
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('تم حذف الموعد');
    }
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ['calendar', 'tasks'],
    queryFn: calendarService.getTasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => calendarService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'tasks'] });
      toast.success('تم إنشاء المهمة');
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      calendarService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'tasks'] });
      toast.success('تم تحديث المهمة');
    }
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) => 
      calendarService.toggleTask(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'tasks'] });
    }
  });
}

export function useDeleteTask() {

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'tasks'] });
      toast.success('تم حذف المهمة');
    }
  });
}

