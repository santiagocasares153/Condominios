// src/components/ServiciosTab.tsx
import React, { useState, useEffect } from 'react';
import { Save, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Servicios } from '../types/types';

interface ServiciosTabProps {
    servicios: Servicios;
    onSaveServicios: (updatedServicios: Servicios) => void;
}

const ServiciosTab: React.FC<ServiciosTabProps> = ({ servicios, onSaveServicios }) => {
    const [formData, setFormData] = useState<Servicios>(servicios);
    const [openService, setOpenService] = useState<string | null>(null);

    const inputClasses = "mt-1 w-full p-2 border rounded-md text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-colors";
    const labelClasses = "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

    useEffect(() => {
        if (servicios) setFormData(servicios);
    }, [servicios]);

    const handleInputChange = (serviceKey: string, field: string, value: any) => {
        setFormData(prev => {
            const updated = { ...prev };
            // Si es un servicio básico (objeto anidado)
            if (['electricidad', 'aseo publico', 'aseoPrivado', 'inteet', 'agua'].includes(serviceKey)) {
                (updated as any)[serviceKey] = {
                    ...(prev[serviceKey as keyof Servicios] as any),
                    [field]: value
                };
            } else {
                // Si es un campo de raíz (tipoTanque, capacidadTanque)
                (updated as any)[serviceKey] = field === 'capacidadTanque' ? Number(value) : value;
            }
            return updated;
        });
    };

    const renderServiceDetails = (key: string) => {
        const data = (formData as any)[key];
        if (!data || data.status !== 'activo') return null;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 mt-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                <div>
                    <label className={labelClasses}>Proveedor</label>
                    <input type="text" value={data.proveedor || ''} onChange={(e) => handleInputChange(key, 'proveedor', e.target.value)} className={inputClasses} placeholder="Nombre empresa" />
                </div>
                <div>
                    <label className={labelClasses}>Nro. Contrato</label>
                    <input type="text" value={data.nroContrato || ''} onChange={(e) => handleInputChange(key, 'nroContrato', e.target.value)} className={inputClasses} placeholder="000-000" />
                </div>
                <div>
                    <label className={labelClasses}>Cuota Mensual</label>
                    <input type="text" value={data.cuota || ''} onChange={(e) => handleInputChange(key, 'cuota', e.target.value)} className={inputClasses} />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                    <label className={labelClasses}>Comentarios / Observaciones</label>
                    <textarea value={data.comentarios || ''} onChange={(e) => handleInputChange(key, 'comentarios', e.target.value)} className={inputClasses} rows={2} />
                </div>
            </div>
        );
    };

    const renderServiceHeader = (key: string, label: string) => {
        const isActivo = (formData as any)[key]?.status === 'activo';
        return (
            <div className="border-b last:border-0 border-gray-100 dark:border-gray-700 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <input 
                            type="checkbox" 
                            checked={isActivo} 
                            onChange={(e) => handleInputChange(key, 'status', e.target.checked ? 'activo' : 'inactivo')} 
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                        />
                        <span className="font-medium text-gray-800 dark:text-gray-100">{label}</span>
                    </div>
                    {isActivo && (
                        <button 
                            type="button" 
                            onClick={() => setOpenService(openService === key ? null : key)}
                            className="text-blue-500 hover:text-blue-600 p-1"
                        >
                            {openService === key ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    )}
                </div>
                {openService === key && renderServiceDetails(key)}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full space-y-4 overflow-y-auto pb-4 px-1">
            <h3 className="text-lg font-bold text-center dark:text-white">Gestión de Servicios</h3>
            
            <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm overflow-hidden dark:border-gray-700">
                <div className="p-4 space-y-1">
                    {renderServiceHeader('electricidad', 'Servicio Eléctrico')}
                    {renderServiceHeader('aseo publico', 'Aseo Municipal (Público)')}
                    {renderServiceHeader('aseoPrivado', 'Aseo Privado')}
                    {renderServiceHeader('agua', 'Suministro de Agua')}
                    {renderServiceHeader('inteet', 'Servicio de Internet')}
                </div>

                {/* Sección Extra para Tanque de Agua */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 border-t dark:border-gray-700">
                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-tighter">Equipamiento de Agua</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Capacidad Tanque (Litros)</label>
                            <input 
                                type="number" 
                                value={formData.capacidadTanque || 0} 
                                onChange={(e) => handleInputChange('capacidadTanque', 'capacidadTanque', e.target.value)} 
                                className={inputClasses} 
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Ubicación / Tipo</label>
                            <div className="flex mt-2 space-x-4">
                                {['subterraneo', 'aereo'].map((tipo) => (
                                    <label key={tipo} className="flex items-center text-sm dark:text-gray-200 capitalize cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="tipoTanque" 
                                            value={tipo} 
                                            checked={formData.tipoTanque === tipo} 
                                            onChange={(e) => handleInputChange('tipoTanque', 'tipoTanque', e.target.value)} 
                                            className="mr-2 text-blue-600 focus:ring-blue-500" 
                                        />
                                        {tipo}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                    <button type="button" onClick={() => setFormData(servicios)} className="flex items-center px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <XCircle size={18} className="mr-2" /> Cancelar
                    </button>
                    <button type="button" onClick={() => onSaveServicios(formData)} className="flex items-center px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95">
                        <Save size={18} className="mr-2" /> Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiciosTab;