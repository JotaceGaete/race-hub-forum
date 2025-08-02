import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const uploadImage = async (
    file: File,
    bucket: "race-images" | "avatars",
    folder?: string
  ): Promise<string> => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder ? folder + '/' : ''}${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
  };
};