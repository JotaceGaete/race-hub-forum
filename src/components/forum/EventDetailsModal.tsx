import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, FileText, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RaceEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

interface EventDetailsModalProps {
  event: RaceEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailsModal = ({ event, isOpen, onClose }: EventDetailsModalProps) => {
  if (!event) return null;

  const eventDate = new Date(event.event_date);
  const formattedDate = format(eventDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-forum-race">
            {event.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Imagen del evento */}
          {event.image_url && (
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Información principal */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 text-lg">
              <Calendar className="w-5 h-5 text-forum-race" />
              <span className="font-semibold">{formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-3 text-lg">
              <MapPin className="w-5 h-5 text-forum-race" />
              <span>{event.location}</span>
            </div>
          </div>

          {/* Descripción */}
          {event.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-forum-race" />
                <h3 className="text-lg font-semibold">Descripción</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Publicado:</span>
                <br />
                {format(new Date(event.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
              </div>
              
              {event.updated_at !== event.created_at && (
                <div>
                  <span className="font-medium">Actualizado:</span>
                  <br />
                  {format(new Date(event.updated_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                </div>
              )}
            </div>
          </div>

          {/* Badge del tipo de evento */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-forum-race/10 text-forum-race">
              Evento de Carrera
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};