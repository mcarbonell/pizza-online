
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { useEffect, useState } from 'react';

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
    // Check if the map instance is available before calling setView
    if (map) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}


export default function OrderTrackingMap({ latitude, longitude, orderId }: OrderTrackingMapProps) {
  const [mapResetKey, setMapResetKey] = useState(Date.now()); // Key to force re-render

  useEffect(() => {
    // When latitude or longitude changes, update the key to force a re-render of MapContainer
    // This ensures a fresh initialization if the props change significantly.
    // We use Date.now() to ensure a unique key.
    setMapResetKey(Date.now());
  }, [latitude, longitude]);

  if (typeof window === 'undefined') {
    return <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center"><p>Cargando mapa...</p></div>;
  }

  const position: LatLngExpression = [latitude, longitude];

  // Only render MapContainer if we have valid coordinates to prevent initial issues
  if (!latitude || !longitude) {
    return <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center"><p>Esperando ubicación del repartidor...</p></div>;
  }

  return (
    <MapContainer key={mapResetKey} center={position} zoom={16} style={{ height: '300px', width: '100%' }} className="rounded-md shadow-md my-4 z-0">
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

