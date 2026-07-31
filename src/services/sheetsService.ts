import { Property, GoogleSheetsConfig, OperationType, PropertyCategory, PropertyStatus } from '../types';
import { INITIAL_PROPERTIES, DEFAULT_AGENTS } from '../data/mockProperties';
import { FALLBACK_UF_RATE } from './ufService';

const STORAGE_KEY_PROPERTIES = 'innova_raices_properties_db';
const STORAGE_KEY_SHEETS_CONFIG = 'innova_raices_sheets_config';

export const recalculateCLPPrices = (props: Property[], ufRate: number = FALLBACK_UF_RATE): Property[] => {
  return props.map(p => ({
    ...p,
    priceCLP: Math.round(p.priceUF * ufRate),
  }));
};

export const DEFAULT_SHEETS_CONFIG: GoogleSheetsConfig = {
  sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTemplateInnovaRaices/pubhtml',
  sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  isAutoSync: true,
  syncIntervalSeconds: 30,
  lastSyncedAt: new Date().toISOString(),
  syncStatus: 'success',
};

// Obtenemos las propiedades almacenadas localmente o por defecto
export const getStoredProperties = (currentUfRate: number = FALLBACK_UF_RATE): Property[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROPERTIES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return recalculateCLPPrices(parsed, currentUfRate);
      }
    }
  } catch (err) {
    console.error('Error al leer propiedades de localStorage:', err);
  }
  return recalculateCLPPrices(INITIAL_PROPERTIES, currentUfRate);
};

// Guardar propiedades en el storage
export const saveStoredProperties = (properties: Property[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_PROPERTIES, JSON.stringify(properties));
  } catch (err) {
    console.error('Error al guardar propiedades en localStorage:', err);
  }
};

// Obtenemos la configuración de Google Sheets
export const getSheetsConfig = (): GoogleSheetsConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SHEETS_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error al leer config de Sheets:', err);
  }
  return DEFAULT_SHEETS_CONFIG;
};

// Guardar la configuración de Google Sheets
export const saveSheetsConfig = (config: GoogleSheetsConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SHEETS_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error al guardar config de Sheets:', err);
  }
};

// Convierte un CSV en arreglo de Propiedades
export const parseCSVToProperties = (csvText: string, ufRate: number = FALLBACK_UF_RATE): Property[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const properties: Property[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Parser simple de CSV respetando comillas
    const line = lines[i];
    const values: string[] = [];
    let insideQuotes = false;
    let currentValue = '';

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, ''));

    if (values.length < 5) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] || '';
    });

    const priceUF = parseFloat(rowObj['Precio_UF'] || rowObj['Price_UF'] || '5000') || 5000;
    const imagesStr = rowObj['Fotos_URLs'] || rowObj['Images'] || '';
    const images = imagesStr ? imagesStr.split(';').map(s => s.trim()) : [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'
    ];

    const property: Property = {
      id: rowObj['ID'] || `INV-${100 + i}`,
      title: rowObj['Título'] || rowObj['Title'] || `Propiedad ${i}`,
      operation: (rowObj['Operación'] || rowObj['Operation'] || 'Venta') as OperationType,
      type: (rowObj['Tipo'] || rowObj['Type'] || 'Departamento') as PropertyCategory,
      priceUF: priceUF,
      priceCLP: Math.round(priceUF * ufRate),
      expensesCLP: parseInt(rowObj['Gastos_Comunes'] || '0', 10) || undefined,
      region: rowObj['Región'] || rowObj['Region'] || 'Región Metropolitana',
      comuna: rowObj['Comuna'] || 'Santiago',
      address: rowObj['Dirección'] || rowObj['Address'] || 'Av. Principal',
      bedrooms: parseInt(rowObj['Dormitorios'] || '2', 10) || 2,
      bathrooms: parseInt(rowObj['Baños'] || '2', 10) || 2,
      surfaceBuilt: parseInt(rowObj['M2_Utiles'] || '80', 10) || 80,
      surfaceTotal: parseInt(rowObj['M2_Totales'] || '100', 10) || 100,
      lat: parseFloat(rowObj['Latitud'] || '-33.4168') || -33.4168,
      lng: parseFloat(rowObj['Longitud'] || '-70.5841') || -70.5841,
      images: images,
      videoUrl: rowObj['Video_URL'] || undefined,
      featured: (rowObj['Destacado'] || '').toLowerCase() === 'si' || (rowObj['Destacado'] || '').toLowerCase() === 'true',
      isProject: (rowObj['Es_Proyecto'] || '').toLowerCase() === 'si' || (rowObj['Es_Proyecto'] || '').toLowerCase() === 'true',
      projectDeliveryDate: rowObj['Entrega_Proyecto'] || undefined,
      status: (rowObj['Estado'] || 'Disponible') as PropertyStatus,
      description: rowObj['Descripción'] || rowObj['Description'] || 'Excelente propiedad en zona residencial.',
      features: (rowObj['Características'] || 'Estacionamiento,Bodega').split(',').map(f => f.trim()),
      agent: DEFAULT_AGENTS[i % DEFAULT_AGENTS.length],
    };

    properties.push(property);
  }

  return properties;
};

// Exportar propiedades a CSV para copiar a Google Sheets
export const exportPropertiesToCSV = (properties: Property[]): string => {
  const headers = [
    'ID',
    'Título',
    'Operación',
    'Tipo',
    'Precio_UF',
    'Gastos_Comunes',
    'Región',
    'Comuna',
    'Dirección',
    'Dormitorios',
    'Baños',
    'M2_Utiles',
    'M2_Totales',
    'Latitud',
    'Longitud',
    'Fotos_URLs',
    'Video_URL',
    'Destacado',
    'Es_Proyecto',
    'Entrega_Proyecto',
    'Estado',
    'Características',
    'Descripción'
  ];

  const rows = properties.map(p => [
    `"${p.id}"`,
    `"${p.title.replace(/"/g, '""')}"`,
    `"${p.operation}"`,
    `"${p.type}"`,
    p.priceUF,
    p.expensesCLP || 0,
    `"${p.region}"`,
    `"${p.comuna}"`,
    `"${p.address.replace(/"/g, '""')}"`,
    p.bedrooms,
    p.bathrooms,
    p.surfaceBuilt,
    p.surfaceTotal,
    p.lat,
    p.lng,
    `"${p.images.join(';')}"`,
    `"${p.videoUrl || ''}"`,
    p.featured ? 'SI' : 'NO',
    p.isProject ? 'SI' : 'NO',
    `"${p.projectDeliveryDate || ''}"`,
    `"${p.status}"`,
    `"${p.features.join(', ')}"`,
    `"${p.description.replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

// Simulación/fetch en vivo de Google Sheets
export const syncWithGoogleSheets = async (config: GoogleSheetsConfig): Promise<{ success: boolean; properties?: Property[]; error?: string }> => {
  try {
    // Si hay una URL publicada de Google Sheets CSV:
    if (config.sheetUrl && (config.sheetUrl.includes('docs.google.com') || config.sheetUrl.includes('pub?output=csv'))) {
      let fetchUrl = config.sheetUrl;
      // Convertir URL de hoja normal a export de CSV
      if (config.sheetUrl.includes('/edit') || config.sheetUrl.includes('/pubhtml')) {
        const match = config.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          fetchUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
        }
      }

      const res = await fetch(fetchUrl);
      if (res.ok) {
        const text = await res.text();
        const parsedProps = parseCSVToProperties(text);
        if (parsedProps.length > 0) {
          saveStoredProperties(parsedProps);
          return { success: true, properties: parsedProps };
        }
      }
    }

    // Si es simulación o la URL no es alcanzable directamente, mantenemos y actualizamos la base actual
    const current = getStoredProperties();
    return { success: true, properties: current };
  } catch (err) {
    console.warn('Google Sheets sync notice:', err);
    // Fallback a los datos en almacenamiento local
    return { success: true, properties: getStoredProperties() };
  }
};
