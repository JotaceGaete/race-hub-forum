import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
}

export interface PollVoteStats {
  hasVoted: boolean;
  userVote: string | null; // option_id if user has voted
  totalVotes: number;
}

export const usePollVotes = (pollId: string) => {
  return useQuery({
    queryKey: ["poll-votes", pollId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: votes, error } = await supabase
        .from("poll_votes")
        .select("*")
        .eq("poll_id", pollId);
      
      if (error) throw error;

      const hasVoted = user 
        ? votes.some(vote => vote.user_id === user.id)
        : false;
      
      const userVote = user && hasVoted
        ? votes.find(vote => vote.user_id === user.id)?.option_id || null
        : null;

      return {
        hasVoted,
        userVote,
        totalVotes: votes.length,
      } as PollVoteStats;
    },
    enabled: !!pollId && pollId !== "skip",
  });
};

export const useVotePoll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      pollId,
      optionId,
    }: {
      pollId: string;
      optionId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from("poll_votes")
        .select("*")
        .eq("poll_id", pollId)
        .eq("user_id", user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from("poll_votes")
          .update({ option_id: optionId })
          .eq("id", existingVote.id);
        
        if (error) throw error;
        return { action: "updated" };
      } else {
        // Create new vote
        const { error } = await supabase
          .from("poll_votes")
          .insert([{
            poll_id: pollId,
            option_id: optionId,
            user_id: user.id,
          }]);
        
        if (error) throw error;
        return { action: "created" };
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["poll-votes", variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ["poll", "*"] });
    },
  });
};