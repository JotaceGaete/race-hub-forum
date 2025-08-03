-- Actualizar perfiles existentes sin username
UPDATE public.profiles 
SET username = SPLIT_PART((SELECT email FROM auth.users WHERE id = profiles.user_id), '@', 1)
WHERE username IS NULL;