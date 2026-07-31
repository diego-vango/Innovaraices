import React, { useState } from 'react';
import { Property, GoogleSheetsConfig } from '../types';
import {
  exportPropertiesToCSV,
  saveStoredProperties,
  saveSheetsConfig,
  syncWithGoogleSheets
} from '../services/sheetsService';
import { formatCLP, formatUF } from '../services/ufService';
import {
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Edit2,
  Database,
  Image as ImageIcon,
  Video,
  X,
  Save
} from 'lucide-react';

interface GoogleSheetsSyncPanelProps {
  properties: Property[];
  onPropertiesUpdated: (properties: Property[]) => void;
  sheetsConfig: GoogleSheetsConfig;
  onConfigUpdated: (config: GoogleSheetsConfig) => void;
  ufRate: number;
}

export const GoogleSheetsSyncPanel: React.FC<GoogleSheetsSyncPanelProps> = ({
  properties,
  onPropertiesUpdated,
  sheetsConfig,
  onConfigUpdated,
  ufRate
}) => {
  const [sheetUrl, setSheetUrl] = useState(sheetsConfig.sheetUrl);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Editing Property State
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSuccessMsg(null);

    const updatedConfig: GoogleSheetsConfig = {
      ...sheetsConfig,
      sheetUrl,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'syncing',
    };

    const result = await syncWithGoogleSheets(updatedConfig);

    if (result.success && result.properties) {
      onPropertiesUpdated(result.properties);
      updatedConfig.syncStatus = 'success';
      setSuccessMsg(`¡Sincronización completada! ${result.properties.length} propiedades actualizadas en tiempo real.`);
    } else {
      updatedConfig.syncStatus = 'error';
      updatedConfig.errorMessage = result.error || 'No se pudo conectar a la planilla.';
    }

    onConfigUpdated(updatedConfig);
    saveSheetsConfig(updatedConfig);
    setIsSyncing(false);
  };

  const handleCopyTemplate = () => {
    const csvContent = exportPropertiesToCSV(properties);
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCSV = () => {
    const csvContent = exportPropertiesToCSV(properties);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Innova_Raices_Catalogo_Propiedades.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddQuickProperty = () => {
    const newProp: Property = {
      id: `INV-${Math.floor(131 + Math.random() * 800)}`,
      title: 'Nueva Propiedad / Proyecto Exclusivo',
      operation: 'Venta',
      type: 'Departamento',
      priceUF: 6500,
      priceCLP: Math.round(6500 * ufRate),
      region: 'Región Metropolitana',
      comuna: 'Las Condes',
      address: 'Av. Apoquindo 5000',
      bedrooms: 3,
      bathrooms: 2,
      surfaceBuilt: 95,
      surfaceTotal: 110,
      lat: -33.4168,
      lng: -70.5841,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'
      ],
      featured: true,
      isProject: false,
      status: 'Disponible',
      description: 'Propiedad añadida al catálogo. Puedes editar sus datos, precios e imágenes en tiempo real.',
      features: ['Estacionamiento', 'Bodega', 'Terraza'],
      agent: {
        name: 'Camila Valenzuela',
        role: 'Asesora Inmobiliaria',
        phone: '+56 9 8765 4321',
        email: 'cvalenzuela@innovaraices.cl',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
      }
    };

    const updated = [newProp, ...properties];
    onPropertiesUpdated(updated);
    saveStoredProperties(updated);
    setEditingProperty(newProp);
  };

  const handleDeleteProperty = (id: string) => {
    if (confirm(`¿Eliminar la propiedad ${id} del catálogo?`)) {
      const updated = properties.filter(p => p.id !== id);
      onPropertiesUpdated(updated);
      saveStoredProperties(updated);
    }
  };

  const handleSavePropertyEdit = () => {
    if (!editingProperty) return;

    const updated = properties.map(p =>
      p.id === editingProperty.id
        ? {
            ...editingProperty,
            priceCLP: Math.round(editingProperty.priceUF * ufRate)
          }
        : p
    );

    onPropertiesUpdated(updated);
    saveStoredProperties(updated);
    setEditingProperty(null);
    setSuccessMsg(`Propiedad ${editingProperty.id} guardada correctamente.`);
  };

  const filteredProps = properties.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.comuna.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner - Geometric Balance Theme */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-white shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-sky-600 text-white text-xs font-bold uppercase tracking-wider">
          <FileSpreadsheet className="w-4 h-4" /> Centro de Administración & Sincronización
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          Gestión del Catálogo Inmobiliario & Google Sheets
        </h2>

        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
          Administra las 30+ propiedades del catálogo, edita información, agrega o quita inmuebles, modifica imágenes y videos, o conecta directamente con tu planilla de Google Sheets.
        </p>
      </div>

      {/* Sync Link Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Estado del Enlace Google Sheets</h3>
              <p className="text-xs text-slate-500">
                Última sincronización: {sheetsConfig.lastSyncedAt ? new Date(sheetsConfig.lastSyncedAt).toLocaleTimeString('es-CL') : 'Nunca'}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
            Sincronización Habilitada
          </span>
        </div>

        {/* Input Google Sheet URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            URL de la Planilla Publicada en Google Sheets (CSV)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
              className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
            />
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Planilla'}</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleCopyTemplate}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-sky-600" />}
            <span>{copied ? '¡Copiado a Portapapeles!' : 'Copiar Formato CSV'}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Descargar CSV ({properties.length} registros)</span>
          </button>

          <button
            onClick={handleAddQuickProperty}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Añadir Nueva Propiedad</span>
          </button>
        </div>
      </div>

      {/* Property Edit Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Editar Propiedad ({editingProperty.id})
              </h3>
              <button
                onClick={() => setEditingProperty(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Título de la Propiedad</label>
                <input
                  type="text"
                  value={editingProperty.title}
                  onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Operación</label>
                <select
                  value={editingProperty.operation}
                  onChange={(e) => setEditingProperty({ ...editingProperty, operation: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                >
                  <option value="Venta">Venta</option>
                  <option value="Arriendo">Arriendo</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Propiedad</label>
                <select
                  value={editingProperty.type}
                  onChange={(e) => setEditingProperty({ ...editingProperty, type: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                >
                  <option value="Departamento">Departamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Parcela">Parcela</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Precio (UF)</label>
                <input
                  type="number"
                  value={editingProperty.priceUF}
                  onChange={(e) => setEditingProperty({ ...editingProperty, priceUF: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Valor Calculado CLP hoy</label>
                <div className="p-2 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-slate-800">
                  {formatCLP(editingProperty.priceUF * ufRate)}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Comuna</label>
                <input
                  type="text"
                  value={editingProperty.comuna}
                  onChange={(e) => setEditingProperty({ ...editingProperty, comuna: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dirección</label>
                <input
                  type="text"
                  value={editingProperty.address}
                  onChange={(e) => setEditingProperty({ ...editingProperty, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">URLs de Fotografías (separadas por punto y coma ';')</label>
                <textarea
                  rows={2}
                  value={editingProperty.images.join('; ')}
                  onChange={(e) => setEditingProperty({ ...editingProperty, images: e.target.value.split(';').map(s => s.trim()) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono text-[11px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">URL de Video / Tour Virtual (opcional)</label>
                <input
                  type="text"
                  value={editingProperty.videoUrl || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, videoUrl: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono text-[11px]"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={editingProperty.description}
                  onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setEditingProperty(null)}
                className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePropertyEdit}
                className="px-5 py-2 rounded bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Catálogo de {properties.length} Propiedades</h3>
            <p className="text-xs text-slate-500">Edita información, fotografías, elimina o añade registros</p>
          </div>

          <input
            type="text"
            placeholder="Filtrar por código o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-900 uppercase font-mono tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Título</th>
                <th className="p-3">Operación</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Precio UF</th>
                <th className="p-3">Precio CLP Hoy</th>
                <th className="p-3">Comuna</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredProps.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-sky-700">{p.id}</td>
                  <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{p.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.operation === 'Venta' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.operation}
                    </span>
                  </td>
                  <td className="p-3">{p.type}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{formatUF(p.priceUF)}</td>
                  <td className="p-3 font-mono text-slate-600">{formatCLP(p.priceUF * ufRate)}</td>
                  <td className="p-3 text-slate-600">{p.comuna}</td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => setEditingProperty(p)}
                      className="p-1.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200"
                      title="Editar Propiedad"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(p.id)}
                      className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                      title="Eliminar Propiedad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
