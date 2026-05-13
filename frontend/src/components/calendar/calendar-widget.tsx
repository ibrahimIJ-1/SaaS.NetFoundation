'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Props = {
  events: {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  }[];
  onDatesSet: (info: { start: Date; end: Date }) => void;
  onEventClick: (info: { event: { id: string } }) => void;
};

export function CalendarWidget({ events, onDatesSet, onEventClick }: Props) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      locale="ar"
      direction="rtl"
      events={events}
      height={620}
      datesSet={onDatesSet}
      eventClick={onEventClick}
      buttonText={{
        today: 'اليوم',
        month: 'شهر',
        week: 'أسبوع',
        day: 'يوم',
      }}
      nowIndicator
      dayMaxEvents={3}
    />
  );
}
