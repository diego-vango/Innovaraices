import React from 'react';
import { ActiveTab } from '../types';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md bg-white p-0.5 border border-slate-700 flex-shrink-0">
                <img
                  src="/logo.jpg"
                  alt="Innova Raíces Logo"
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-lg font-black text-white tracking-tight">Innova Raíces</span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Innova Raíces es la corredora e inmobiliaria líder en asesoría personalizada en Chile. Conectamos viviendas exclusivas y proyectos de alta plusvalía en Santiago, Quinta Región, Biobío y el Sur del país.
            </p>

            <div className="pt-1 flex items-center gap-2 text-sky-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Corredora de Propiedades Registrada</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('inicio')} className="hover:text-white transition-colors">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('propiedades')} className="hover:text-white transition-colors">
                  Catálogo de Propiedades
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('proyectos')} className="hover:text-white transition-colors">
                  Proyectos Nuevos
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('agendar')} className="hover:text-white transition-colors">
                  Agendar Cita Virtual
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('contacto')} className="hover:text-white transition-colors">
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Coverage Regions Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Zonas de Cobertura</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Santiago (Las Condes, Vitacura, Providencia, Ñuñoa)</li>
              <li>• Valparaíso (Viña del Mar, Reñaca, Concón)</li>
              <li>• Biobío (Concepción, San Pedro de la Paz)</li>
              <li>• Coquimbo (La Serena, Coquimbo)</li>
              <li>• Los Lagos (Puerto Varas, Frutillar)</li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contacto Directo</h4>
            <div className="space-y-2">
              <a
                href="https://wa.me/56974747910?text=Hola%20Innova%20Ra%C3%ADces"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Directo</span>
              </a>

              <div className="text-slate-400 leading-relaxed text-[11px]">
                <p>Teléfono: +56 9 7474 7910</p>
                <p>Email: diego@somostrino.cl</p>
                <p>Horario: Lun - Vie 09:00 - 19:00 hrs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} Innova Raíces - Gestión Inmobiliaria. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Gestión Inmobiliaria Integrada</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
