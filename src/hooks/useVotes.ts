import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PostVote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: number; // -1 for downvote, 1 for upvote
  created_at: string;
}

export interface VoteStats {
  upvotes: number;
  downvotes: number;
  userVote: number | null; // null if user hasn't voted
  total: number;
}

export const usePostVotes = (postId: string) => {
  return useQuery({
    queryKey: ["post-votes", postId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: votes, error } = await supabase
        .from("post_votes")
        .select("*")
        .eq("post_id", postId);
      
      if (error) throw error;

      const upvotes = votes.filter(vote => vote.vote_type === 1).length;
      const downvotes = votes.filter(vote => vote.vote_type === -1).length;
      const userVote = user 
        ? votes.find(vote => vote.user_id === user.id)?.vote_type || null
        : null;

      return {
        upvotes,
        downvotes,
        userVote,
        total: upvotes - downvotes,
      } as VoteStats;
    },
  });
};

export const useVotePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      postId,
      voteType,
    }: {
      postId: string;
      voteType: number; // -1 or 1
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from("post_votes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking the same button
          const { error } = await supabase
            .from("post_votes")
            .delete()
            .eq("id", existingVote.id);
          
          if (error) throw error;
          return { action: "removed" };
        } else {
          // Update vote type
          const { error } = await supabase
            .from("post_votes")
            .update({ vote_type: voteType })
            .eq("id", existingVote.id);
          
          if (error) throw error;
          return { action: "updated" };
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from("post_votes")
          .insert([{
            post_id: postId,
            user_id: user.id,
            vote_type: voteType,
          }]);
        
        if (error) throw error;
        return { action: "created" };
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post-votes", variables.postId] });
    },
  });
};