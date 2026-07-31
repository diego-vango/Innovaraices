import React, { useEffect, useRef } from 'react';
import { Property } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Building2, MapPin, ExternalLink, MessageCircle } from 'lucide-react';

interface InteractiveMapProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  selectedPropertyId?: string;
  heightClass?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  onSelectProperty,
  selectedPropertyId,
  heightClass = 'h-[550px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicializar mapa si no existe
    if (!mapInstanceRef.current) {
      // Centro por defecto: Chile (Santiago)
      const map = L.map(mapContainerRef.current, {
        center: [-33.4372, -70.6506],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Añadir capa de azulejos (OpenStreetMap limpia)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Limpiar marcadores anteriores
    (Object.values(markersRef.current) as L.Marker[]).forEach(marker => marker.remove());
    markersRef.current = {};

    if (properties.length === 0) return;

    const bounds = L.latLngBounds([]);

    properties.forEach(prop => {
      if (!prop.lat || !prop.lng) return;

      const isSelected = selectedPropertyId === prop.id;

      // Crear icono de marcador estilo inmobiliario (Tag de precio)
      const priceText = prop.operation === 'Arriendo' ? `${prop.priceUF} UF` : `${prop.priceUF.toLocaleString('es-CL')} UF`;
      const bgClass = isSelected ? 'bg-emerald-600 text-white scale-110 z-50' : 'bg-slate-900 text-white hover:bg-blue-600 hover:scale-105';

      const customHtml = `
        <div class="px-2.5 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1 transition-all cursor-pointer ${bgClass}">
          <span>${priceText}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-map-pin',
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const marker = L.marker([prop.lat, prop.lng], { icon: customIcon }).addTo(map);

      // Popup de preview
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-slate-800 max-w-[240px]';
      popupContent.innerHTML = `
        <div style="font-family: inherit;">
          <img src="${prop.images[0]}" alt="${prop.title}" class="w-full h-28 object-cover rounded-lg mb-2" />
          <div class="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-0.5">${prop.operation} • ${prop.type}</div>
          <h4 class="font-bold text-xs line-clamp-2 leading-tight text-slate-900 mb-1">${prop.title}</h4>
          <div class="text-sm font-extrabold text-slate-900 mb-1">
            ${prop.priceUF.toLocaleString('es-CL')} UF 
            <span class="text-[10px] text-slate-500 font-normal">($${prop.priceCLP.toLocaleString('es-CL')})</span>
          </div>
          <div class="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
            📍 ${prop.comuna}, ${prop.region.replace('Región de ', '').replace('Región ', '')}
          </div>
          <div class="flex gap-1.5 pt-1 border-t border-slate-100">
            <button id="btn-view-${prop.id}" class="flex-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2 rounded-md text-center">
              Ver Ficha
            </button>
            <a href="https://wa.me/56912345678?text=${encodeURIComponent(`Me interesa esta propiedad, quisiera más información al respecto: ${prop.title} (${prop.id})`)}" target="_blank" class="text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-md flex items-center justify-center">
              💬
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btnView = document.getElementById(`btn-view-${prop.id}`);
        if (btnView) {
          btnView.onclick = () => onSelectProperty(prop);
        }
      });

      marker.on('click', () => {
        onSelectProperty(prop);
      });

      markersRef.current[prop.id] = marker;
      bounds.extend([prop.lat, prop.lng]);
    });

    // Ajustar vista a las propiedades si hay resultados
    if (properties.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    // Forzar redibujado de dimensiones
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [properties, selectedPropertyId]);

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Info Overlay */}
      <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 font-semibold flex items-center gap-2 shadow-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <span>{properties.length} ubicadas en mapa</span>
      </div>
    </div>
  );
};
