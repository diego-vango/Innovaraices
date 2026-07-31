import React, { useState } from 'react';
import { FilterState, PropertyCategory, OperationType } from '../types';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  RotateCcw,
  ChevronDown,
  Building,
  Tag
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  regions: string[];
  comunas: string[];
  onReset: () => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  regions,
  comunas,
  onReset,
  totalResults
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const propertyTypes: ('Todos' | PropertyCategory)[] = [
    'Todos',
    'Departamento',
    'Casa',
    'Oficina',
    'Terreno',
    'Parcela'
  ];

  const operations: ('Todos' | OperationType)[] = ['Todos', 'Venta', 'Arriendo'];

  const availableFeatures = [
    'Estacionamiento',
    'Piscina',
    'Quincho',
    'Vista al Mar',
    'Bodega',
    'Gimnasio',
    'Seguridad 24/7',
    'Pet Friendly',
    'Termopanel',
    'Calefacción Central'
  ];

  const toggleFeature = (feat: string) => {
    setFilters(prev => {
      const exists = prev.features.includes(feat);
      return {
        ...prev,
        features: exists
          ? prev.features.filter(f => f !== feat)
          : [...prev.features, feat]
      };
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Search & Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="relative md:col-span-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, código (ej: INV-101) o dirección..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Region Selector */}
        <div className="relative md:col-span-3">
          <MapPin className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value, comuna: 'Todas' }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-8 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-600 appearance-none cursor-pointer"
          >
            <option value="Todas">Todas las Regiones</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Operation Selector */}
        <div className="md:col-span-3 flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {operations.map(op => (
            <button
              key={op}
              onClick={() => setFilters(prev => ({ ...prev, operation: op }))}
              className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${
                filters.operation === op
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {op}
            </button>
          ))}
        </div>

        {/* Toggle Filters Button */}
        <div className="md:col-span-2 flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold border transition-all ${
              showAdvanced || filters.features.length > 0 || filters.minPriceUF > 0
                ? 'bg-sky-50 text-sky-700 border-sky-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-sky-600" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Property Type Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1 flex-shrink-0 mr-1">
          <Building className="w-3.5 h-3.5 text-sky-600" /> Tipo:
        </span>
        {propertyTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilters(prev => ({ ...prev, propertyType: type }))}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
              filters.propertyType === type
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in">
          {/* Comuna Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Comuna</label>
            <select
              value={filters.comuna}
              onChange={(e) => setFilters(prev => ({ ...prev, comuna: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
            >
              <option value="Todas">Todas las Comunas</option>
              {comunas.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Price Range UF */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Rango Precio (UF): {filters.minPriceUF} - {filters.maxPriceUF.toLocaleString()} UF
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={filters.minPriceUF || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minPriceUF: Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Máx"
                value={filters.maxPriceUF === 50000 ? '' : filters.maxPriceUF}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPriceUF: Number(e.target.value) || 50000 }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
              />
            </div>
          </div>

          {/* Features Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Equipamiento</label>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {availableFeatures.map(feat => {
                const isSelected = filters.features.includes(feat);
                return (
                  <button
                    key={feat}
                    onClick={() => toggleFeature(feat)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {feat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Results Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div>
          Mostrando <strong className="text-slate-900">{totalResults}</strong> propiedades coincidentes
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-slate-600 hover:text-sky-600 font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restablecer filtros
        </button>
      </div>
    </div>
  );
};
