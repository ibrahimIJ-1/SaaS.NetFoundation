export type CalendarEventType = 'Case' | 'Session' | 'Meeting' | 'Deadline';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  type: CalendarEventType;
  legalCaseId?: string;
  isAllDay: boolean;
  hasConflict?: boolean;
}

export interface UserTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  legalCaseId?: string;
  type: string;
  assigneeName?: string;
}

