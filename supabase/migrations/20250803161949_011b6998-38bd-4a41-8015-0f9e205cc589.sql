-- Agregar columna para vetar comentarios
ALTER TABLE public.comments 
ADD COLUMN vetted BOOLEAN DEFAULT FALSE,
ADD COLUMN vetted_by UUID REFERENCES auth.users(id),
ADD COLUMN vetted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN vetted_reason TEXT;