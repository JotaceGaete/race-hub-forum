import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Post {
  id: string;
  title: string;
  content: string | null;
  category_id: string | null;
  author_name: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
    color: string;
  };
  profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const usePosts = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          category:categories(name, color)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles separately for each post
      const postsWithProfiles = await Promise.all(
        data.map(async (post) => {
          if (post.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url")
              .eq("user_id", post.user_id)
              .maybeSingle();
            
            return {
              ...post,
              profile: profile || null
            };
          }
          return {
            ...post,
            profile: null
          };
        })
      );
      
      return postsWithProfiles as Post[];
    },
    refetchInterval: 30000, // Polling fallback every 30 seconds
  });

  // Set up real-time subscription for posts
  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          // Invalidate and refetch posts when any change occurs
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postData: {
      title: string;
      content: string;
      category_id: string;
      author_name: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("posts")
        .insert([{
          ...postData,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postData: {
      id: string;
      title: string;
      content: string;
      category_id: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("posts")
        .update({
          title: postData.title,
          content: postData.content,
          category_id: postData.category_id,
          updated_at: new Date().toISOString()
        })
        .eq("id", postData.id)
        .eq("user_id", user.id) // Solo permite editar posts propios
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id); // Solo permite eliminar posts propios
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};