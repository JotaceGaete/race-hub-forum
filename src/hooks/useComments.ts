import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          user:profiles(username, full_name, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as Comment[];
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      post_id,
      content,
    }: {
      post_id: string;
      content: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("comments")
        .insert([{
          post_id,
          user_id: user.id,
          content,
        }])
        .select(`
          *,
          user:profiles(username, full_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["comments", data.post_id] });
    },
  });
};