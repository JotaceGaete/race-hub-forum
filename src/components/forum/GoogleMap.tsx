import { useEffect, useRef } from 'react';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
}

export const GoogleMap = ({ latitude, longitude, zoom = 15, height = "300px" }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Crear iframe de Google Maps
    const mapUrl = `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${latitude},${longitude}&zoom=${zoom}`;
    
    mapRef.current.innerHTML = `
      <iframe
        width="100%"
        height="${height}"
        style="border:0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        src="${mapUrl}">
      </iframe>
    `;
  }, [latitude, longitude, zoom, height]);

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-lg overflow-hidden"
      style={{ height }}
    />
  );
};