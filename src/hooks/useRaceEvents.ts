import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RaceEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useRaceEvents = () => {
  return useQuery({
    queryKey: ["race_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("race_events")
        .select("*")
        .order("event_date", { ascending: true });
      
      if (error) throw error;
      return data as RaceEvent[];
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
      location: string;
      image_url?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("race_events")
        .insert([{
          ...eventData,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["race_events"] });
    },
  });
};