import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  media_urls?: string[] | null;
  media_types?: string[] | null;
  vetted?: boolean;
  vetted_by?: string | null;
  vetted_at?: string | null;
  vetted_reason?: string | null;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export const useComments = (postId: string) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Manually fetch profiles for each comment
      const commentsWithUsers = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .eq("user_id", comment.user_id)
            .single();
          
          return {
            ...comment,
            user: profile || {
              username: "Usuario",
              full_name: "Usuario Anónimo",
              avatar_url: null
            }
          };
        })
      );
      
      return commentsWithUsers as Comment[];
    },
    enabled: !!postId && postId !== "skip",
    refetchInterval: 30000, // Polling fallback every 30 seconds
  });

  // Set up real-time subscription for comments
  useEffect(() => {
    if (!postId || postId === "skip") return;

    const channel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          // Invalidate and refetch comments when any change occurs
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return query;
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      post_id,
      content,
      media_urls,
      media_types,
    }: {
      post_id: string;
      content: string;
      media_urls?: string[];
      media_types?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("comments")
        .insert([{
          post_id,
          user_id: user.id,
          content,
          media_urls,
          media_types,
        }])
        .select("*")
        .single();
      
      if (error) throw error;
      
      // Fetch profile for the created comment
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      
      return {
        ...data,
        user: profile || {
          username: "Usuario",
          full_name: "Usuario Anónimo",
          avatar_url: null
        }
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["comments", data.post_id] });
    },
  });
};