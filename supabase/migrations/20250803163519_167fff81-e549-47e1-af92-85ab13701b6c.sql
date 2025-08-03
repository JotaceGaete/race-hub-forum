-- Enable realtime for comments table
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.comments;

-- Enable realtime for posts table  
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.posts;