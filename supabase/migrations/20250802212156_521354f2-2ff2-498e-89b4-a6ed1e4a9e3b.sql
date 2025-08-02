-- Agregar campos para medios en comentarios
ALTER TABLE public.comments 
ADD COLUMN media_urls TEXT[] DEFAULT NULL,
ADD COLUMN media_types TEXT[] DEFAULT NULL;

-- Agregar comentario para documentar los nuevos campos
COMMENT ON COLUMN public.comments.media_urls IS 'URLs de imágenes o videos adjuntos al comentario';
COMMENT ON COLUMN public.comments.media_types IS 'Tipos de media correspondientes (image, video)';

-- Crear un trigger para actualizar updated_at en comentarios
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();