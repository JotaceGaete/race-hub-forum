import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ImagePlus, MapPin, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useCanchas } from "@/hooks/useCanchas";
import { comunasChile } from "@/utils/comunasChile";
import { Link } from "react-router-dom";

interface RaceEventFormProps {
  onSubmit: (eventData: RaceEventData) => void;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export interface RaceEventData {
  title: string;
  description: string;
  event_date: Date;
  cancha_id?: string;
  image_urls?: string[];
}

export const RaceEventForm = ({ onSubmit, onCancel, initialData, isEditing = false }: RaceEventFormProps) => {
  const [formData, setFormData] = useState<RaceEventData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    event_date: initialData?.event_date ? new Date(initialData.event_date) : new Date(),
    cancha_id: initialData?.cancha_id || "",
    image_urls: initialData?.image_urls || []
  });
  const [selectedComuna, setSelectedComuna] = useState<string>(
    initialData?.cancha?.comuna || ""
  );
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    initialData?.image_urls || []
  );
  const { uploadImage, isUploading } = useImageUpload();
  const { canchas, getCanchasPorComuna } = useCanchas();

  const canchasEnComuna = selectedComuna ? getCanchasPorComuna(selectedComuna) : [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.slice(0, 5 - selectedImages.length);
    
    if (newFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrls: string[] = formData.image_urls || [];
      
      // Upload images if selected
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(image => 
          uploadImage(image, "race-images", "events")
        );
        imageUrls = await Promise.all(uploadPromises);
      }
      
      onSubmit({
        ...formData,
        image_urls: imageUrls
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      // Still submit without images if upload fails
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <div className="w-2 h-8 bg-gradient-race rounded"></div>
          {isEditing ? "Editar Carrera" : "Anunciar Nueva Carrera"}
        </CardTitle>
        <CardDescription>
          {isEditing ? "Modifica los detalles de tu evento" : "Comparte los detalles de tu próximo evento deportivo"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Evento *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Maratón Ciudad 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe tu evento, distancias disponibles, premios, etc."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha del Evento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.event_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.event_date ? (
                      format(formData.event_date, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.event_date}
                    onSelect={(date) => date && setFormData({ ...formData, event_date: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comuna">Comuna *</Label>
              <Select
                value={selectedComuna}
                onValueChange={(value) => {
                  setSelectedComuna(value);
                  setFormData({ ...formData, cancha_id: "" }); // Reset cancha when comuna changes
                }}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancha">Cancha *</Label>
            {selectedComuna ? (
              <>
                {canchasEnComuna.length > 0 ? (
                  <Select
                    value={formData.cancha_id}
                    onValueChange={(value) => setFormData({ ...formData, cancha_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una cancha" />
                    </SelectTrigger>
                    <SelectContent>
                      {canchasEnComuna.map((cancha) => (
                        <SelectItem key={cancha.id} value={cancha.id}>
                          {cancha.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-700 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">No hay canchas disponibles</span>
                    </div>
                    <p className="text-sm text-orange-600 mb-3">
                      No hay canchas registradas en {selectedComuna}. Si conoces una cancha en esta comuna, 
                      puedes solicitar que la agreguen al sistema.
                    </p>
                    <Link to="/solicitar-cancha">
                      <Button type="button" variant="outline" size="sm" className="text-orange-700 border-orange-300">
                        Solicitar Nueva Cancha
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Primero selecciona una comuna para ver las canchas disponibles.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Imágenes del Evento (hasta 5)</Label>
            <div className="space-y-4">
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedImages.length < 5 && (
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                    <ImagePlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Haz clic para subir imágenes del evento ({selectedImages.length}/5)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="submit" className="flex-1" disabled={isUploading}>
              {isUploading ? "Subiendo..." : (isEditing ? "Actualizar Carrera" : "Publicar Carrera")}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};