
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngExpression, type Map as LeafletMap } from 'leaflet';
import { useEffect, useState, useRef } from 'react';

const defaultIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface OrderTrackingMapProps {
  latitude: number;
  longitude: number;
  orderId?: string;
}

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
    setIsClient(true); // Ensures MapContainer renders only on client
  }, []);

  // Cleanup effect: runs when component unmounts or orderId changes
  useEffect(() => {
    // This function will be called when the component is unmounted
    // or when orderId changes (meaning the previous map instance needs cleanup)
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null; // Clear the ref
        console.log(`Leaflet map instance for order ${orderId || ''} EXPLICITLY REMOVED.`);
      }
    };
  }, [orderId]); // Key dependency: ensures cleanup for the specific order's map

  if (!isClient) {
    return <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center"><p>Cargando mapa...</p></div>;
  }
  
  if (!latitude || !longitude) {
    return <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center"><p>Esperando ubicación del repartidor...</p></div>;
  }
  
  const position: LatLngExpression = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={16}
      style={{ height: '300px', width: '100%' }}
      className="rounded-md shadow-md my-4 z-0"
      whenCreated={(mapInstance) => {
        // If there's an old map instance in the ref (e.g. from a HMR or race condition), remove it first
        if (mapInstanceRef.current && mapInstanceRef.current !== mapInstance) {
            mapInstanceRef.current.remove();
            console.log(`PRE-CLEANUP: Stale Leaflet map instance for order ${orderId || ''} removed before new creation.`);
        }
        mapInstanceRef.current = mapInstance;
        console.log(`Leaflet map instance for order ${orderId || ''} created and assigned to ref.`);
      }}
    >
      <ChangeView center={position} zoom={16} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={defaultIcon}>
        <Popup>
          {orderId ? `Repartidor del pedido #${orderId.substring(0,8)}...` : 'Ubicación del repartidor'}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

