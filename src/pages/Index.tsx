import { useState, useEffect } from "react";
import { ForumHeader } from "@/components/forum/ForumHeader";
import { AuthForm } from "@/components/auth/AuthForm";
import { CategoryCard } from "@/components/forum/CategoryCard";
import { PostCard } from "@/components/forum/PostCard";
import { RaceEventForm, RaceEventData } from "@/components/forum/RaceEventForm";
import { RaceCalendar } from "@/components/forum/RaceCalendar";
import { EventDetailsModal } from "@/components/forum/EventDetailsModal";
import { PostDetailsModal } from "@/components/forum/PostDetailsModal";
import { PostEditForm } from "@/components/forum/PostEditForm";
import { PostCreateForm } from "@/components/forum/PostCreateForm";
import { EventFiltersComponent, EventFilters } from "@/components/forum/EventFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Calendar, List, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { usePosts, useUpdatePost, useDeletePost } from "@/hooks/usePosts";
import { useRaceEvents, useCreateRaceEvent, useUpdateRaceEvent, useDeleteRaceEvent } from "@/hooks/useRaceEvents";
import { seedInitialData } from "@/utils/seedData";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRaceForm, setShowRaceForm] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showPostDetails, setShowPostDetails] = useState(false);
  const [showPostEdit, setShowPostEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showPostCreateForm, setShowPostCreateForm] = useState(false);
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
  const updateRaceEventMutation = useUpdateRaceEvent();
  const deleteRaceEventMutation = useDeleteRaceEvent();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

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
    const eventLocation = event.cancha?.comuna || event.location || "";
    const matchesLocation = !eventFilters.location || 
                           eventLocation.toLowerCase().includes(eventFilters.location.toLowerCase());
    const eventDate = new Date(event.event_date);
    const matchesDateFrom = !eventFilters.dateFrom || eventDate >= eventFilters.dateFrom;
    const matchesDateTo = !eventFilters.dateTo || eventDate <= eventFilters.dateTo;
    
    return matchesLocation && matchesDateFrom && matchesDateTo;
  });

  const handleCreateRaceEvent = async (eventData: RaceEventData) => {
    try {
      if (editingEvent) {
        // Actualizar evento existente
        await updateRaceEventMutation.mutateAsync({
          id: editingEvent.id,
          eventData: {
            title: eventData.title,
            description: eventData.description,
            event_date: eventData.event_date.toISOString().split('T')[0],
            cancha_id: eventData.cancha_id,
            image_urls: eventData.image_urls || []
          }
        });
        
        toast({
          title: "¡Carrera actualizada!",
          description: "Tu evento ha sido actualizado exitosamente."
        });
      } else {
        // Crear nuevo evento
        await createRaceEventMutation.mutateAsync({
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date.toISOString().split('T')[0],
          cancha_id: eventData.cancha_id,
          image_urls: eventData.image_urls || []
        });
        
        toast({
          title: "¡Carrera publicada!",
          description: "Tu evento ha sido publicado exitosamente."
        });
      }
      
      setShowRaceForm(false);
      setEditingEvent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: editingEvent ? "Hubo un problema al actualizar el evento." : "Hubo un problema al publicar el evento.",
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

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowEventDetails(false);
    setShowRaceForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteRaceEventMutation.mutateAsync(eventId);
      setShowEventDetails(false);
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setShowPostDetails(false);
    setShowPostEdit(true);
  };

  const handleUpdatePost = async (postData: { id: string; title: string; content: string; category_id: string }) => {
    try {
      await updatePostMutation.mutateAsync(postData);
      
      toast({
        title: "¡Post actualizado!",
        description: "Tu post ha sido actualizado exitosamente."
      });
      
      setShowPostEdit(false);
      setEditingPost(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el post.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync(postId);
      
      toast({
        title: "Post eliminado",
        description: "El post ha sido eliminado exitosamente."
      });
      
      setShowPostDetails(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el post.",
        variant: "destructive"
      });
    }
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
          onCreatePost={() => setShowPostCreateForm(true)}
          onCreateRace={() => setShowRaceForm(true)}
          onShowAuth={() => setShowAuthForm(true)}
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
                        onClick={() => {
                          setSelectedPost(post);
                          setShowPostDetails(true);
                        }}
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
                onEventClick={handleEventClick}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showRaceForm} onOpenChange={() => {
          setShowRaceForm(false);
          setEditingEvent(null);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <RaceEventForm
              onSubmit={handleCreateRaceEvent}
              onCancel={() => {
                setShowRaceForm(false);
                setEditingEvent(null);
              }}
              initialData={editingEvent}
              isEditing={!!editingEvent}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showAuthForm} onOpenChange={setShowAuthForm}>
          <DialogContent className="max-w-md">
            <AuthForm onSuccess={() => setShowAuthForm(false)} />
          </DialogContent>
        </Dialog>

        <EventDetailsModal
          event={selectedEvent}
          isOpen={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />

        <PostDetailsModal
          post={selectedPost}
          isOpen={showPostDetails}
          onClose={() => setShowPostDetails(false)}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
        />

        <Dialog open={showPostEdit} onOpenChange={() => {
          setShowPostEdit(false);
          setEditingPost(null);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {editingPost && (
              <PostEditForm
                post={editingPost}
                onSubmit={handleUpdatePost}
                onCancel={() => {
                  setShowPostEdit(false);
                  setEditingPost(null);
                }}
                isSubmitting={updatePostMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        <PostCreateForm
          open={showPostCreateForm}
          onOpenChange={setShowPostCreateForm}
        />
      </div>
    </div>
  );
};

export default Index;