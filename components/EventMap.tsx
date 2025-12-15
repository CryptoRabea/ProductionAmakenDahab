import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { Event } from '../types';
import { Link } from 'react-router-dom';

interface EventMapProps {
  events: Event[];
  center?: { lat: number, lng: number };
  zoom?: number;
}

const EventMap: React.FC<EventMapProps> = ({ events, center = { lat: 28.5097, lng: 34.5136 }, zoom = 13 }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Fix icon issues
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    } else {
       // Update View if center changes
       mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    // Add Markers
    events.forEach(event => {
      if (event.coordinates) {
        const marker = L.marker([event.coordinates.lat, event.coordinates.lng])
          .addTo(mapInstanceRef.current!)
          .bindPopup(`
            <div class="font-sans">
              <div class="h-24 w-full overflow-hidden rounded-t-lg relative">
                <img src="${event.imageUrl}" class="object-cover w-full h-full" />
                <span class="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold uppercase">${event.category}</span>
              </div>
              <div class="p-3">
                <h3 class="font-bold text-sm mb-1 line-clamp-1">${event.title}</h3>
                <p class="text-xs text-gray-500 mb-2">${event.location}</p>
                <a href="#/book/event/${event.id}" class="block text-center bg-teal-600 text-white text-xs font-bold py-1.5 rounded hover:bg-teal-700">
                  Book • ${event.price} EGP
                </a>
              </div>
            </div>
          `);
      }
    });

    // Cleanup to prevent map initialization errors on remount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events, center, zoom]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-2xl z-0" />;
};

export default EventMap;