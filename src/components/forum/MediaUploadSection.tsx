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
        <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
          {previewFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="flex items-center gap-2 p-2 bg-background rounded border">
                {file.type.startsWith('image/') ? (
                  <Image className="w-4 h-4 text-blue-500" />
                ) : (
                  <Video className="w-4 h-4 text-purple-500" />
                )}
                <span className="text-xs truncate flex-1" title={file.name}>
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
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