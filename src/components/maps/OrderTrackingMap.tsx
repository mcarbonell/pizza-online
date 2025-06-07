
'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import L, { type LatLngExpression, type Map as LeafletMap } from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

// Default Leaflet icon fix
const defaultIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon; // Set as default for all markers

interface SimplifiedOrderTrackingMapProps {
  mapId: string; // Unique ID to help with keying and cleanup
}

export default function OrderTrackingMap({ mapId }: SimplifiedOrderTrackingMapProps) {
  const [isClient, setIsClient] = useState(false);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const fixedPosition: LatLngExpression = [40.416775, -3.703790]; // Madrid

  useEffect(() => {
    setIsClient(true);
    // console.log(`OrderTrackingMap for ${mapId} MOUNTED, isClient set to true.`);
  }, [mapId]);

  // Cleanup effect: runs when component unmounts or mapId changes (if mapId prop changes)
  useEffect(() => {
    const currentMapInstance = mapInstanceRef.current;
    // console.log(`Cleanup effect for ${mapId} BEGINS. Current map instance:`, currentMapInstance);
    return () => {
      if (currentMapInstance) {
        // console.log(`Leaflet map instance for mapId ${mapId} CLEANUP - REMOVING...`);
        currentMapInstance.remove();
        // mapInstanceRef.current = null; // Avoid setting ref from cleanup of stale closure
        // console.log(`Leaflet map instance for mapId ${mapId} CLEANUP - REMOVED.`);
      } else {
        // console.log(`Leaflet map instance for mapId ${mapId} CLEANUP - No map instance to remove.`);
      }
    };
  }, [mapId]); // Re-run cleanup if mapId changes, ensuring old one is cleaned.

  if (!isClient) {
    return (
      <div className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center my-2">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
        <p className="ml-2 text-sm">Cargando mapa...</p>
      </div>
    );
  }

  // console.log(`Rendering MapContainer for mapId: ${mapId}`);
  return (
    <div style={{ height: '200px', width: '100%' }} className="my-2 rounded-md overflow-hidden shadow-md border">
      <MapContainer
        key={mapId} // Critical: Force re-render if mapId changes
        center={fixedPosition}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-0" // Ensure z-index is lower than other page elements if needed
        whenCreated={(mapInstance) => {
          // console.log(`Leaflet map instance for mapId ${mapId} CREATED.`);
          // If there's an old map instance in the ref from a previous render (e.g. HMR, or if key didn't fully prevent reuse)
          if (mapInstanceRef.current && mapInstanceRef.current !== mapInstance) {
            // console.warn(`PRE-CLEANUP: Stale Leaflet map instance for mapId ${mapId} being removed before assigning new one.`);
            mapInstanceRef.current.remove();
          }
          mapInstanceRef.current = mapInstance;
        }}
        preferCanvas={true} // May help with some rendering issues/performance
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
