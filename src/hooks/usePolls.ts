import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Poll {
  id: string;
  post_id: string;
  question: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  created_at: string;
  vote_count?: number;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export const usePoll = (postId: string) => {
  return useQuery({
    queryKey: ["poll", postId],
    queryFn: async () => {
      const { data: poll, error: pollError } = await supabase
        .from("post_polls")
        .select("*")
        .eq("post_id", postId)
        .single();

      if (pollError) {
        if (pollError.code === "PGRST116") {
          return null; // No poll found
        }
        throw pollError;
      }

      const { data: options, error: optionsError } = await supabase
        .from("poll_options")
        .select("*")
        .eq("poll_id", poll.id)
        .order("created_at");

      if (optionsError) throw optionsError;

      // Get vote counts for each option
      const optionsWithCounts = await Promise.all(
        options.map(async (option) => {
          const { count } = await supabase
            .from("poll_votes")
            .select("*", { count: "exact", head: true })
            .eq("option_id", option.id);

          return {
            ...option,
            vote_count: count || 0,
          };
        })
      );

      return {
        ...poll,
        options: optionsWithCounts,
      } as PollWithOptions;
    },
    enabled: !!postId && postId !== "skip",
  });
};

export const useCreatePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      question,
      options,
    }: {
      postId: string;
      question: string;
      options: string[];
    }) => {
      // Create the poll
      const { data: poll, error: pollError } = await supabase
        .from("post_polls")
        .insert({
          post_id: postId,
          question,
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create the options
      const { error: optionsError } = await supabase
        .from("poll_options")
        .insert(
          options.map((optionText) => ({
            poll_id: poll.id,
            option_text: optionText,
          }))
        );

      if (optionsError) throw optionsError;

      return poll;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["poll", data.post_id] });
    },
  });
};