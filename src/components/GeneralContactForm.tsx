import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Send,
  MapPin,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';

export const GeneralContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    regionInterest: 'Región Metropolitana',
    intent: 'Comprar Propiedad',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
  };

  const waGeneralMsg = `Hola Innova Raíces, mi nombre es ${formData.name || 'Cliente'}. Quisiera consultar de manera general sobre: ${formData.intent} en ${formData.regionInterest}. ${formData.message}`;
  const waGeneralUrl = `https://wa.me/56912345678?text=${encodeURIComponent(waGeneralMsg)}`;

  return (
    <section className="py-8 my-4">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" /> Atención Personalizada
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              ¿Tienes alguna duda o proyecto en mente? Escríbenos
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed">
              Si buscas comprar, publicar para arriendo o venta, o requieres asesoría de financiamiento e inversión en Chile, completa el formulario o comunícate vía WhatsApp.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <MapPin className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Casa Matriz Santiago</h4>
                  <p className="text-xs text-slate-500">Av. Apoquindo 4800, Las Condes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Oficina Viña del Mar</h4>
                  <p className="text-xs text-slate-500">Av. Libertad 1250, Viña del Mar</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <Phone className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Atención Telefónica & Email</h4>
                  <p className="text-xs text-slate-500">+56 9 1234 5678 • contacto@innovaraices.cl</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-xl border border-slate-200">
            {submitted ? (
              <div className="text-center py-8 space-y-4 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">¡Mensaje Recibido!</h3>
                <p className="text-slate-600 text-xs max-w-sm mx-auto">
                  Hemos registrado tu consulta de <strong>{formData.intent}</strong>. Te contactaremos al correo <strong>{formData.email}</strong>.
                </p>
                <div className="pt-2">
                  <a
                    href={waGeneralUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Hablar por WhatsApp Ahora</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                  Formulario de Consulta
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Pedro Morales"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="pedro@ejemplo.cl"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Interés Principal</label>
                    <select
                      value={formData.intent}
                      onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                    >
                      <option value="Comprar Propiedad">Comprar Propiedad</option>
                      <option value="Arrendar Propiedad">Arrendar Propiedad</option>
                      <option value="Publicar / Vender mi Propiedad">Vender mi Propiedad</option>
                      <option value="Inversión en Proyectos Nuevos">Inversión Inmobiliaria</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mensaje / Detalle</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Cuéntanos tus requerimientos de presupuesto, ubicación o tipo de inmueble..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Enviar Mensaje
                  </button>

                  <a
                    href={waGeneralUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
