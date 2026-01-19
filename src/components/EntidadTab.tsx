// src/components/EntidadTab.tsx
import React from 'react';
import { Entidad } from '../types/types';
import { Home, DollarSign, Zap, User, Phone, Mail, CreditCard } from 'lucide-react';

interface EntidadTabProps {
    entidadData: Entidad;
}

const EntidadTab: React.FC<EntidadTabProps> = ({ entidadData }) => {
    
    const textPrimary = "text-gray-700 dark:text-gray-300";
    const textSecondary = "text-gray-900 dark:text-gray-50";
    const bgSection = "bg-white dark:bg-gray-800 dark:border-gray-700";
    const bgSubSection = "bg-gray-50 dark:bg-gray-700 dark:border-gray-600";
    const textMuted = "text-gray-600 dark:text-gray-400";

    // --- PARSEO SEGURO DE STRINGS JSON ---
    const parseJSON = (str: any) => {
        if (!str || typeof str !== 'string') return null;
        try {
            return JSON.parse(str);
        } catch (e) {
            console.error("Error al parsear JSON de persona:", e);
            return null;
        }
    };

    const datosPropietario = parseJSON(entidadData?.propietario);
    const datosInquilino = parseJSON(entidadData?.inquilino);

    // --- FUNCIONES AUXILIARES ---
    const renderInfoRow = (Icon: React.ElementType, label: string, value: string | number | undefined) => (
        <div className="flex items-start space-x-2 text-sm">
            <Icon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
            <div className="flex flex-col">
                <span className={`font-semibold ${textPrimary}`}>{label}:</span>
                <span className={`${textSecondary} break-words`}>{value || '—'}</span>
            </div>
        </div>
    );

    const renderCardPersona = (titulo: string, data: any) => (
        <div className={`border p-4 rounded-lg ${bgSubSection} shadow-sm`}>
            <h4 className={`text-md font-bold mb-4 border-b pb-2 flex items-center gap-2 ${textPrimary}`}>
                <User className="w-4 h-4" /> {titulo}
            </h4>
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span className={textMuted}>Nombre:</span>
                    <span className={`font-medium ${textSecondary}`}>{data?.nombre || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="w-4"></span>
                    <span className={textMuted}>Cédula:</span>
                    <span className={textSecondary}>{data?.cedula || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-green-400" />
                    <span className={textMuted}>Tel:</span>
                    <span className={textSecondary}>
                        {data?.telefonos?.principal || data?.telefono || '—'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-red-400" />
                    <span className={textMuted}>Correo:</span>
                    <span className={`${textSecondary} truncate`}>
                        {Array.isArray(data?.correos) ? data.correos[0] : (data?.correo || '—')}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full space-y-6 overflow-y-auto">
            <h3 className={`text-lg font-bold text-center mb-2 ${textPrimary}`}>
                Detalles de la Unidad
            </h3>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 border rounded-lg shadow-sm ${bgSection}`}>
                {renderInfoRow(Home, 'Referencia', `${entidadData?.clase} #${entidadData?.referencia}`)}
                {renderInfoRow(Zap, 'Estatus', entidadData?.clasificacion)}
                {renderInfoRow(DollarSign, 'Saldo Actual', `${entidadData?.saldoActual} $`)}
                {renderInfoRow(User, 'Representante', entidadData?.representante)}
                {renderInfoRow(Home, 'Estado', entidadData?.estadoActual)}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 border-t pt-2 mt-2">
                    <p className={`text-xs font-semibold ${textMuted} mb-1 uppercase tracking-wider`}>Comentarios:</p>
                    <p className={`text-sm ${textSecondary}`}>{entidadData?.comentarios || 'Sin comentarios adicionales.'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderCardPersona("Datos del Propietario", datosPropietario)}
                {renderCardPersona("Datos del Inquilino", datosInquilino)}
            </div>

            <div className={`border p-4 rounded-lg ${bgSection}`}>
                <h4 className={`text-md font-bold mb-3 ${textPrimary}`}>Vehículos Registrados</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* ✅ SOLUCIÓN AL ERROR: Verificamos si es un array y tiene elementos válidos */}
                    {Array.isArray(entidadData?.vehiculos) && entidadData.vehiculos.length > 0 && entidadData.vehiculos[0]?.placa ? (
                        entidadData.vehiculos
                            .filter(v => v.placa && v.placa.trim() !== "") // Limpieza de registros vacíos
                            .map((v, idx) => (
                                <div key={v.id || idx} className={`p-2 rounded border text-xs ${bgSubSection} ${textSecondary}`}>
                                    <p><strong>Placa:</strong> {v.placa}</p>
                                    <p><strong>Marca:</strong> {v.marca} {v.modelo}</p>
                                    <p><strong>Color:</strong> {v.color}</p>
                                </div>
                            ))
                    ) : (
                        <p className={`text-sm ${textMuted} col-span-full italic`}>No hay vehículos registrados.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EntidadTab;