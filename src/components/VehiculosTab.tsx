// src/components/VehiculosTab.tsx
import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit, Trash2, X, CarFront } from 'lucide-react';
import { Vehiculo, Entidad } from '../types/types';

// Tipo para el estado del formulario
type VehiculoFormData = Omit<Vehiculo, 'id'> & { id: number | null };

// =================================================================
// 📝 Componente VehicleFormDialog (Formulario Modal)
// =================================================================

interface VehicleFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: VehiculoFormData) => void;
    initialData: VehiculoFormData;
}

const VehicleFormDialog: React.FC<VehicleFormDialogProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<VehiculoFormData>(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Solo enviar si la placa no está vacía
        if (formData.placa.trim()) {
            onSubmit(formData);
            onClose();
        }
    };

    if (!isOpen) return null;

    const textPrimary = "text-gray-900 dark:text-gray-100";
    const bgModal = "bg-white dark:bg-gray-800";
    const borderDivide = "border-gray-300 dark:border-gray-600";
    const inputStyle = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
            <div className={`relative ${bgModal} rounded-lg shadow-xl max-w-lg w-full p-6 mx-4`} onClick={e => e.stopPropagation()}>
                
                <div className={`flex justify-between items-center pb-3 mb-4 border-b ${borderDivide}`}>
                    <h3 className={`text-xl font-semibold flex items-center gap-2 ${textPrimary}`}>
                        <CarFront className="w-5 h-5 text-blue-500" />
                        {initialData.id ? 'Editar Vehículo' : 'Agregar Vehículo'}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="placa" className={`block text-sm font-medium mb-1 ${textPrimary}`}>Placa / Matrícula</label>
                            <input type="text" id="placa" value={formData.placa || ''} onChange={handleChange} required className={inputStyle} placeholder="ABC-123" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="marca" className={`block text-sm font-medium mb-1 ${textPrimary}`}>Marca</label>
                            <input type="text" id="marca" value={formData.marca || ''} onChange={handleChange} required className={inputStyle} placeholder="Toyota" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="modelo" className={`block text-sm font-medium mb-1 ${textPrimary}`}>Modelo</label>
                            <input type="text" id="modelo" value={formData.modelo || ''} onChange={handleChange} required className={inputStyle} placeholder="Corolla" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="color" className={`block text-sm font-medium mb-1 ${textPrimary}`}>Color</label>
                            <input type="text" id="color" value={formData.color || ''} onChange={handleChange} required className={inputStyle} placeholder="Blanco" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 space-x-3 border-t dark:border-gray-600">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:focus:ring-offset-gray-800">
                            {initialData.id ? 'Guardar Cambios' : 'Registrar Vehículo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =================================================================
// 🚗 Componente VehiculosTab (Principal)
// =================================================================

interface VehiculosTabProps {
    entidadData: Entidad; 
    vehiculos: Vehiculo[];
    onChangeVehiculos: (v: Vehiculo[]) => void;
}

const VehiculosTab: React.FC<VehiculosTabProps> = ({ vehiculos: vehiculosProp, onChangeVehiculos }) => {
    
    // Función de limpieza para evitar registros vacíos o nulos
    const sanitizeVehicles = (list: Vehiculo[]): Vehiculo[] => {
        if (!Array.isArray(list)) return [];
        return list.filter(v => v && v.placa && v.placa.trim() !== "");
    };

    const [vehiculos, setVehiculos] = useState<Vehiculo[]>(sanitizeVehicles(vehiculosProp));
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<VehiculoFormData>({
        id: null, placa: '', marca: '', modelo: '', color: '',
    });

    useEffect(() => {
        setVehiculos(sanitizeVehicles(vehiculosProp));
    }, [vehiculosProp]);

    const handleOpenAddDialog = () => {
        setEditingVehicle({ id: null, placa: '', marca: '', modelo: '', color: '' });
        setIsDialogOpen(true);
    };

    const handleEdit = (vehiculo: Vehiculo) => {
        setOpenMenuId(null); 
        setEditingVehicle(vehiculo as VehiculoFormData); 
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        setOpenMenuId(null); 
        if (window.confirm(`¿Estás seguro de eliminar este vehículo?`)) {
            const updated = vehiculos.filter(v => v.id !== id);
            setVehiculos(updated);
            onChangeVehiculos(updated);
        }
    };

    const handleFormSubmit = (data: VehiculoFormData) => {
        let updated: Vehiculo[];
        if (data.id) {
            updated = vehiculos.map(v => (v.id === data.id ? (data as Vehiculo) : v));
        } else {
            const newId = vehiculos.length > 0 
                ? Math.max(...vehiculos.map(v => Number(v.id) || 0)) + 1 
                : 1;
            const newVehiculo: Vehiculo = { ...data, id: newId } as Vehiculo;
            updated = [...vehiculos, newVehiculo];
        }
        
        const finalData = sanitizeVehicles(updated);
        setVehiculos(finalData);
        onChangeVehiculos(finalData);
    };

    const textPrimary = "text-gray-700 dark:text-gray-100";
    const textSecondary = "text-gray-500 dark:text-gray-300";
    const bgHeader = "bg-gray-100 dark:bg-gray-700";
    const bgBody = "bg-white dark:bg-gray-800";
    const bgAlternatingRow = "bg-gray-50 dark:bg-gray-700/50";
    const borderDivide = "divide-gray-200 dark:divide-gray-600";
    const menuBg = "bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5";

    return (
        <div className="flex flex-col h-full space-y-2 overflow-y-auto">
            <h3 className={`text-lg font-bold text-center mb-2 ${textPrimary}`}>Vehículos de la Entidad</h3>
            
            <div className="flex justify-end items-center">
                <button 
                    onClick={handleOpenAddDialog}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            
            <div className="border rounded-lg overflow-auto flex-grow dark:border-gray-600">
                <table className={`min-w-full divide-y ${borderDivide}`}>
                    <thead className={`sticky top-0 ${bgHeader}`}>
                        <tr>
                            <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Placa</th>
                            <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Marca / Modelo</th>
                            <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Color</th>
                            <th className="relative px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className={`${bgBody} divide-y ${borderDivide} text-xs ${textPrimary}`}>
                        {vehiculos.length === 0 ? (
                             <tr>
                                <td colSpan={4} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 italic">
                                    No hay vehículos registrados.
                                </td>
                            </tr>
                        ) : (
                            vehiculos.map((vehiculo, index) => (
                                <tr key={vehiculo.id} className={index % 2 === 0 ? bgBody : bgAlternatingRow}>
                                    <td className="px-4 py-2 whitespace-nowrap font-bold">{vehiculo.placa}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{vehiculo.marca} {vehiculo.modelo}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{vehiculo.color}</td>
                                    <td className="px-4 py-2 text-right relative">
                                        <button 
                                            onClick={() => setOpenMenuId(openMenuId === Number(vehiculo.id) ? null : Number(vehiculo.id))}
                                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {openMenuId === Number(vehiculo.id) && (
                                            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 ${menuBg}`}>
                                                <div className="py-1">
                                                    <button onClick={() => handleEdit(vehiculo)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">
                                                        <Edit className="w-4 h-4 mr-3 text-gray-400" /> Editar
                                                    </button>
                                                    <button onClick={() => handleDelete(Number(vehiculo.id))} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                        <Trash2 className="w-4 h-4 mr-3" /> Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <VehicleFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingVehicle}
            />
        </div>
    );
};

export default VehiculosTab;