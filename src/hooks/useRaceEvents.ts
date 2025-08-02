import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RaceEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  cancha_id?: string | null;
  location?: string; // Mantener por compatibilidad
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
  updated_at: string;
  cancha?: {
    id: string;
    nombre: string;
    comuna: string;
    latitud: number;
    longitud: number;
    direccion?: string;
  };
}

export const useRaceEvents = () => {
  return useQuery({
    queryKey: ["race_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("race_events")
        .select(`
          *,
          cancha:canchas (
            id,
            nombre,
            comuna,
            latitud,
            longitud,
            direccion
          )
        `)
        .order("event_date", { ascending: true });
      
      if (error) throw error;
      return data as RaceEvent[];
    },
  });
};

export const useUpdateRaceEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, eventData }: {
      id: string;
      eventData: {
        title: string;
        description: string;
        event_date: string;
        cancha_id?: string;
        image_urls?: string[];
      }
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("race_events")
        .update({
          ...eventData,
          location: "", // Temporal para compatibilidad
          image_url: eventData.image_urls?.[0] || null
        })
        .eq('id', id)
        .eq('user_id', user.id) // Solo permitir editar sus propios eventos
        .select(`
          *,
          cancha:canchas (
            id,
            nombre,
            comuna,
            latitud,
            longitud,
            direccion
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["race_events"] });
    },
  });
};

export const useDeleteRaceEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { error } = await supabase
        .from("race_events")
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Solo permitir eliminar sus propios eventos
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["race_events"] });
    },
  });
};

export const useCreateRaceEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData: {
      title: string;
      description: string;
      event_date: string;
      cancha_id?: string;
      image_urls?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("race_events")
        .insert([{
          ...eventData,
          user_id: user.id,
          location: "", // Temporal para compatibilidad
          // Mantener compatibilidad con image_url por ahora
          image_url: eventData.image_urls?.[0] || null
        }])
        .select(`
          *,
          cancha:canchas (
            id,
            nombre,
            comuna,
            latitud,
            longitud,
            direccion
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["race_events"] });
    },
  });
};