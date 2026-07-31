import React, { useState } from 'react';
import { Property } from '../types';
import { formatCLP, formatUF, FALLBACK_UF_RATE } from '../services/ufService';
import {
  X,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  MessageCircle,
  Calendar,
  Phone,
  Mail,
  Video,
  Calculator,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onScheduleVisit: (property: Property) => void;
  ufRate?: number;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  onClose,
  onScheduleVisit,
  ufRate = FALLBACK_UF_RATE
}) => {
  if (!property) return null;

  const [activeImage, setActiveImage] = useState(0);

  // Mortgage Calculator State
  const [piePercent, setPiePercent] = useState(20); // 20% Pie
  const [years, setYears] = useState(25); // 25 años
  const [interestRate, setInterestRate] = useState(4.8); // 4.8% tasa anual

  // Dividendo mensual calculation
  const totalUF = property.priceUF;
  const loanUF = totalUF * (1 - piePercent / 100);
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = years * 12;
  const monthlyUF = (loanUF * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const monthlyCLP = monthlyUF * ufRate;

  const waMessage = `Me interesa esta propiedad, quisiera más información al respecto: ${property.title} (Ref: ${property.id})`;
  const waUrl = `https://wa.me/56974747910?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-sky-600 text-white rounded">
              {property.operation} • {property.type}
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">Ref: {property.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Consultar por WhatsApp</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-grow">
          {/* Title and Price */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-sky-700 font-bold mb-1">
                <MapPin className="w-4 h-4" />
                <span>{property.address}, {property.comuna}, {property.region}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {property.title}
              </h2>
            </div>

            <div className="text-left md:text-right bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                {formatUF(property.priceUF)}
              </div>
              <div className="text-xs font-semibold text-sky-700">
                {formatCLP(property.priceUF * ufRate)} CLP
              </div>
              {property.expensesCLP && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Gastos Comunes: {formatCLP(property.expensesCLP)}
                </div>
              )}
            </div>
          </div>

          {/* Gallery & Video */}
          <div className="space-y-3">
            <div className="aspect-[16/9] max-h-[420px] rounded-xl overflow-hidden bg-slate-900 relative">
              <img
                src={property.images[activeImage] || property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === idx ? 'border-sky-600 ring-2 ring-sky-600/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
            {property.bedrooms > 0 && (
              <div>
                <div className="text-xs text-slate-500">Dormitorios</div>
                <div className="text-base font-bold flex items-center gap-2">
                  <Bed className="w-4 h-4 text-sky-600" /> {property.bedrooms} Hab.
                </div>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div>
                <div className="text-xs text-slate-500">Baños</div>
                <div className="text-base font-bold flex items-center gap-2">
                  <Bath className="w-4 h-4 text-sky-600" /> {property.bathrooms} Baños
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-slate-500">Superficie Útil</div>
              <div className="text-base font-bold flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-emerald-600" /> {property.surfaceBuilt} m²
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Superficie Total</div>
              <div className="text-base font-bold flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-sky-600" /> {property.surfaceTotal} m²
              </div>
            </div>
          </div>

          {/* Description & Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                Descripción de la Propiedad
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>

              <h4 className="text-base font-bold text-slate-900 pt-2">Equipamiento & Características</h4>
              <div className="grid grid-cols-2 gap-2">
                {property.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {property.videoUrl && (
                <div className="pt-4 space-y-2">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-sky-600" /> Tour Virtual / Video
                  </h4>
                  <div className="aspect-video rounded-xl overflow-hidden border border-slate-200">
                    <iframe
                      src={property.videoUrl}
                      title="Tour Virtual"
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Agent & Mortgage Calculator */}
            <div className="space-y-6">
              {/* Agent Card */}
              {property.agent && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold uppercase text-sky-700 tracking-wider">Asesor Asignado</div>
                  <div className="flex items-center gap-3">
                    <img src={property.agent.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{property.agent.name}</div>
                      <div className="text-xs text-slate-500">{property.agent.role}</div>
                    </div>
                  </div>
                  <div className="pt-2 space-y-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> Contactar Asesor
                    </a>
                    <button
                      onClick={() => onScheduleVisit(property)}
                      className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs rounded-lg flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" /> Agendar Cita
                    </button>
                  </div>
                </div>
              )}

              {/* Mortgage Calculator */}
              <div className="p-5 bg-slate-900 text-white rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Calculator className="w-4 h-4 text-sky-400" />
                  <h4 className="font-bold text-sm">Simulador Hipotecario</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Pie Inicial ({piePercent}%):</label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={piePercent}
                      onChange={(e) => setPiePercent(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Plazo ({years} años):</label>
                    <select
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white"
                    >
                      <option value="15">15 años</option>
                      <option value="20">20 años</option>
                      <option value="25">25 años</option>
                      <option value="30">30 años</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-center space-y-1">
                    <div className="text-[11px] text-slate-400">Dividendo Referencial Estimado:</div>
                    <div className="text-xl font-black font-mono text-sky-400">
                      {formatUF(Math.round(monthlyUF * 10) / 10)} /mes
                    </div>
                    <div className="text-xs font-bold text-slate-300">
                      ~ {formatCLP(monthlyCLP)} /mes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
