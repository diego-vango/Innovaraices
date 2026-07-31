import React from 'react';
import { Property, ActiveTab } from '../types';
import { PropertyCard } from './PropertyCard';
import { formatCLP, formatUF } from '../services/ufService';
import {
  Building2,
  Search,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Calendar,
  MessageCircle,
  ArrowRight,
  Compass,
  CheckCircle2,
  Camera,
  MapPin,
  Award
} from 'lucide-react';

interface HomeHeroProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onScheduleVisit: (property: Property) => void;
  setActiveTab: (tab: ActiveTab) => void;
  ufRate: number;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  properties,
  onSelectProperty,
  onScheduleVisit,
  setActiveTab,
  ufRate
}) => {
  const featured = properties.filter(p => p.featured).slice(0, 6);
  const projects = properties.filter(p => p.isProject).slice(0, 3);

  return (
    <div className="space-y-12 py-4">
      {/* Hero Header Section - Geometric & Elegant Light Theme */}
      <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden p-8 sm:p-12 shadow-sm">
        {/* Background Image Overlay with Soft Opacity */}
        <div className="absolute inset-0 z-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-sky-600" /> Corredora Inmobiliaria Multiregional
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Encuentra tu propiedad o inversión ideal con <span className="text-sky-600">Innova Raíces</span>
          </h1>

          <p className="text-slate-600 text-base leading-relaxed">
            Explora un catálogo actualizado de propiedades exclusivas en Santiago, Viña del Mar, Concepción, Puerto Varas y La Serena. Asesoría inmobiliaria experta y atención directa por WhatsApp.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('propiedades')}
              className="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Ver Catálogo con Mapa Interactivo</span>
            </button>

            <button
              onClick={() => setActiveTab('agendar')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Agendar Cita Virtual</span>
            </button>
          </div>

          {/* Real-time UF Indicator Badge */}
          <div className="pt-4 flex items-center gap-3 text-xs text-slate-500 border-t border-slate-100 font-mono">
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200">
              UF HOY: {formatCLP(ufRate)}
            </span>
            <span>Precios calculados con valor oficial del día en tiempo real</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Row - Clean Geometric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 bg-white border border-slate-200 rounded-xl text-center space-y-1 shadow-sm">
          <div className="text-3xl font-black text-sky-600 font-mono">30+</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Propiedades Exclusivas</div>
          <p className="text-[11px] text-slate-500">Casas, Deptos & Terrenos</p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl text-center space-y-1 shadow-sm">
          <div className="text-3xl font-black text-slate-800 font-mono">6</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Regiones de Chile</div>
          <p className="text-[11px] text-slate-500">Cobertura Nacional</p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl text-center space-y-1 shadow-sm">
          <div className="text-3xl font-black text-emerald-600 font-mono">100%</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tours & Fotos HD</div>
          <p className="text-[11px] text-slate-500">Información Verificada</p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl text-center space-y-1 shadow-sm">
          <div className="text-xl sm:text-2xl font-black text-sky-600 font-mono">Atención Directa</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Canal WhatsApp</div>
          <p className="text-[11px] text-slate-500">Asesoría Personalizada</p>
        </div>
      </div>

      {/* Featured Properties Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
              <TrendingUp className="w-4 h-4" /> Selección Exclusiva
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Propiedades Destacadas
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('propiedades')}
            className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-wider"
          >
            <span>Ver catálogo completo ({properties.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
              onScheduleVisit={onScheduleVisit}
            />
          ))}
        </div>
      </div>

      {/* Upcoming Real Estate Developments */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 text-white shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="px-3 py-1 rounded text-xs font-bold bg-sky-600 text-white uppercase tracking-wider mb-2 inline-block">
              Desarrollos Inmobiliarios
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Proyectos Nuevos en Verde y Blancos
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Invierte con plusvalía garantizada en las mejores comunas del país.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('proyectos')}
            className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all"
          >
            Explorar Proyectos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map(p => (
            <div
              key={p.id}
              onClick={() => onSelectProperty(p)}
              className="group bg-slate-950 border border-slate-800 hover:border-sky-500 rounded-xl overflow-hidden cursor-pointer transition-all shadow-sm"
            >
              <div className="relative aspect-video">
                <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-sky-600 text-white text-[10px] font-bold">
                  {p.projectDeliveryDate}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-[11px] font-bold text-sky-400">{p.comuna}, {p.region}</div>
                <h4 className="font-bold text-white text-sm line-clamp-1">{p.title}</h4>
                <div className="text-sm font-extrabold text-white font-mono">
                  Desde {formatUF(p.priceUF)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Innova Raíces - Client-facing value proposition */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 space-y-8 shadow-sm">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">¿Por Qué Elegir Innova Raíces?</h2>
          <p className="text-slate-500 text-sm">
            Ofrecemos un servicio de corretaje y asesoría inmobiliaria de estándar superior en Chile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Fotografía HD & Tours Virtuales</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada propiedad cuenta con fotografías de alta definición y la opción de realizar recorridos virtuales guiados en tiempo real con un asesor.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Atención Inmediata por WhatsApp</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conectamos cada ficha de propiedad con el asesor asignado para resolver tus dudas de precio, visitas y financiamiento al instante.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Asesoría Legal & Hipotecaria</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Te acompañamos en todo el ciclo de compraventa, promesa, estudio de títulos, tasaciones y gestión de crédito con los principales bancos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
