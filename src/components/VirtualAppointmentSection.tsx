import React, { useState } from 'react';
import { Property, Appointment } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Building,
  Sparkles,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';

interface VirtualAppointmentSectionProps {
  properties: Property[];
  preSelectedProperty?: Property | null;
  onAppointmentCreated?: (appointment: Appointment) => void;
}

export const VirtualAppointmentSection: React.FC<VirtualAppointmentSectionProps> = ({
  properties,
  preSelectedProperty,
  onAppointmentCreated
}) => {
  const today = new Date();
  const availableDates: { dateStr: string; displayDate: string; dayName: string; isWeekend: boolean }[] = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d.toLocaleDateString('es-CL', { weekday: 'short' });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    availableDates.push({
      dateStr: d.toISOString().split('T')[0],
      displayDate: d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }),
      dayName: dayName.toUpperCase(),
      isWeekend,
    });
  }

  const timeSlots = [
    '09:00 AM',
    '10:30 AM',
    '12:00 PM',
    '03:00 PM',
    '04:30 PM',
    '06:00 PM'
  ];

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    preSelectedProperty?.id || properties[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0].dateStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(timeSlots[1]);
  const [platform, setPlatform] = useState<'Google Meet' | 'WhatsApp Video' | 'Zoom' | 'Presencial'>('Google Meet');

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) return;

    const newAppointment: Appointment = {
      id: `CITA-${Math.floor(1000 + Math.random() * 9000)}`,
      propertyId: selectedProperty?.id || 'GNR-100',
      propertyTitle: selectedProperty?.title || 'Consulta General',
      clientName,
      clientEmail,
      clientPhone,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      platform,
      notes,
      status: 'Confirmada',
      createdAt: new Date().toISOString(),
    };

    setCreatedAppointment(newAppointment);
    setIsSuccess(true);
    if (onAppointmentCreated) {
      onAppointmentCreated(newAppointment);
    }
  };

  const waConfirmMessage = createdAppointment
    ? `Hola Innova Raíces, acabo de agendar una cita virtual (${createdAppointment.id}) para la propiedad ${createdAppointment.propertyTitle}. Fecha: ${createdAppointment.date} a las ${createdAppointment.timeSlot}. Mi nombre es ${createdAppointment.clientName}.`
    : '';

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-white shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-sky-600 text-white text-xs font-bold uppercase tracking-wider">
          <CalendarIcon className="w-4 h-4" /> Asesoría & Recorridos Guiados
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          Agendar Cita Virtual o Visita Presencial
        </h2>

        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
          Selecciona una propiedad de interés, fecha y horario. Un asesor especializado de Innova Raíces te acompañará en un recorrido 360° o reunirá en persona.
        </p>
      </div>

      {isSuccess && createdAppointment ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-slate-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center gap-3 text-emerald-600 border-b border-slate-200 pb-4">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold text-slate-900">¡Cita Virtual Reservada con Éxito!</h3>
              <p className="text-xs text-slate-500">Código de confirmación: <strong className="font-mono text-slate-900">{createdAppointment.id}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Propiedad:</span>
              <strong className="text-slate-900 text-sm">{createdAppointment.propertyTitle}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Fecha & Horario:</span>
              <strong className="text-slate-900 text-sm">{createdAppointment.date} • {createdAppointment.timeSlot}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Plataforma:</span>
              <strong className="text-sky-700 font-bold">{createdAppointment.platform}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Cliente:</span>
              <strong className="text-slate-900">{createdAppointment.clientName} ({createdAppointment.clientPhone})</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={`https://wa.me/56974747910?text=${encodeURIComponent(waConfirmMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> Confirmar por WhatsApp
            </a>

            <button
              onClick={() => setIsSuccess(false)}
              className="px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
            >
              Agendar Otra Cita
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-8">
          {/* Step 1: Select Property */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-sky-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Selecciona la Propiedad de Interés
            </h3>

            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-sky-600"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.id}] {p.title} - {p.comuna} ({p.priceUF.toLocaleString()} UF)
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Date & Time */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-sky-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Elige Fecha y Horario
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {availableDates.map(d => (
                <button
                  type="button"
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    selectedDate === d.dateStr
                      ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold">{d.dayName}</div>
                  <div className="text-xs font-black">{d.displayDate}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
              {timeSlots.map(ts => (
                <button
                  type="button"
                  key={ts}
                  onClick={() => setSelectedTimeSlot(ts)}
                  className={`p-2 rounded-lg border text-xs text-center font-semibold transition-all ${
                    selectedTimeSlot === ts
                      ? 'bg-slate-900 text-white border-slate-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {ts}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Modality */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-sky-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Modalidad de Reunión
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['Google Meet', 'WhatsApp Video', 'Zoom', 'Presencial'] as const).map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`p-3 rounded-lg border text-xs font-bold text-center transition-all ${
                    platform === p
                      ? 'bg-sky-50 text-sky-700 border-sky-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Client Info */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-sky-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              Tus Datos de Contacto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Sofía Contreras"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="sofia@ejemplo.cl"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+56 9 8765 4321"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Comentarios / Preguntas</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indica si requieres evaluación de crédito hipotecario o especificaciones..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-all"
          >
            Confirmar Reserva de Cita Virtual
          </button>
        </form>
      )}
    </div>
  );
};
