
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngExpression, type Map as LeafletMap } from 'leaflet';
import { useEffect, useRef } from 'react';

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

// Component to update map view when position changes
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
  const mapRef = useRef<LeafletMap | null>(null);

  if (typeof window === 'undefined') {
    return <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center"><p>Cargando mapa...</p></div>;
  }

  // Only render MapContainer if we have valid coordinates
  if (!latitude || !longitude) {
    return <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center"><p>Esperando ubicación del repartidor...</p></div>;
  }
  
  const position: LatLngExpression = [latitude, longitude];

  // Effect for cleaning up the map instance on component unmount
  useEffect(() => {
    // This function will be called when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null; // Clear the ref
        console.log(`Leaflet map instance for order ${orderId || ''} removed.`);
      }
    };
  }, [orderId]); // Re-run cleanup if orderId changes, ensuring the old map is cleaned.

  return (
    <MapContainer
      center={position}
      zoom={16}
      style={{ height: '300px', width: '100%' }}
      className="rounded-md shadow-md my-4 z-0"
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
        console.log(`Leaflet map instance for order ${orderId || ''} created.`);
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
