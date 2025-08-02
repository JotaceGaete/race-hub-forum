-- Agregar columna para múltiples imágenes
ALTER TABLE public.race_events ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Migrar datos existentes de image_url a image_urls
UPDATE public.race_events 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' THEN ARRAY[image_url]
  ELSE NULL
END
WHERE image_urls IS NULL;