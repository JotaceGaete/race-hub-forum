-- Crear posts para carreras futuras existentes
INSERT INTO posts (title, content, category_id, author_name, user_id)
SELECT 
    re.title || ' - ' || to_char(re.event_date, 'DD/MM/YYYY'),
    COALESCE(re.description, '') || E'\n\n📍 Ubicación: ' || 
    CASE 
        WHEN re.cancha_id IS NOT NULL THEN 
            COALESCE((SELECT nombre || ' - ' || comuna FROM canchas WHERE id = re.cancha_id), 'Cancha no encontrada')
        ELSE 
            COALESCE(re.location, 'Ubicación por confirmar')
    END || E'\n📅 Fecha: ' || to_char(re.event_date, 'DD "de" Month "de" YYYY'),
    (SELECT id FROM categories WHERE name = 'Próximas Carreras'),
    'Sistema',
    re.user_id
FROM race_events re
WHERE re.event_date >= CURRENT_DATE
AND NOT EXISTS (
    SELECT 1 FROM posts p 
    WHERE p.title LIKE re.title || '%' 
    AND p.category_id = (SELECT id FROM categories WHERE name = 'Próximas Carreras')
);

-- Configurar cron job para migrar carreras automáticamente todos los días a las 00:01
SELECT cron.schedule(
    'migrate-past-races-daily',
    '1 0 * * *', -- Todos los días a las 00:01
    $$
    SELECT net.http_post(
        url:='https://xypqryddhrxepcwkxutu.supabase.co/functions/v1/migrate-past-races',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cHFyeWRkaHJ4ZXBjd2t4dXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjIzOTAsImV4cCI6MjA2OTczODM5MH0.k3OaZZX80ZOQGDFMYwbiLggYkYpYUMpz82yDHaR2MJ0"}'::jsonb
    ) as request_id;
    $$
);