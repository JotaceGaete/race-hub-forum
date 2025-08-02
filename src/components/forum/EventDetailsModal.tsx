import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, FileText, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OpenStreetMap } from "./OpenStreetMap";

interface RaceEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location?: string;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
  cancha?: {
    id: string;
    nombre: string;
    comuna: string;
    latitud: number;
    longitud: number;
    direccion?: string;
  };
}

interface EventDetailsModalProps {
  event: RaceEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: RaceEvent) => void;
  onDelete?: (eventId: string) => void;
}

export const EventDetailsModal = ({ event, isOpen, onClose, onEdit, onDelete }: EventDetailsModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!event) return null;

  const eventDate = new Date(event.event_date);
  const formattedDate = format(eventDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  
  // Get images from both old and new format
  const images = event.image_urls || (event.image_url ? [event.image_url] : []);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDelete = async () => {
    if (!user || !event || user.id !== event.user_id) {
      toast({
        title: "Error",
        description: "No tienes permisos para eliminar este evento",
        variant: "destructive"
      });
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('race_events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Evento eliminado",
        description: "El evento se ha eliminado exitosamente"
      });
      
      onDelete?.(event.id);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive"
      });
    }
  };

  const canEditOrDelete = user && event.user_id && user.id === event.user_id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold text-forum-race">
              {event.title}
            </DialogTitle>
            {canEditOrDelete && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(event)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Carrusel de imágenes */}
          {images.length > 0 && (
            <div className="relative w-full">
              <div className="relative">
                <img 
                  src={images[currentImageIndex]} 
                  alt={`${event.title} - imagen ${currentImageIndex + 1}`}
                  className="w-full max-h-96 object-contain rounded-lg bg-muted"
                  onError={(e) => {
                    console.error('Error loading image:', images[currentImageIndex]);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                
                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-forum-race' : 'bg-muted-foreground/30'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Información principal */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 text-lg">
              <Calendar className="w-5 h-5 text-forum-race" />
              <span className="font-semibold">{formattedDate}</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <h3 className="font-semibold">Ubicación</h3>
                  <p className="text-muted-foreground">
                    {event.cancha ? 
                      `${event.cancha.nombre} - ${event.cancha.comuna}` : 
                      (event.location || 'Ubicación por confirmar')
                    }
                  </p>
                  {event.cancha?.direccion && (
                    <p className="text-sm text-muted-foreground">{event.cancha.direccion}</p>
                  )}
                </div>
              </div>
              
              {/* Mapa OpenStreetMap */}
              {event.cancha && (
                <OpenStreetMap
                  latitude={event.cancha.latitud}
                  longitude={event.cancha.longitud}
                  location={`${event.cancha.nombre} - ${event.cancha.comuna}`}
                  className="mt-4"
                />
              )}
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