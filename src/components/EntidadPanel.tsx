// src/components/EntidadPanel.tsx
import React from 'react';
import { Entidad } from '../types/types';
import { Phone, User } from 'lucide-react';

interface EntidadPanelProps {
  data: Entidad;
}

const EntidadPanel: React.FC<EntidadPanelProps> = ({ data }) => {
  
  // Clases adaptativas
  const panelBgClass = "bg-gray-50 dark:bg-gray-700 dark:border-gray-600";
  const headerTextClass = "text-gray-700 dark:text-gray-100";
  const labelTextClass = "font-medium text-gray-700 dark:text-gray-300";
  const valueTextClass = "font-bold text-gray-900 dark:text-gray-50";
  const borderClass = "border-t border-gray-200 dark:border-gray-600";
  const mutedTextClass = "text-gray-500 dark:text-gray-400";
  
  // --- PARSEO SEGURO DE DATOS ---
  const parseSafe = (str: string | null | undefined) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  };

  const datosPropietario = parseSafe(data.propietario);
  const datosInquilino = parseSafe(data.inquilino);

  // Lógica de Clasificación
  const getClasificacionColor = (clas: string) => {
    const c = clas?.toUpperCase();
    if (c === 'SOLVENTE') return 'bg-green-600';
    if (c === 'DEUDOR') return 'bg-red-600';
    if (c === 'MOROSO') return 'bg-red-600';
    if (c === 'JURIDICO') return 'bg-purple-600';
    if (c === 'VACIO') return 'bg-blue-600';
    if (c === 'INACTIVO') return 'bg-gray-400';
    return 'bg-blue-600'; // Default
  };

  // Determinar quién es el contacto principal
  // Si el representante es 'inquilino' y hay datos de inquilino, mostramos ese.
  const mostrarInquilino = data.representante === 'inquilino' && datosInquilino?.nombre;
  const contacto = mostrarInquilino ? datosInquilino : datosPropietario;

  return (
    <div className={`lg:col-span-1 border rounded-lg p-4 h-full flex flex-col space-y-4 shadow-sm ${panelBgClass}`}>
      <h2 className={`text-lg font-bold mb-2 border-b border-gray-200 dark:border-gray-600 pb-2 flex items-center gap-2 ${headerTextClass}`}>
        <User className="w-5 h-5" /> Datos de la Unidad
      </h2>

      {/* Saldo y Clasificación */}
      <div className={`p-3 rounded-lg text-white font-bold text-center text-sm shadow-inner ${getClasificacionColor(data.clasificacion)}`}>
        Saldo: {Number(data.saldoActual).toLocaleString('en-US', { minimumFractionDigits: 2 })} $
        <div className="text-xs font-normal opacity-90 uppercase mt-1">{data.clasificacion}</div>
      </div>

      {/* Detalles Entidad */}
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-y-2">
          <span className={labelTextClass}>Tipo:</span>
          <span className={`${valueTextClass} text-right capitalize`}>{data.clase || '—'}</span>
          
          <span className={labelTextClass}>Referencia:</span>
          <span className={`${valueTextClass} text-right`}>#{data.referencia}</span>
          
          <span className={labelTextClass}>Estatus:</span>
          <span className={`${valueTextClass} text-right capitalize`}>{data.estadoActual || '—'}</span>

          {/* Estos valores no vienen en el JSON de ejemplo, se dejan como opcionales o 0 */}
          <span className={labelTextClass}>Área:</span>
          <span className={`${valueTextClass} text-right`}>{(data as any).area || '0.00'} m²</span>
        </div>

        <div className={`pt-3 ${borderClass}`}>
          <span className={`${labelTextClass} block mb-1 text-xs uppercase tracking-wider`}>Comentarios:</span>
          <p className={`${headerTextClass} text-xs italic leading-relaxed`}>
            {data.comentarios || 'Sin observaciones.'}
          </p>
        </div>
      </div>

      {/* Contacto Principal (Condicional) */}
      <div className={`pt-3 mt-auto ${borderClass}`}>
        <h3 className={`font-bold mb-3 text-sm flex items-center gap-2 ${headerTextClass}`}>
          Contacto ({mostrarInquilino ? 'Inquilino' : 'Propietario'})
        </h3>
        
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className={`text-[10px] uppercase ${mutedTextClass}`}>Nombre</span>
            <span className={`${valueTextClass} text-sm`}>{contacto?.nombre || 'No registrado'}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase ${mutedTextClass}`}>Teléfono</span>
              <span className={headerTextClass}>
                {contacto?.telefonos?.principal || contacto?.telefono || '—'}
              </span>
            </div>
            {(contacto?.telefonos?.principal || contacto?.telefono) && (
              <a 
                href={`tel:${(contacto?.telefonos?.principal || contacto?.telefono).replace(/\D/g, '')}`} 
                className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className="flex flex-col">
            <span className={`text-[10px] uppercase ${mutedTextClass}`}>Email</span>
            <span className="text-blue-500 truncate text-xs">
              {Array.isArray(contacto?.correos) ? contacto.correos[0] : (contacto?.correo || '—')}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Muted */}
      <div className="pt-4 mt-auto">
        <div className="flex items-center justify-between text-[10px] opacity-50 uppercase">
          <span>ID Sistema: {data.id}</span>
          <span>Actualizado: {data.fecUltGestion || '—'}</span>
        </div>
      </div>
    </div>
  );
};

export default EntidadPanel;