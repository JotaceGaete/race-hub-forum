-- Crear categoría para Carreras Pasadas
INSERT INTO categories (name, description, color) 
VALUES ('Carreras Pasadas', 'Archivos de carreras que ya ocurrieron', '#6B7280');

-- Crear función para migrar carreras automáticamente
CREATE OR REPLACE FUNCTION migrate_past_races()
RETURNS void AS $$
DECLARE
    past_race_events RECORD;
    future_category_id uuid;
    past_category_id uuid;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO future_category_id FROM categories WHERE name = 'Próximas Carreras';
    SELECT id INTO past_category_id FROM categories WHERE name = 'Carreras Pasadas';
    
    -- Migrar carreras que ya pasaron
    FOR past_race_events IN 
        SELECT * FROM race_events 
        WHERE event_date < CURRENT_DATE
    LOOP
        -- Crear post en carreras pasadas
        INSERT INTO posts (title, content, category_id, author_name, user_id)
        VALUES (
            past_race_events.title || ' - ' || to_char(past_race_events.event_date, 'DD/MM/YYYY'),
            COALESCE(past_race_events.description, 'Carrera finalizada'),
            past_category_id,
            'Sistema',
            past_race_events.user_id
        );
        
        -- Migrar comentarios si existen posts relacionados
        UPDATE comments 
        SET post_id = (
            SELECT id FROM posts 
            WHERE title LIKE past_race_events.title || '%' 
            AND category_id = past_category_id 
            ORDER BY created_at DESC 
            LIMIT 1
        )
        WHERE post_id IN (
            SELECT id FROM posts 
            WHERE title LIKE past_race_events.title || '%' 
            AND category_id = future_category_id
        );
        
        -- Eliminar posts de próximas carreras
        DELETE FROM posts 
        WHERE title LIKE past_race_events.title || '%' 
        AND category_id = future_category_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Crear función para crear posts automáticamente cuando se crea una carrera
CREATE OR REPLACE FUNCTION create_race_post()
RETURNS trigger AS $$
DECLARE
    category_id uuid;
    cancha_info text;
BEGIN
    -- Obtener ID de categoría de próximas carreras
    SELECT id INTO category_id FROM categories WHERE name = 'Próximas Carreras';
    
    -- Obtener info de la cancha si existe
    IF NEW.cancha_id IS NOT NULL THEN
        SELECT CONCAT(nombre, ' - ', comuna) INTO cancha_info 
        FROM canchas WHERE id = NEW.cancha_id;
    ELSE
        cancha_info := COALESCE(NEW.location, 'Ubicación por confirmar');
    END IF;
    
    -- Crear post automáticamente
    INSERT INTO posts (title, content, category_id, author_name, user_id)
    VALUES (
        NEW.title || ' - ' || to_char(NEW.event_date, 'DD/MM/YYYY'),
        COALESCE(NEW.description, '') || E'\n\n📍 Ubicación: ' || cancha_info || E'\n📅 Fecha: ' || to_char(NEW.event_date, 'DD "de" Month "de" YYYY'),
        category_id,
        'Sistema',
        NEW.user_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear trigger para crear posts automáticamente
CREATE TRIGGER race_event_post_trigger
    AFTER INSERT ON race_events
    FOR EACH ROW
    EXECUTE FUNCTION create_race_post();

-- Ejecutar migración inicial
SELECT migrate_past_races();