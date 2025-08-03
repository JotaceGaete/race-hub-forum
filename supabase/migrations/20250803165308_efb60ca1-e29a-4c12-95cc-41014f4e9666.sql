-- Create post_polls table
CREATE TABLE public.post_polls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create poll_options table
CREATE TABLE public.poll_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid REFERENCES public.post_polls(id) ON DELETE CASCADE NOT NULL,
  option_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid REFERENCES public.post_polls(id) ON DELETE CASCADE NOT NULL,
  option_id uuid REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS on all poll tables
ALTER TABLE public.post_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_polls
CREATE POLICY "Polls are viewable by everyone" 
ON public.post_polls FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create polls" 
ON public.post_polls FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own polls" 
ON public.post_polls FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.posts 
  WHERE posts.id = post_polls.post_id 
  AND posts.user_id = auth.uid()
));

-- RLS policies for poll_options
CREATE POLICY "Poll options are viewable by everyone" 
ON public.poll_options FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create poll options" 
ON public.poll_options FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for poll_votes
CREATE POLICY "Poll votes are viewable by everyone" 
ON public.poll_votes FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can vote" 
ON public.poll_votes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.poll_votes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.poll_votes FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_post_polls_updated_at
  BEFORE UPDATE ON public.post_polls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();