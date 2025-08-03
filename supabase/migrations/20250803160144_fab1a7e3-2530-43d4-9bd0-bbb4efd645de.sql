-- Asignar rol de administrador al usuario jcgaete@hotmail.cl
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
    id, 
    'admin'::app_role, 
    id  -- Se asigna a sí mismo
FROM auth.users 
WHERE email = 'jcgaete@hotmail.cl'
ON CONFLICT (user_id, role) DO NOTHING;