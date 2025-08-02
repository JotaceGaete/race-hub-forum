-- Arreglar función de migración sin search_path específico
CREATE OR REPLACE FUNCTION migrate_past_races()
RETURNS void AS $$
DECLARE
    past_race_events RECORD;
    future_category_id uuid;
    past_category_id uuid;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO future_category_id FROM public.categories WHERE name = 'Próximas Carreras';
    SELECT id INTO past_category_id FROM public.categories WHERE name = 'Carreras Pasadas';
    
    -- Migrar carreras que ya pasaron
    FOR past_race_events IN 
        SELECT * FROM public.race_events 
        WHERE event_date < CURRENT_DATE
    LOOP
        -- Crear post en carreras pasadas
        INSERT INTO public.posts (title, content, category_id, author_name, user_id)
        VALUES (
            past_race_events.title || ' - ' || to_char(past_race_events.event_date, 'DD/MM/YYYY'),
            COALESCE(past_race_events.description, 'Carrera finalizada'),
            past_category_id,
            'Sistema',
            past_race_events.user_id
        );
        
        -- Migrar comentarios si existen posts relacionados
        UPDATE public.comments 
        SET post_id = (
            SELECT id FROM public.posts 
            WHERE title LIKE past_race_events.title || '%' 
            AND category_id = past_category_id 
            ORDER BY created_at DESC 
            LIMIT 1
        )
        WHERE post_id IN (
            SELECT id FROM public.posts 
            WHERE title LIKE past_race_events.title || '%' 
            AND category_id = future_category_id
        );
        
        -- Eliminar posts de próximas carreras
        DELETE FROM public.posts 
        WHERE title LIKE past_race_events.title || '%' 
        AND category_id = future_category_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;