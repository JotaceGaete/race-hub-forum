import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface MediaUpload {
  url: string;
  type: 'image' | 'video';
  file?: File; // For preview before upload
}

export const useMediaUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const uploadMedia = async (
    file: File,
    folder: string = 'comments'
  ): Promise<MediaUpload> => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const { data, error } = await supabase.functions.invoke('upload-media', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      return data as MediaUpload;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Error al subir el archivo');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultipleFiles = async (
    files: File[],
    folder: string = 'comments'
  ): Promise<MediaUpload[]> => {
    const uploads = await Promise.all(
      files.map(file => uploadMedia(file, folder))
    );
    return uploads;
  };

  return {
    uploadMedia,
    uploadMultipleMedia: uploadMultipleFiles,
    isUploading,
  };
};