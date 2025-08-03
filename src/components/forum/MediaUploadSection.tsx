import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Image, Video } from "lucide-react";
import { useMediaUpload, MediaUpload } from "@/hooks/useMediaUpload";
import { toast } from "sonner";

interface MediaUploadSectionProps {
  onMediaUploaded: (media: MediaUpload[]) => void;
  maxFiles?: number;
  folder?: string;
}

export const MediaUploadSection = ({ 
  onMediaUploaded, 
  maxFiles = 4,
  folder = 'comments' 
}: MediaUploadSectionProps) => {
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const { uploadMultipleMedia, isUploading } = useMediaUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate file count
    if (previewFiles.length + files.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.match(/^(image|video)\//);
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB

      if (!isValidType) {
        toast.error(`${file.name}: Solo se permiten imágenes y videos`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name}: El archivo es demasiado grande (máx. 50MB)`);
        return false;
      }

      return true;
    });

    setPreviewFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (previewFiles.length === 0) return;

    try {
      const uploadedMedia = await uploadMultipleMedia(previewFiles, folder);
      onMediaUploaded(uploadedMedia);
      setPreviewFiles([]);
      toast.success(`${uploadedMedia.length} archivo(s) subido(s) exitosamente`);
    } catch (error) {
      toast.error('Error al subir archivos');
    }
  };

  return (
    <div className="space-y-3">
      {/* File selector */}
      <div className="flex items-center gap-2">
        <Input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload"
          disabled={isUploading || previewFiles.length >= maxFiles}
        />
        <label 
          htmlFor="media-upload" 
          className="cursor-pointer"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading || previewFiles.length >= maxFiles}
            asChild
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Adjuntar media
            </span>
          </Button>
        </label>
        
        {previewFiles.length > 0 && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            size="sm"
          >
            {isUploading ? 'Subiendo...' : `Subir ${previewFiles.length} archivo(s)`}
          </Button>
        )}
      </div>

      {/* File previews */}
      {previewFiles.length > 0 && (
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium">Vista previa:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {previewFiles.map((file, index) => (
              <div key={index} className="relative group border border-border rounded-lg overflow-hidden">
                {file.type.startsWith('image/') ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-32 object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="p-2 bg-background/90">
                  <p className="text-xs truncate font-medium" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress/status */}
      {isUploading && (
        <div className="text-xs text-muted-foreground">
          Subiendo archivos, por favor espera...
        </div>
      )}
    </div>
  );
};