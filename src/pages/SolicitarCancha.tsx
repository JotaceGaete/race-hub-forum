import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Send } from "lucide-react";
import { useCanchas } from "@/hooks/useCanchas";
import { useAuth } from "@/hooks/useAuth";
import { comunasChile } from "@/utils/comunasChile";
import { useNavigate } from "react-router-dom";

const SolicitarCancha = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { createSolicitud, isCreatingSolicitud } = useCanchas();
  
  const [formData, setFormData] = useState({
    nombre_cancha: "",
    comuna: "",
    direccion_referencia: "",
    descripcion: "",
    contacto_nombre: user?.full_name || "",
    contacto_email: user?.email || "",
    contacto_telefono: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      return;
    }

    try {
      await createSolicitud({
        ...formData,
        user_id: user?.id,
      });
      
      // Limpiar formulario
      setFormData({
        nombre_cancha: "",
        comuna: "",
        direccion_referencia: "",
        descripcion: "",
        contacto_nombre: user?.full_name || "",
        contacto_email: user?.email || "",
        contacto_telefono: "",
      });
      
      // Navegar de vuelta
      navigate("/");
    } catch (error) {
      console.error("Error al crear solicitud:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>
              Debes iniciar sesión para solicitar una nueva cancha.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-race rounded"></div>
            Solicitar Nueva Cancha
          </CardTitle>
          <CardDescription>
            Complete el formulario para solicitar el alta de una nueva cancha de carreras.
            Nuestro equipo revisará su solicitud y se pondrá en contacto con usted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre_cancha">Nombre de la Cancha *</Label>
              <Input
                id="nombre_cancha"
                value={formData.nombre_cancha}
                onChange={(e) => setFormData({ ...formData, nombre_cancha: e.target.value })}
                placeholder="Ej: Cancha Los Nogales"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comuna">Comuna *</Label>
              <Select
                value={formData.comuna}
                onValueChange={(value) => setFormData({ ...formData, comuna: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una comuna" />
                </SelectTrigger>
                <SelectContent>
                  {comunasChile.map((comuna) => (
                    <SelectItem key={comuna} value={comuna}>
                      {comuna}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion_referencia">Dirección de Referencia</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="direccion_referencia"
                  value={formData.direccion_referencia}
                  onChange={(e) => setFormData({ ...formData, direccion_referencia: e.target.value })}
                  placeholder="Ej: Km 15 Ruta 5 Sur, frente a la estación de servicio"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción Adicional</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Información adicional sobre la cancha, características especiales, etc."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contacto_nombre">Nombre de Contacto *</Label>
                <Input
                  id="contacto_nombre"
                  value={formData.contacto_nombre}
                  onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                  placeholder="Su nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contacto_email">Email de Contacto *</Label>
                <Input
                  id="contacto_email"
                  type="email"
                  value={formData.contacto_email}
                  onChange={(e) => setFormData({ ...formData, contacto_email: e.target.value })}
                  placeholder="su@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contacto_telefono">Teléfono de Contacto</Label>
              <Input
                id="contacto_telefono"
                value={formData.contacto_telefono}
                onChange={(e) => setFormData({ ...formData, contacto_telefono: e.target.value })}
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div className="flex gap-3 pt-6">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isCreatingSolicitud}
              >
                <Send className="w-4 h-4 mr-2" />
                {isCreatingSolicitud ? "Enviando..." : "Enviar Solicitud"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolicitarCancha;