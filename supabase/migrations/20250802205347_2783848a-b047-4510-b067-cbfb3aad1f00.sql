-- Verificar y crear posts manualmente para carreras futuras
DO $$
DECLARE
    race_record RECORD;
    category_id uuid;
    cancha_info text;
BEGIN
    -- Obtener ID de categoría
    SELECT id INTO category_id FROM categories WHERE name = 'Próximas Carreras';
    
    FOR race_record IN 
        SELECT * FROM race_events WHERE event_date >= CURRENT_DATE
    LOOP
        -- Obtener info de cancha
        IF race_record.cancha_id IS NOT NULL THEN
            SELECT CONCAT(nombre, ' - ', comuna) INTO cancha_info 
            FROM canchas WHERE id = race_record.cancha_id;
        ELSE
            cancha_info := COALESCE(race_record.location, 'Ubicación por confirmar');
        END IF;
        
        -- Insertar post si no existe
        INSERT INTO posts (title, content, category_id, author_name, user_id)
        VALUES (
            race_record.title || ' - ' || to_char(race_record.event_date, 'DD/MM/YYYY'),
            COALESCE(race_record.description, '') || E'\n\n📍 Ubicación: ' || cancha_info || E'\n📅 Fecha: ' || to_char(race_record.event_date, 'DD "de" Month "de" YYYY'),
            category_id,
            'Sistema',
            race_record.user_id
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Procesado evento: %', race_record.title;
    END LOOP;
END $$;