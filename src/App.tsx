/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Property, FilterState, ActiveTab, GoogleSheetsConfig, Appointment } from './types';
import { getStoredProperties, fetchPropertiesFromAppsScript } from './services/sheetsService';
import { fetchCurrentUFRate, UFData, FALLBACK_UF_RATE } from './services/ufService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeHero } from './components/HomeHero';
import { PropertyCard } from './components/PropertyCard';
import { PropertyModal } from './components/PropertyModal';
import { FilterBar } from './components/FilterBar';
import { InteractiveMap } from './components/InteractiveMap';
import { VirtualAppointmentSection } from './components/VirtualAppointmentSection';
import { GeneralContactForm } from './components/GeneralContactForm';
import {
  Map,
  Grid,
  Building2,
  Search,
  Layers,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');

  // UF Live Data
  const [ufData, setUfData] = useState<UFData>({
    value: FALLBACK_UF_RATE,
    date: new Date().toLocaleDateString('es-CL'),
    isLive: false
  });

  // Properties State
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Property Modal & Appointment State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [appointmentProperty, setAppointmentProperty] = useState<Property | null>(null);

  // View Mode in Properties Tab
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>('split');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Cargar propiedades asíncronamente directamente desde Google Apps Script Endpoint
  const loadProperties = async () => {
    setIsLoadingProperties(true);
    setFetchError(null);

    try {
      const uf = await fetchCurrentUFRate();
      setUfData(uf);

      const apiProps = await fetchPropertiesFromAppsScript(uf.value);
      setProperties(apiProps);
    } catch (err: any) {
      console.error('Error al conectar con Google Apps Script:', err);
      // Fallback a almacenamiento local / cache
      const fallbackProps = getStoredProperties(ufData.value);
      setProperties(fallbackProps);
      setFetchError(err.message || 'No se pudo conectar a la API de Google Apps Script. Se están mostrando los datos en caché.');
    } finally {
      setIsLoadingProperties(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    loadProperties();

    // Sincronización automática periódica en segundo plano cada 30 segundos
    const syncTimer = setInterval(async () => {
      try {
        const apiProps = await fetchPropertiesFromAppsScript(ufData.value);
        if (isMounted && apiProps && apiProps.length > 0) {
          setProperties(apiProps);
          setFetchError(null);
        }
      } catch (e) {
        console.warn('Background sync check:', e);
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(syncTimer);
    };
  }, []);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    operation: 'Todos',
    propertyType: 'Todos',
    region: 'Todas',
    comuna: 'Todas',
    minPriceUF: 0,
    maxPriceUF: 50000,
    bedrooms: 'Todos',
    bathrooms: 'Todos',
    features: [],
    status: 'Todos',
    isProjectOnly: false,
  });

  const availableRegions = useMemo(() => {
    return Array.from(new Set(properties.map(p => p.region))).sort();
  }, [properties]);

  const availableComunas = useMemo(() => {
    const filteredByReg = filters.region === 'Todas'
      ? properties
      : properties.filter(p => p.region === filters.region);
    return Array.from(new Set(filteredByReg.map(p => p.comuna))).sort();
  }, [properties, filters.region]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesAddr = p.address.toLowerCase().includes(q);
        const matchesComuna = p.comuna.toLowerCase().includes(q);
        const matchesRegion = p.region.toLowerCase().includes(q);
        const matchesType = p.type.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesAddr && !matchesComuna && !matchesRegion && !matchesType && !matchesDesc) return false;
      }

      if (filters.operation !== 'Todos' && p.operation !== filters.operation) return false;
      if (filters.propertyType !== 'Todos' && p.type !== filters.propertyType) return false;
      if (filters.region !== 'Todas' && p.region !== filters.region) return false;
      if (filters.comuna !== 'Todas' && p.comuna !== filters.comuna) return false;
      if (filters.maxPriceUF > 0 && p.priceUF > filters.maxPriceUF) return false;
      if (filters.minPriceUF > 0 && p.priceUF < filters.minPriceUF) return false;

      if (filters.bedrooms !== 'Todos') {
        const minBeds = parseInt(filters.bedrooms, 10);
        if (!isNaN(minBeds) && p.bedrooms < minBeds) return false;
      }

      if (filters.bathrooms !== 'Todos') {
        const minBaths = parseInt(filters.bathrooms, 10);
        if (!isNaN(minBaths) && p.bathrooms < minBaths) return false;
      }

      if (filters.isProjectOnly && !p.isProject) return false;

      if (filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(f => 
          p.features.some(pf => pf.toLowerCase().includes(f.toLowerCase())) ||
          p.description.toLowerCase().includes(f.toLowerCase())
        );
        if (!hasAllFeatures) return false;
      }

      return true;
    });
  }, [properties, filters]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      operation: 'Todos',
      propertyType: 'Todos',
      region: 'Todas',
      comuna: 'Todas',
      minPriceUF: 0,
      maxPriceUF: 50000,
      bedrooms: 'Todos',
      bathrooms: 'Todos',
      features: [],
      status: 'Todos',
      isProjectOnly: false,
    });
  };

  const handleScheduleVisit = (property: Property) => {
    setAppointmentProperty(property);
    setActiveTab('agendar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-sky-600 selection:text-white">
      {/* Top Fixed Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        propertyCount={properties.length}
        ufRate={ufData.value}
        isUfLive={ufData.isLive}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Notification Banner if Network or Apps Script Error occurs */}
        {fetchError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold">Aviso de sincronización: </span>
                <span>{fetchError}</span>
              </div>
            </div>
            <button
              onClick={loadProperties}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reintentar
            </button>
          </div>
        )}

        {/* Global Loader when fetching properties initially */}
        {isLoadingProperties && properties.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-white border border-slate-200 rounded-2xl shadow-sm my-8">
            <Loader2 className="w-10 h-10 text-sky-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Cargando datos desde Google Sheets...</h3>
              <p className="text-xs text-slate-500">Obteniendo catálogo de propiedades y proyectos en tiempo real.</p>
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: INICIO */}
            {activeTab === 'inicio' && (
              <HomeHero
                properties={properties}
                onSelectProperty={setSelectedProperty}
                onScheduleVisit={handleScheduleVisit}
                setActiveTab={setActiveTab}
                ufRate={ufData.value}
              />
            )}

        {/* TAB 2: PROPIEDADES */}
        {activeTab === 'propiedades' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-7 h-7 text-sky-600" />
                  <span>Catálogo de Propiedades</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Buscador avanzado con mapa geolocalizado en tiempo real y consulta directa por WhatsApp.
                </p>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'split' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Divisor
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'grid' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" /> Parrilla ({filteredProperties.length})
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'map' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" /> Mapa
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              regions={availableRegions}
              comunas={availableComunas}
              onReset={handleResetFilters}
              totalResults={filteredProperties.length}
            />

            {filteredProperties.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
                <Search className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">No se encontraron propiedades</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Intenta modificar los filtros de búsqueda o seleccionar una comuna o rango de precio diferente.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-lg bg-sky-600 text-white text-xs font-bold shadow-sm hover:bg-sky-700 transition-colors"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : viewMode === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 lg:sticky lg:top-24">
                  <InteractiveMap
                    properties={filteredProperties}
                    onSelectProperty={setSelectedProperty}
                    heightClass="h-[600px]"
                  />
                </div>
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredProperties.map(property => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onSelect={setSelectedProperty}
                      onScheduleVisit={handleScheduleVisit}
                    />
                  ))}
                </div>
              </div>
            ) : viewMode === 'map' ? (
              <div className="space-y-4">
                <InteractiveMap
                  properties={filteredProperties}
                  onSelectProperty={setSelectedProperty}
                  heightClass="h-[680px]"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSelect={setSelectedProperty}
                    onScheduleVisit={handleScheduleVisit}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROYECTOS NUEVOS */}
        {activeTab === 'proyectos' && (
          <div className="space-y-8 py-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-white shadow-sm">
              <span className="px-3 py-1 rounded bg-sky-600 text-white text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                Nuevos Desarrollos Inmobiliarios
              </span>
              <h1 className="text-3xl font-black tracking-tight">Proyectos en Verde y Blancos</h1>
              <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                Invierte con plusvalía y facilidades de pago del pie en cuotas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.filter(p => p.isProject).map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={setSelectedProperty}
                  onScheduleVisit={handleScheduleVisit}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AGENDAR CITA VIRTUAL */}
        {activeTab === 'agendar' && (
          <VirtualAppointmentSection
            properties={properties}
            preSelectedProperty={appointmentProperty}
            onAppointmentCreated={(appt) => setAppointments(prev => [appt, ...prev])}
          />
        )}

        {/* TAB 5: CONTACTO */}
        {activeTab === 'contacto' && (
          <GeneralContactForm />
        )}
          </>
        )}
      </main>

      {/* Property Details Modal */}
      <PropertyModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onScheduleVisit={handleScheduleVisit}
        ufRate={ufData.value}
      />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
