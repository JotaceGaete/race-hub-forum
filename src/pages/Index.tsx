import { useState, useEffect } from "react";
import { ForumHeader } from "@/components/forum/ForumHeader";
import { CategoryCard } from "@/components/forum/CategoryCard";
import { PostCard } from "@/components/forum/PostCard";
import { RaceEventForm, RaceEventData } from "@/components/forum/RaceEventForm";
import { RaceCalendar } from "@/components/forum/RaceCalendar";
import { EventFiltersComponent, EventFilters } from "@/components/forum/EventFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Calendar, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - esto se reemplazará con datos reales de Supabase
const mockCategories = [
  { id: "1", name: "Próximas Carreras", description: "Anuncios de carreras y eventos deportivos", color: "#EF4444" },
  { id: "2", name: "General", description: "Discusiones generales", color: "#3B82F6" },
  { id: "3", name: "Entrenamiento", description: "Tips y consejos de entrenamiento", color: "#10B981" },
  { id: "4", name: "Equipamiento", description: "Reseñas y recomendaciones de equipo", color: "#F59E0B" },
];

const mockPosts = [
  {
    id: "1",
    title: "¿Cuál es vuestra rutina de entrenamiento favorita?",
    content: "Estoy buscando nuevas ideas para variar mi entrenamiento semanal. ¿Qué rutinas funcionan mejor para vosotros?",
    author_name: "RunnerPro",
    created_at: new Date().toISOString(),
    category: { name: "Entrenamiento", color: "#10B981" }
  },
  {
    id: "2",
    title: "Reseña: Zapatillas Nike Air Zoom Pegasus 40",
    content: "Después de 500km con estas zapatillas, aquí está mi reseña completa...",
    author_name: "MaratonMania",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    category: { name: "Equipamiento", color: "#F59E0B" }
  }
];

const mockRaceEvents = [
  {
    id: "1",
    title: "Maratón Valencia 2024",
    description: "El maratón más rápido de España",
    event_date: "2024-12-01",
    location: "Valencia, España"
  },
  {
    id: "2",
    title: "Media Maratón Madrid",
    description: "Carrera por el centro histórico de Madrid",
    event_date: "2024-11-15",
    location: "Madrid, España"
  }
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRaceForm, setShowRaceForm] = useState(false);
  const [activeTab, setActiveTab] = useState("forum");
  const [eventFilters, setEventFilters] = useState<EventFilters>({
    location: "",
    dateFrom: null,
    dateTo: null
  });
  const { toast } = useToast();

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredEvents = mockRaceEvents.filter(event => {
    const matchesLocation = !eventFilters.location || 
                           event.location.toLowerCase().includes(eventFilters.location.toLowerCase());
    const eventDate = new Date(event.event_date);
    const matchesDateFrom = !eventFilters.dateFrom || eventDate >= eventFilters.dateFrom;
    const matchesDateTo = !eventFilters.dateTo || eventDate <= eventFilters.dateTo;
    
    return matchesLocation && matchesDateFrom && matchesDateTo;
  });

  const handleCreateRaceEvent = (eventData: RaceEventData) => {
    console.log("Crear evento:", eventData);
    toast({
      title: "¡Carrera publicada!",
      description: "Tu evento ha sido publicado exitosamente."
    });
    setShowRaceForm(false);
  };

  const handleClearFilters = () => {
    setEventFilters({
      location: "",
      dateFrom: null,
      dateTo: null
    });
  };

  const getCategoryName = (categoryId: string) => {
    return mockCategories.find(cat => cat.id === categoryId)?.name || null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ForumHeader 
          onCreatePost={() => toast({ title: "Función en desarrollo", description: "Próximamente disponible" })}
          onCreateRace={() => setShowRaceForm(true)}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Foro
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forum" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar con categorías */}
              <div className="lg:w-80 space-y-4">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Categorías</h2>
                  <div className="space-y-3">
                    {mockCategories.map(category => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onClick={() => setSelectedCategory(
                          selectedCategory === category.name ? null : category.name
                        )}
                        isSelected={selectedCategory === category.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar posts..."
                      className="pl-10"
                    />
                  </div>
                  {selectedCategory && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Mostrar todas las categorías
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onClick={() => toast({ title: "Post", description: `Abriendo: ${post.title}` })}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        {searchTerm || selectedCategory 
                          ? "No se encontraron posts con los filtros aplicados" 
                          : "No hay posts disponibles"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="space-y-6">
              <EventFiltersComponent
                filters={eventFilters}
                onFiltersChange={setEventFilters}
                onClearFilters={handleClearFilters}
              />
              
              <RaceCalendar
                events={filteredEvents}
                onEventClick={(event) => toast({ 
                  title: event.title, 
                  description: `${event.location} - ${new Date(event.event_date).toLocaleDateString()}` 
                })}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showRaceForm} onOpenChange={setShowRaceForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <RaceEventForm
              onSubmit={handleCreateRaceEvent}
              onCancel={() => setShowRaceForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;