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
import { Search, Calendar, List, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { usePosts } from "@/hooks/usePosts";
import { useRaceEvents, useCreateRaceEvent } from "@/hooks/useRaceEvents";
import { seedInitialData } from "@/utils/seedData";

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
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const { data: raceEvents = [], isLoading: eventsLoading } = useRaceEvents();
  const createRaceEventMutation = useCreateRaceEvent();

  // Inicializar datos de ejemplo al cargar la aplicación
  useEffect(() => {
    seedInitialData();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredEvents = raceEvents.filter(event => {
    const matchesLocation = !eventFilters.location || 
                           event.location.toLowerCase().includes(eventFilters.location.toLowerCase());
    const eventDate = new Date(event.event_date);
    const matchesDateFrom = !eventFilters.dateFrom || eventDate >= eventFilters.dateFrom;
    const matchesDateTo = !eventFilters.dateTo || eventDate <= eventFilters.dateTo;
    
    return matchesLocation && matchesDateFrom && matchesDateTo;
  });

  const handleCreateRaceEvent = async (eventData: RaceEventData) => {
    try {
      await createRaceEventMutation.mutateAsync({
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date.toISOString().split('T')[0],
        location: eventData.location,
        image_url: eventData.image_url
      });
      
      toast({
        title: "¡Carrera publicada!",
        description: "Tu evento ha sido publicado exitosamente."
      });
      setShowRaceForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al publicar el evento. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleClearFilters = () => {
    setEventFilters({
      location: "",
      dateFrom: null,
      dateTo: null
    });
  };

  if (categoriesLoading || postsLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando foro...</span>
        </div>
      </div>
    );
  }

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
                    {categories.map(category => (
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