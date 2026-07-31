export type OperationType = 'Venta' | 'Arriendo';

export type PropertyCategory = 'Departamento' | 'Casa' | 'Oficina' | 'Terreno' | 'Parcela';

export type PropertyStatus = 'Disponible' | 'Reservado' | 'Vendido';

export interface Agent {
  name: string;
  phone: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Property {
  id: string;
  title: string;
  operation: OperationType;
  type: PropertyCategory;
  priceUF: number;
  priceCLP: number;
  expensesCLP?: number; // Gastos comunes
  region: string;
  comuna: string;
  address: string;
  lat: number;
  lng: number;
  bedrooms: number;
  bathrooms: number;
  surfaceBuilt: number; // m² útiles/construidos
  surfaceTotal: number; // m² totales
  images: string[];
  videoUrl?: string;
  featured: boolean;
  isProject?: boolean;
  projectDeliveryDate?: string;
  status: PropertyStatus;
  description: string;
  features: string[];
  agent: Agent;
}

export interface FilterState {
  searchQuery: string;
  operation: 'Todos' | OperationType;
  propertyType: 'Todos' | PropertyCategory;
  region: string;
  comuna: string;
  minPriceUF: number;
  maxPriceUF: number;
  bedrooms: string; // 'Todos' | '1+' | '2+' | '3+' | '4+'
  bathrooms: string; // 'Todos' | '1+' | '2+' | '3+'
  features: string[];
  status: 'Todos' | PropertyStatus;
  isProjectOnly: boolean;
}

export interface Appointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30"
  platform: 'Google Meet' | 'WhatsApp Video' | 'Zoom' | 'Presencial';
  notes?: string;
  status: 'Confirmada' | 'Pendiente' | 'Cancelada';
  createdAt: string;
}

export interface GoogleSheetsConfig {
  sheetUrl: string;
  sheetId: string;
  isAutoSync: boolean;
  syncIntervalSeconds: number;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export type ActiveTab = 'inicio' | 'propiedades' | 'proyectos' | 'agendar' | 'contacto';
