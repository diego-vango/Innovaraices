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
  sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS9Lwmj-pfDXzkqVGbTQUYZXWGxNY3m0AJfqbXOcTtXoqQC0jwkIIMCi9FBDNkAcEnqK1gGGUbpidXe/pub?gid=0&single=true&output=csv',
  sheetId: '2PACX-1vS9Lwmj-pfDXzkqVGbTQUYZXWGxNY3m0AJfqbXOcTtXoqQC0jwkIIMCi9FBDNkAcEnqK1gGGUbpidXe',
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
      const parsed = JSON.parse(saved);
      if (
        parsed.sheetUrl &&
        !parsed.sheetUrl.includes('1_ViZuuFYt7Gm2LG40887laagIahDkaKHFCAcFkUt8YI') &&
        !parsed.sheetUrl.includes('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms')
      ) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error al leer config de Sheets:', err);
  }
  return DEFAULT_SHEETS_CONFIG;
};

// Extraer ID de la URL de Google Sheets
export const extractSheetId = (url: string): string => {
  if (!url) return '';
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url;
};

// Guardar la configuración de Google Sheets
export const saveSheetsConfig = (config: GoogleSheetsConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SHEETS_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error al guardar config de Sheets:', err);
  }
};

// Helper function to normalize keys for key matching (stripping accents, special chars)
const normalizeKey = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '');
};

// Helper function to split a CSV line into cells respecting quotes and delimiters
const parseCSVLine = (rawLine: string, forcedDelimiter?: string): string[] => {
  let line = rawLine.trim();
  if (!line) return [];

  // If the line is enclosed in outer quotes from a single-column Google Sheet cell export
  if (line.startsWith('"') && line.endsWith('"') && line.length > 2) {
    const unquoted = line.slice(1, -1).replace(/""/g, '"');
    if (unquoted.includes(',') || unquoted.includes(';') || unquoted.includes('\t')) {
      line = unquoted;
    }
  }

  // Detect delimiter if not forced
  let delimiter = forcedDelimiter;
  if (!delimiter) {
    const tabs = (line.match(/\t/g) || []).length;
    const semicolons = (line.match(/;/g) || []).length;
    const commas = (line.match(/,/g) || []).length;

    if (tabs > semicolons && tabs > commas) delimiter = '\t';
    else if (semicolons > commas) delimiter = ';';
    else delimiter = ',';
  }

  const values: string[] = [];
  let insideQuotes = false;
  let currentValue = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        currentValue += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      values.push(currentValue.trim().replace(/^"|"$/g, ''));
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim().replace(/^"|"$/g, ''));

  return values;
};

// Convierte un CSV en arreglo de Propiedades
export const parseCSVToProperties = (csvText: string, ufRate: number = FALLBACK_UF_RATE): Property[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  if (headers.length === 0) return [];

  const properties: Property[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);

    if (values.length === 0) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      const val = values[index] || '';
      rowObj[header] = val;
      rowObj[normalizeKey(header)] = val;
    });

    const getValue = (...keys: string[]): string => {
      for (const k of keys) {
        if (rowObj[k] !== undefined && rowObj[k] !== '') return rowObj[k];
        const norm = normalizeKey(k);
        if (rowObj[norm] !== undefined && rowObj[norm] !== '') return rowObj[norm];
      }
      return '';
    };

    const priceUF = parseFloat(getValue('Precio_UF', 'Price_UF', 'PriceUF', 'Price', 'Precio')) || 5000;

    // Recopilar imágenes (Foto principal + Galeria_Imagen_1..10 + Gallery/Fotos_URLs)
    const imagesList: string[] = [];
    const mainImg = getValue('Imagen_Principal', 'Imagen', 'Image', 'Foto_Principal', 'Fotos_URLs', 'Images');
    if (mainImg) {
      if (mainImg.includes(';') || mainImg.includes(',')) {
        mainImg.split(/[;,]/).forEach(img => {
          if (img.trim()) imagesList.push(img.trim());
        });
      } else {
        imagesList.push(mainImg.trim());
      }
    }

    // Galería individual Galeria_Imagen_1 a Galeria_Imagen_10 (y Gallery_Image_1 a 10)
    for (let g = 1; g <= 10; g++) {
      const gImg = getValue(`Galeria_Imagen_${g}`, `GaleriaImagen${g}`, `Gallery_Image_${g}`, `GalleryImage${g}`, `Gallery_${g}`, `Galeria_${g}`);
      if (gImg && gImg.trim() && !imagesList.includes(gImg.trim())) {
        imagesList.push(gImg.trim());
      }
    }

    // Galería general
    const generalGallery = getValue('Galería', 'Galeria', 'Gallery', 'Fotos_URLs');
    if (generalGallery) {
      generalGallery.split(/[;,]/).forEach(img => {
        if (img.trim() && !imagesList.includes(img.trim())) {
          imagesList.push(img.trim());
        }
      });
    }

    if (imagesList.length === 0) {
      imagesList.push('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200');
    }

    const highlightsStr = getValue('Puntos_Destacados', 'Características', 'Caracteristicas', 'Highlights', 'Features');
    const featuresArr = highlightsStr
      ? highlightsStr.split(/[,|;]/).map(f => f.trim()).filter(Boolean)
      : ['Excelente Ubicación', 'Terminaciones de Lujo'];

    const property: Property = {
      id: getValue('ID', 'Ref', 'Codigo') || `INV-${100 + i}`,
      title: getValue('Título', 'Titulo', 'Title', 'Nombre') || `Propiedad ${i}`,
      operation: (getValue('Operación', 'Operacion', 'Operation') || 'Venta') as OperationType,
      type: (getValue('Categoría', 'Categoria', 'Tipo', 'Category', 'Type') || 'Departamento') as PropertyCategory,
      priceUF: priceUF,
      priceCLP: Math.round(priceUF * ufRate),
      expensesCLP: parseInt(getValue('Gastos_Comunes', 'Expenses_CLP', 'GastosComunes') || '0', 10) || undefined,
      region: getValue('Región', 'Region') || 'Región Metropolitana',
      comuna: getValue('Comuna', 'Ubicación', 'Ubicacion', 'Location') || 'Santiago',
      address: getValue('Ubicación', 'Ubicacion', 'Dirección', 'Direccion', 'Address', 'Location') || 'Av. Principal',
      bedrooms: parseInt(getValue('Dormitorios', 'Bedrooms', 'Habitaciones') || '2', 10) || 2,
      bathrooms: parseInt(getValue('Baños', 'Banos', 'Bathrooms') || '2', 10) || 2,
      surfaceBuilt: parseInt(getValue('M2_Utiles', 'Superficie_Util', 'Surface_Built') || '80', 10) || 80,
      surfaceTotal: parseInt(getValue('M2_Totales', 'Superficie_Total', 'Surface_Total') || '100', 10) || 100,
      lat: parseFloat(getValue('Latitud', 'Lat') || '-33.4168') || -33.4168,
      lng: parseFloat(getValue('Longitud', 'Lng') || '-70.5841') || -70.5841,
      images: imagesList,
      videoUrl: getValue('Video_URL', 'VideoUrl', 'Video') || undefined,
      featured: getValue('Destacado', 'Featured').toLowerCase() === 'si' || getValue('Destacado', 'Featured').toLowerCase() === 'true',
      isProject: getValue('Es_Proyecto', 'IsProject', 'Is_Project').toLowerCase() === 'si' || getValue('Es_Proyecto', 'IsProject', 'Is_Project').toLowerCase() === 'true',
      projectDeliveryDate: getValue('Fecha_Entrega', 'Date', 'Fecha', 'Entrega_Proyecto') || undefined,
      status: (getValue('Estado', 'Status') || 'Disponible') as PropertyStatus,
      description: getValue('Descripción', 'Descripcion', 'Description') || 'Excelente propiedad en zona residencial.',
      features: featuresArr,
      agent: DEFAULT_AGENTS[i % DEFAULT_AGENTS.length],
    };

    properties.push(property);
  }

  return properties;
};

// Exportar propiedades a CSV para copiar a Google Sheets (con títulos de columnas en español)
export const exportPropertiesToCSV = (properties: Property[]): string => {
  const headers = [
    'ID',
    'Título',
    'Categoría',
    'Descripción',
    'Imagen_Principal',
    'Video_URL',
    'Fecha_Entrega',
    'Ubicación',
    'Puntos_Destacados',
    'Precio_UF',
    'Gastos_Comunes',
    'Operación',
    'Dormitorios',
    'Baños',
    'M2_Utiles',
    'M2_Totales',
    'Comuna',
    'Región',
    'Estado',
    'Es_Proyecto',
    'Galeria_Imagen_1',
    'Galeria_Imagen_2',
    'Galeria_Imagen_3',
    'Galeria_Imagen_4',
    'Galeria_Imagen_5',
    'Galeria_Imagen_6',
    'Galeria_Imagen_7',
    'Galeria_Imagen_8',
    'Galeria_Imagen_9',
    'Galeria_Imagen_10'
  ];

  const rows = properties.map(p => {
    const mainImg = p.images[0] || '';
    const galleryImgs = p.images.slice(1);

    return [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.type}"`,
      `"${p.description.replace(/"/g, '""')}"`,
      `"${mainImg}"`,
      `"${p.videoUrl || ''}"`,
      `"${p.projectDeliveryDate || 'Inmediata'}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      `"${p.features.join(', ')}"`,
      p.priceUF,
      p.expensesCLP || 0,
      `"${p.operation}"`,
      p.bedrooms,
      p.bathrooms,
      p.surfaceBuilt,
      p.surfaceTotal,
      `"${p.comuna}"`,
      `"${p.region}"`,
      `"${p.status}"`,
      p.isProject ? 'SI' : 'NO',
      `"${galleryImgs[0] || ''}"`,
      `"${galleryImgs[1] || ''}"`,
      `"${galleryImgs[2] || ''}"`,
      `"${galleryImgs[3] || ''}"`,
      `"${galleryImgs[4] || ''}"`,
      `"${galleryImgs[5] || ''}"`,
      `"${galleryImgs[6] || ''}"`,
      `"${galleryImgs[7] || ''}"`,
      `"${galleryImgs[8] || ''}"`,
      `"${galleryImgs[9] || ''}"`
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

// Crear automáticamente un Google Sheet en la cuenta del usuario mediante Google Sheets REST API
export const createGoogleSheetInDrive = async (
  accessToken: string,
  properties: Property[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  // 1. Crear la planilla en Google Drive
  const createRes = await fetch('https://sheets.googleapis.com/v1/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Innova Raíces - Inventario de Propiedades (30 Propiedades)',
      },
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Error al crear la hoja de cálculo en Google Drive.');
  }

  const createData = await createRes.json();
  const spreadsheetId = createData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Preparar los datos
  const headers = [
    'ID', 'Título', 'Categoría', 'Descripción', 'Imagen_Principal', 'Video_URL',
    'Fecha_Entrega', 'Ubicación', 'Puntos_Destacados', 'Precio_UF', 'Gastos_Comunes',
    'Operación', 'Dormitorios', 'Baños', 'M2_Utiles', 'M2_Totales', 'Comuna',
    'Región', 'Estado', 'Es_Proyecto', 'Galeria_Imagen_1', 'Galeria_Imagen_2',
    'Galeria_Imagen_3', 'Galeria_Imagen_4', 'Galeria_Imagen_5', 'Galeria_Imagen_6',
    'Galeria_Imagen_7', 'Galeria_Imagen_8', 'Galeria_Imagen_9', 'Galeria_Imagen_10'
  ];

  const rows = properties.map(p => {
    const mainImg = p.images[0] || '';
    const galleryImgs = p.images.slice(1);
    return [
      p.id,
      p.title,
      p.type,
      p.description,
      mainImg,
      p.videoUrl || '',
      p.projectDeliveryDate || 'Inmediata',
      p.address,
      p.features.join(', '),
      p.priceUF,
      p.expensesCLP || 0,
      p.operation,
      p.bedrooms,
      p.bathrooms,
      p.surfaceBuilt,
      p.surfaceTotal,
      p.comuna,
      p.region,
      p.status,
      p.isProject ? 'SI' : 'NO',
      galleryImgs[0] || '',
      galleryImgs[1] || '',
      galleryImgs[2] || '',
      galleryImgs[3] || '',
      galleryImgs[4] || '',
      galleryImgs[5] || '',
      galleryImgs[6] || '',
      galleryImgs[7] || '',
      galleryImgs[8] || '',
      galleryImgs[9] || ''
    ];
  });

  const valueRange = {
    range: 'A1',
    majorDimension: 'ROWS',
    values: [headers, ...rows],
  };

  // 3. Escribir las filas y columnas en la hoja
  await fetch(
    `https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(valueRange),
    }
  );

  return { spreadsheetId, spreadsheetUrl };
};

// Sincronización en vivo con Google Sheets (soporta REST API con OAuth y CSV publicado)
export const syncWithGoogleSheets = async (
  config: GoogleSheetsConfig,
  accessToken?: string | null
): Promise<{ success: boolean; properties?: Property[]; error?: string }> => {
  try {
    const sheetId = config.sheetId || extractSheetId(config.sheetUrl);

    // 1. Si tenemos token de acceso OAuth y un ID de planilla válido, leemos directo por API
    if (accessToken && sheetId && !sheetId.includes('2PACX-1v')) {
      try {
        const apiRes = await fetch(
          `https://sheets.googleapis.com/v1/spreadsheets/${sheetId}/values/A1:Z500`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (apiRes.ok) {
          const data = await apiRes.json();
          const rows: string[][] = data.values || [];
          if (rows.length > 1) {
            // Convertir matriz de celdas a CSV
            const csvContent = rows
              .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
              .join('\n');
            const parsedProps = parseCSVToProperties(csvContent);
            if (parsedProps.length > 0) {
              saveStoredProperties(parsedProps);
              return { success: true, properties: parsedProps };
            }
          }
        }
      } catch (e) {
        console.warn('Fallback a lectura CSV pública:', e);
      }
    }

    // 2. Si hay una URL publicada de Google Sheets CSV:
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

    // 3. Fallback a los datos en almacenamiento local
    const current = getStoredProperties();
    return { success: true, properties: current };
  } catch (err) {
    console.warn('Google Sheets sync notice:', err);
    return { success: true, properties: getStoredProperties() };
  }
};

