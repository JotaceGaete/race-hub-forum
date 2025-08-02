import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

interface RaceEvent {
  id: string;
  title: string;
  event_date: string;
  location: string;
  description?: string;
}

interface RaceCalendarProps {
  events: RaceEvent[];
  onEventClick: (event: RaceEvent) => void;
}

export const RaceCalendar = ({ events, onEventClick }: RaceCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.event_date), day)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-forum-race" />
            Calendario de Carreras
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[200px] text-center">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(day => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] p-2 border rounded-lg ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/50'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <Badge
                      key={event.id}
                      variant="secondary"
                      className="w-full text-xs cursor-pointer hover:bg-forum-race hover:text-white transition-colors block truncate"
                      onClick={() => onEventClick(event)}
                    >
                      {event.title}
                    </Badge>
                  ))}
                  
                  {dayEvents.length > 2 && (
                    <Badge variant="outline" className="w-full text-xs">
                      +{dayEvents.length - 2} más
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay eventos programados para este mes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};