import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Cancha {
  id: string;
  nombre: string;
  comuna: string;
  latitud: number;
  longitud: number;
  direccion?: string;
  descripcion?: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface SolicitudCancha {
  id?: string;
  nombre_cancha: string;
  comuna: string;
  direccion_referencia?: string;
  descripcion?: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono?: string;
  user_id?: string;
  estado?: 'pendiente' | 'aprobada' | 'rechazada';
  notas_admin?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCanchas = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: canchas = [], isLoading } = useQuery({
    queryKey: ["canchas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("canchas")
        .select("*")
        .eq("activa", true)
        .order("comuna", { ascending: true })
        .order("nombre", { ascending: true });

      if (error) throw error;
      return data as Cancha[];
    },
  });

  const createSolicitudMutation = useMutation({
    mutationFn: async (solicitud: SolicitudCancha) => {
      const { data, error } = await supabase
        .from("solicitudes_canchas")
        .insert([solicitud])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de nueva cancha ha sido enviada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["solicitudes-canchas"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar solicitud",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCanchasPorComuna = (comuna: string) => {
    return canchas.filter(cancha => cancha.comuna === comuna);
  };

  const buscarCanchas = (query: string) => {
    return canchas.filter(cancha => 
      cancha.nombre.toLowerCase().includes(query.toLowerCase()) ||
      cancha.comuna.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    canchas,
    isLoading,
    createSolicitud: createSolicitudMutation.mutateAsync,
    isCreatingSolicitud: createSolicitudMutation.isPending,
    getCanchasPorComuna,
    buscarCanchas,
  };
};