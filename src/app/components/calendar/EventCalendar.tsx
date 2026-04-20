import { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import type { CalendarEvent } from '../../types';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface EventCalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

// Convert our CalendarEvent to what react-big-calendar expects
interface RBCEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarEvent;
}

export function EventCalendar({ events, onEventClick }: EventCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const rbcEvents: RBCEvent[] = useMemo(() => {
    return events.map(e => ({
      id: e.id,
      title: e.title,
      start: new Date(e.start ?? new Date()),
      end: new Date(e.end ?? new Date()),
      resource: e
    }));
  }, [events]);

  const eventPropGetter = (event: RBCEvent) => {
    const backgroundColor = event.resource.backgroundColor;
    return {
      style: {
        backgroundColor,
        borderColor: backgroundColor,
        color: event.resource.textColor,
        borderRadius: '6px',
        border: 'none',
        padding: '2px 6px',
        fontSize: '11px',
        fontWeight: '600',
        transition: 'transform 0.15s, opacity 0.15s',
      },
    };
  };

  const handleSelectEvent = (event: RBCEvent) => {
    onEventClick(event.resource);
  };

  return (
    <div className="rbc-wrapper h-[700px]">
      <Calendar
        localizer={localizer}
        events={rbcEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventPropGetter}
        onSelectEvent={handleSelectEvent}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        views={['month', 'week', 'day', 'agenda']}
        popup
        selectable={false}
      />
    </div>
  );
}
