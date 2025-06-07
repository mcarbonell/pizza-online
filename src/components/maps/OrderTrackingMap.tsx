
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngExpression, type Map as LeafletMap } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

const defaultIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface OrderTrackingMapProps {
  latitude: number;
  longitude: number;
  orderId: string; // Used for keying and cleanup context
}

// Component to handle map view changes
function ChangeView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
        map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}

export default function OrderTrackingMap({ latitude, longitude, orderId }: OrderTrackingMapProps) {
  const [isClient, setIsClient] = useState(false);
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup effect: runs when component unmounts or orderId changes
  useEffect(() => {
    const mapToClean = mapInstanceRef.current;
    // console.log(`Effect for orderId: ${orderId}. Current map instance: ${mapToClean ? mapToClean['_leaflet_id'] : 'null'}`);
    return () => {
      if (mapToClean) {
        // console.log(`Cleaning up map for orderId: ${orderId} (Instance: ${mapToClean['_leaflet_id']})`);
        mapToClean.remove();
        // Avoid setting mapInstanceRef.current to null here if the ref instance might be shared or re-used by React in a way
        // that another effect or render cycle expects it. The key on the parent should handle new instances.
        // If this specific instance of the component is being unmounted, its ref will be naturally garbage collected if not needed.
      }
    };
  }, [orderId]); // Depend on orderId to re-run cleanup if it changes for *this instance*

  if (!isClient) {
    return (
      <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center my-4">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="ml-2">Cargando mapa...</p>
      </div>
    );
  }

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return (
      <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center my-4">
        <p className="text-muted-foreground">Esperando ubicación del repartidor...</p>
      </div>
    );
  }

  const position: LatLngExpression = [latitude, longitude];

  return (
    <MapContainer
      // The key for MapContainer itself is usually not needed if the parent OrderTrackingMap component has a key that changes
      // when a completely new map instance is required (e.g. for a different order).
      center={position}
      zoom={16}
      style={{ height: '300px', width: '100%' }}
      className="rounded-md shadow-md my-4 z-0"
      whenCreated={(mapInstance) => {
        // console.log(`Map CREATED for orderId: ${orderId} (Instance: ${mapInstance['_leaflet_id']})`);
        // If there's an old map instance in the ref from a previous render of THIS component instance
        // (which might happen with HMR or complex React re-renders), remove it before assigning the new one.
        if (mapInstanceRef.current && mapInstanceRef.current !== mapInstance && mapInstanceRef.current.remove) {
             // console.warn(`Stale map instance in ref for ${orderId} during creation, removing old one.`);
             mapInstanceRef.current.remove();
        }
        mapInstanceRef.current = mapInstance;
      }}
      preferCanvas={true} // May help with performance/rendering issues
    >
      <ChangeView center={position} zoom={16} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Ubicación del repartidor</Popup>
      </Marker>
    </MapContainer>
  );
}
