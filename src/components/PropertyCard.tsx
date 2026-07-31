import React, { useState } from 'react';
import { Property } from '../types';
import { formatCLP, formatUF } from '../services/ufService';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  MessageCircle,
  Eye,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Tag
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onScheduleVisit: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onScheduleVisit
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const waMessage = `Me interesa esta propiedad, quisiera más información al respecto: ${property.title} (Ref: ${property.id})`;
  const waUrl = `https://wa.me/56974747910?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Top Image Box */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={property.images[currentImageIndex] || property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"></div>

        {/* Top Badges - Geometric & Crisp */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
            property.operation === 'Venta' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-white'
          }`}>
            {property.operation}
          </span>
          <span className="px-2.5 py-1 rounded text-[10px] font-medium bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm font-semibold">
            {property.type}
          </span>
          {property.isProject && (
            <span className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" /> Proyecto
            </span>
          )}
        </div>

        {/* Status Badge Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
            property.status === 'Disponible' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {property.status}
          </span>
        </div>

        {/* Image Nav Arrows */}
        {property.images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={prevImage}
              className="p-1 rounded bg-slate-900/80 text-white hover:bg-sky-600 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="p-1 rounded bg-slate-900/80 text-white hover:bg-sky-600 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10 text-white">
          <div>
            <div className="text-xl font-black font-mono tracking-tight drop-shadow">
              {formatUF(property.priceUF)}
              {property.operation === 'Arriendo' && <span className="text-xs font-normal">/mes</span>}
            </div>
            <div className="text-xs text-slate-200 font-medium">
              ~ {formatCLP(property.priceCLP)}
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-200 bg-slate-900/70 px-2 py-0.5 rounded border border-slate-700">
            {property.id}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex flex-col justify-between flex-grow space-y-4">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-sky-700 font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-sky-600" />
            <span className="truncate">{property.comuna}, {property.region.replace('Región de ', '').replace('Región ', '')}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(property)}
            className="text-base font-bold text-slate-900 hover:text-sky-600 cursor-pointer transition-colors line-clamp-2 leading-snug mb-3"
          >
            {property.title}
          </h3>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 mb-3">
            {property.bedrooms > 0 ? (
              <div className="flex items-center gap-1.5" title="Dormitorios">
                <Bed className="w-3.5 h-3.5 text-sky-600" />
                <span><strong className="text-slate-900">{property.bedrooms}</strong> Hab.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5" title="Categoría">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                <span>{property.type}</span>
              </div>
            )}

            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1.5" title="Baños">
                <Bath className="w-3.5 h-3.5 text-sky-600" />
                <span><strong className="text-slate-900">{property.bathrooms}</strong> Baños</span>
              </div>
            )}

            <div className="flex items-center gap-1.5" title="Superficie Útil">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
              <span><strong className="text-slate-900">{property.surfaceBuilt || property.surfaceTotal}</strong> m²</span>
            </div>
          </div>

          {/* Features Pills */}
          <div className="flex flex-wrap gap-1">
            {property.features.slice(0, 3).map((feat, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded border border-slate-200"
              >
                {feat}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                +{property.features.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            title="Solicitar detalles por WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Consultar por WhatsApp</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelect(property)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              <span>Ver Ficha</span>
            </button>
            <button
              onClick={() => onScheduleVisit(property)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Agendar Cita</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
