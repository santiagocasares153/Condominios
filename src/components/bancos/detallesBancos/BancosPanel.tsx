import React from 'react';
import { Landmark, Phone, Hash } from 'lucide-react';

// Interfaz local para el componente
interface Banco {
    id: number;
    tipo: string;
    nombre: string;
    apodo: string;
    datos: {
        numeroCuenta: string;
        mondeda: string;
        pagoMovil?: { telefono: string; rif: string; };
    };
    estadoActual: string;
    comentarios: string;
}

interface BancosPanelProps {
    banco: Banco;
}

const BancosPanel: React.FC<BancosPanelProps> = ({ banco }) => {
    if (!banco) return null;

    const panelBgClass = "bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600";
    const headerTextClass = "text-gray-700 dark:text-gray-100";
    const labelTextClass = "font-medium text-gray-700 dark:text-gray-300";
    const valueTextClass = "font-bold text-gray-900 dark:text-gray-50";
    const borderClass = "border-t border-gray-200 dark:border-gray-600";
    const mutedTextClass = "text-gray-500 dark:text-gray-400";

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        return s === 'activo' ? 'bg-green-600' : 'bg-gray-500';
    };

    return (
        <div className={`lg:col-span-1 border rounded-lg p-4 h-full flex flex-col space-y-4 shadow-sm ${panelBgClass}`}>
            <h2 className={`text-lg font-bold mb-2 border-b border-gray-200 dark:border-gray-600 pb-2 flex items-center gap-2 ${headerTextClass}`}>
                <Landmark className="w-5 h-5 text-blue-500" /> Datos del Banco
            </h2>

            {/* Estado y Moneda */}
            <div className={`p-3 rounded-lg text-white font-bold text-center text-sm shadow-inner ${getStatusColor(banco.estadoActual)}`}>
                <div className="uppercase tracking-widest">{banco.estadoActual || 'Desconocido'}</div>
                <div className="text-xs font-normal opacity-90 mt-1">
                    Moneda: {banco.datos?.mondeda || 'Bs'}
                </div>
            </div>

            {/* Detalles Técnicos */}
            <div className="space-y-3 text-sm">
                <div className="flex flex-col gap-1">
                    <span className={labelTextClass}>Nombre Oficial:</span>
                    <span className={`${valueTextClass} truncate`}>{banco.nombre}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 pt-2">
                    <div className="flex flex-col">
                        <span className={labelTextClass}>Tipo:</span>
                        <span className={`${valueTextClass} capitalize text-blue-500`}>{banco.tipo}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className={labelTextClass}>ID:</span>
                        <span className={valueTextClass}>#{banco.id}</span>
                    </div>
                </div>

                <div className={`pt-3 ${borderClass}`}>
                    <span className={`${labelTextClass} flex items-center gap-1 mb-1 text-[10px] uppercase tracking-wider`}>
                        <Hash className="w-3 h-3" /> Número de Cuenta:
                    </span>
                    <p className={`${valueTextClass} break-all text-xs bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-600`}>
                        {banco.datos?.numeroCuenta || 'No registrada'}
                    </p>
                </div>

                <div className={`pt-3 ${borderClass}`}>
                    <span className={`${labelTextClass} block mb-1 text-[10px] uppercase tracking-wider`}>Comentarios:</span>
                    <p className={`${headerTextClass} text-xs italic leading-relaxed`}>
                        {banco.comentarios || 'Sin observaciones adicionales.'}
                    </p>
                </div>
            </div>

            {/* Pago Móvil (Contacto) */}
            {banco.datos?.pagoMovil && (
                <div className={`pt-3 mt-auto ${borderClass}`}>
                    <h3 className={`font-bold mb-3 text-xs flex items-center gap-2 uppercase tracking-tighter ${headerTextClass}`}>
                        Configuración Pago Móvil
                    </h3>
                    
                    <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className={`text-[10px] uppercase ${mutedTextClass}`}>Teléfono</span>
                                <span className={`${valueTextClass} text-sm`}>{banco.datos.pagoMovil.telefono}</span>
                            </div>
                            <a 
                                href={`tel:${banco.datos.pagoMovil.telefono.replace(/\D/g, '')}`} 
                                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                            >
                                <Phone className="w-3 h-3" />
                            </a>
                        </div>

                        <div className="flex flex-col border-t border-blue-100 dark:border-blue-800 pt-2">
                            <span className={`text-[10px] uppercase ${mutedTextClass}`}>RIF / Documento</span>
                            <span className={`${valueTextClass} text-xs`}>{banco.datos.pagoMovil.rif}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BancosPanel;