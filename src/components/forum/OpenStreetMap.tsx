import { useEffect, useRef } from "react";

interface OpenStreetMapProps {
  latitude: number;
  longitude: number;
  location: string;
  className?: string;
}

export const OpenStreetMap = ({ latitude, longitude, location, className = "" }: OpenStreetMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous map content
    mapRef.current.innerHTML = '';

    // Create iframe with OpenStreetMap embed
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '300';
    iframe.style.border = '0';
    iframe.style.borderRadius = '8px';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    
    // OpenStreetMap embed URL
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01}%2C${latitude-0.01}%2C${longitude+0.01}%2C${latitude+0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;
    iframe.src = mapUrl;

    mapRef.current.appendChild(iframe);

    // Add a link to open in OpenStreetMap
    const linkDiv = document.createElement('div');
    linkDiv.className = 'mt-2 text-center';
    linkDiv.innerHTML = `
      <a 
        href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}" 
        target="_blank" 
        rel="noopener noreferrer"
        class="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Ver mapa más grande en OpenStreetMap
      </a>
    `;
    mapRef.current.appendChild(linkDiv);

  }, [latitude, longitude]);

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          📍 Ubicación: {location}
        </h3>
        <p className="text-sm text-muted-foreground">
          Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      </div>
      <div ref={mapRef} className="w-full h-[300px] bg-muted rounded-lg"></div>
    </div>
  );
};