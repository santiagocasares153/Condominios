// src/components/ResidentesTab.tsx
import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit, Trash2, X } from 'lucide-react';
import { Residente, Entidad } from '../types/types';

// =================================================================
// SIMULACIÓN DE DATOS Y TIPOS
// =================================================================
type ResidenteFormData = Omit<Residente, 'id' | 'status'> & { id: number | null, status: boolean };

// =================================================================
// 📝 Componente ResidenteFormDialog (Formulario Modal)
// =================================================================
interface ResidenteFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ResidenteFormData) => void;
    initialData: ResidenteFormData;
}

const ResidenteFormDialog: React.FC<ResidenteFormDialogProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<ResidenteFormData>(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [id]: newValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    const textPrimary = "text-gray-900 dark:text-gray-100";
    const bgModal = "bg-white dark:bg-gray-800";
    const borderDivide = "border-gray-300 dark:border-gray-600";
    const inputStyle = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100";
    const parentescoOptions = ['Hijo', 'Cónyuge', 'Padre', 'Abuelo', 'Otro Familiar', 'Empleado', 'Visitante Frecuente'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
            <div className={`relative ${bgModal} rounded-lg shadow-xl max-w-lg w-full p-6 mx-4`} onClick={e => e.stopPropagation()}>
                <div className={`flex justify-between items-center pb-3 mb-4 border-b ${borderDivide}`}>
                    <h3 className={`text-xl font-semibold ${textPrimary}`}>
                        {initialData.id ? 'Editar Residente' : 'Agregar Residente'}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="nombre" className={`block text-sm font-medium mb-1 ${textPrimary}`}>Nombres y Apellidos</label>
                        <input type="text" id="nombre" value={formData.nombre || ''} onChange={handleChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="fecNacimiento" className={`block text-sm font-medium mb-1 ${textPrimary}`}>Fecha de Nacimiento</label>
                        <input type="date" id="fecNacimiento" value={formData.fecNacimiento || ''} onChange={handleChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="parentesco" className={`block text-sm font-medium mb-1 ${textPrimary}`}>Parentesco</label>
                        <select id="parentesco" value={formData.parentesco || ''} onChange={handleChange} required className={inputStyle}>
                            <option value="" disabled>Seleccione un parentesco</option>
                            {parentescoOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className={`flex items-center justify-between pt-2 ${borderDivide}`}>
                        <label htmlFor="status" className={`block text-sm font-medium ${textPrimary}`}>Status (Activo)</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="status" checked={formData.status} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-400 dark:bg-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4 space-x-3 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:focus:ring-offset-gray-800">
                            {initialData.id ? 'Guardar Cambios' : 'Agregar Residente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =================================================================
// 🏢 Componente ResidentesTab (Principal)
// =================================================================
interface ResidentesTabProps {
    entidadData: Entidad;
    residentes: Residente[];
    onUpdateResidentes: (updatedResidentes: Residente[]) => void; // Prop añadida para comunicación
}

const ResidentesTab: React.FC<ResidentesTabProps> = ({ residentes: residentesProp, onUpdateResidentes }) => {
    const [residentes, setResidentes] = useState<Residente[]>(residentesProp);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingResidente, setEditingResidente] = useState<ResidenteFormData>({
        id: null,
        nombre: '',
        fecNacimiento: '',
        parentesco: '',
        status: true 
    });

    useEffect(() => {
        setResidentes(residentesProp);
    }, [residentesProp]);

    const handleOpenAddDialog = () => {
        setEditingResidente({ id: null, nombre: '', fecNacimiento: '', parentesco: '', status: true });
        setIsDialogOpen(true);
    };

    const handleEdit = (residente: Residente) => {
        setOpenMenuId(null);
        setEditingResidente(residente as ResidenteFormData);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        setOpenMenuId(null);
        if (window.confirm(`¿Estás seguro de eliminar el residente?`)) {
            const updated = residentes.filter(r => r.id !== id);
            setResidentes(updated);
            onUpdateResidentes(updated); // Notificar al padre
        }
    };

    const handleFormSubmit = (data: ResidenteFormData) => {
        let updatedResidentes: Residente[];

        if (data.id) {
            // Edición
            updatedResidentes = residentes.map(r => (r.id === data.id ? (data as Residente) : r));
        } else {
            // Adición
            const newId = Math.max(0, ...residentes.map(r => r.id)) + 1;
            const newResidente: Residente = { ...data, id: newId } as Residente;
            updatedResidentes = [...residentes, newResidente];
        }

        setResidentes(updatedResidentes);
        onUpdateResidentes(updatedResidentes); // Sincronizar con HomePage
    };

    const handleToggleMenu = (id: number) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Estilos Dark Mode
    const textPrimary = "text-gray-700 dark:text-gray-100";
    const textSecondary = "text-gray-500 dark:text-gray-300";
    const bgHeader = "bg-gray-100 dark:bg-gray-700";
    const bgBody = "bg-white dark:bg-gray-800";
    const bgAlternatingRow = "bg-gray-50 dark:bg-gray-700/50";
    const borderDivide = "divide-gray-200 dark:divide-gray-600";
    const menuBg = "bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5";

    return (
        <div className="flex flex-col h-full space-y-2 overflow-y-auto">
            <h3 className={`text-lg font-bold text-center mb-2 ${textPrimary}`}>Residentes</h3>
            
            <div className="flex justify-end items-center">
                <button 
                    onClick={handleOpenAddDialog}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            
            <div className={`border rounded-lg overflow-auto flex-grow dark:border-gray-600`}>
                <table className={`min-w-full divide-y ${borderDivide}`}>
                    <thead className={`sticky top-0 ${bgHeader}`}>
                        <tr>
                            <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Nombres y Apellidos</th>
                            <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Fec.Nacimiento</th>
                            <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Parentesco</th>
                            <th className={`px-4 py-2 text-center text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Status</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className={`${bgBody} divide-y ${borderDivide} text-xs ${textPrimary}`}>
                        {residentes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-4 text-center text-gray-500 italic">No hay residentes registrados.</td>
                            </tr>
                        ) : (
                            residentes.map((residente, index) => (
                                <tr key={residente.id} className={index % 2 === 0 ? bgBody : bgAlternatingRow}>
                                    <td className="px-4 py-2 whitespace-nowrap">{residente.nombre}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{residente.fecNacimiento}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{residente.parentesco}</td>
                                    <td className="px-4 py-2 text-center">
                                        <div className={`inline-flex w-3 h-3 rounded-full ${residente.status ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    </td>
                                    <td className="px-4 py-2 text-right relative">
                                        <button onClick={() => handleToggleMenu(residente.id)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {openMenuId === residente.id && (
                                            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 ${menuBg}`}>
                                                <div className="py-1">
                                                    <button onClick={() => handleEdit(residente)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">
                                                        <Edit className="w-4 h-4 mr-3 text-gray-400" /> Editar
                                                    </button>
                                                    <button onClick={() => handleDelete(residente.id)} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
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

            <ResidenteFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingResidente}
            />
        </div>
    );
};

export default ResidentesTab;