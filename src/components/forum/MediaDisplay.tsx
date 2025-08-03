interface MediaDisplayProps {
  mediaUrls?: string[] | null;
  mediaTypes?: string[] | null;
}

export const MediaDisplay = ({ mediaUrls, mediaTypes }: MediaDisplayProps) => {
  if (!mediaUrls || !mediaTypes || mediaUrls.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {mediaUrls.map((url, index) => {
          const type = mediaTypes[index];
          
          if (type?.startsWith('image/')) {
            return (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full max-h-48 object-cover rounded-lg border border-border"
                  loading="lazy"
                />
              </div>
            );
          }
          
          if (type?.startsWith('video/')) {
            return (
              <div key={index} className="relative group">
                <video
                  src={url}
                  controls
                  className="w-full max-h-48 rounded-lg border border-border"
                  preload="metadata"
                >
                  Tu navegador no soporta el elemento video.
                </video>
              </div>
            );
          }
          
          return null;
        })}
      </div>
    </div>
  );
};