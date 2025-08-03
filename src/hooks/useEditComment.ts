import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEditComment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      commentId,
      content,
      media_urls,
      media_types,
    }: {
      commentId: string;
      content: string;
      media_urls?: string[];
      media_types?: string[];
    }) => {
      const { data, error } = await supabase
        .from("comments")
        .update({
          content,
          media_urls,
          media_types,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Comentario actualizado",
        description: "El comentario se ha actualizado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["comments", data.post_id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar comentario",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteComment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data, error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .select("post_id")
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Comentario eliminado",
        description: "El comentario se ha eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["comments", data.post_id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar comentario",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};