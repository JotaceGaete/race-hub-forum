-- Crear tabla de canchas
CREATE TABLE public.canchas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  comuna TEXT NOT NULL,
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  direccion TEXT,
  descripcion TEXT,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.canchas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - las canchas son públicas para lectura
CREATE POLICY "Las canchas son visibles para todos" 
ON public.canchas 
FOR SELECT 
USING (activa = true);

-- Solo admins pueden insertar/actualizar canchas (por ahora cualquier usuario autenticado puede hacerlo)
CREATE POLICY "Usuarios autenticados pueden crear canchas" 
ON public.canchas 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Crear tabla de solicitudes de canchas
CREATE TABLE public.solicitudes_canchas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_cancha TEXT NOT NULL,
  comuna TEXT NOT NULL,
  direccion_referencia TEXT,
  descripcion TEXT,
  contacto_nombre TEXT NOT NULL,
  contacto_email TEXT NOT NULL,
  contacto_telefono TEXT,
  user_id UUID REFERENCES auth.users(id),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  notas_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para solicitudes
ALTER TABLE public.solicitudes_canchas ENABLE ROW LEVEL SECURITY;

-- Políticas para solicitudes
CREATE POLICY "Las solicitudes son visibles para todos" 
ON public.solicitudes_canchas 
FOR SELECT 
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear solicitudes" 
ON public.solicitudes_canchas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias solicitudes" 
ON public.solicitudes_canchas 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Agregar trigger para actualizar updated_at
CREATE TRIGGER update_canchas_updated_at
  BEFORE UPDATE ON public.canchas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solicitudes_canchas_updated_at
  BEFORE UPDATE ON public.solicitudes_canchas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Modificar tabla race_events para usar cancha_id en lugar de location
ALTER TABLE public.race_events 
ADD COLUMN cancha_id UUID REFERENCES public.canchas(id);

-- Insertar algunas canchas de ejemplo para Chile
INSERT INTO public.canchas (nombre, comuna, latitud, longitud, direccion, descripcion) VALUES
('Cancha Municipal de Santiago', 'Santiago', -33.4489, -70.6693, 'Centro de Santiago', 'Cancha principal de la comuna'),
('Hipódromo de Valparaíso', 'Valparaíso', -33.0472, -71.6127, 'Sector Puerto', 'Hipódromo histórico del puerto'),
('Campo de Carreras Maipú', 'Maipú', -33.5081, -70.7581, 'Zona rural Maipú', 'Campo tradicional de carreras'),
('Cancha Los Andes', 'Los Andes', -32.8333, -70.6000, 'Entrada Los Andes', 'Cancha regional andina'),
('Hipódromo de Concepción', 'Concepción', -36.8201, -73.0444, 'Barrio universitario', 'Principal cancha del sur');