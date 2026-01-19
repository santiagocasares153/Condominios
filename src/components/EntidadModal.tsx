// src/components/EntidadModal.tsx
import React, { useState, useEffect } from 'react';
import { Entidad } from '../types/types'; // Usamos el tipo Entidad coherente
import { X, Save } from 'lucide-react';

interface EntidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Entidad;
  onSave: (updatedData: any) => void;
}

const EntidadModal: React.FC<EntidadModalProps> = ({ isOpen, onClose, data, onSave }) => {
  // Estado local para manejar los datos editables (con propietario e inquilino como objetos)
  const [formData, setFormData] = useState<any>(null);

  const inputClasses = "mt-1 w-full p-2 border rounded-md transition-colors text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
  const labelClasses = "block font-medium text-gray-700 dark:text-gray-300";
  const fieldsetClasses = "border p-4 rounded-lg space-y-3 dark:border-gray-700";
  const legendClasses = "text-base font-semibold text-gray-800 dark:text-gray-100 px-2";

  useEffect(() => {
    if (isOpen && data) {
      // Al abrir, parseamos los strings de la API a objetos para que los inputs puedan leerlos
      const parseField = (field: any) => {
        if (typeof field === 'string' && field.trim().startsWith('{')) {
          try { return JSON.parse(field); } catch (e) { return {}; }
        }
        return field || {};
      };

      setFormData({
        ...data,
        propietario: parseField(data.propietario),
        inquilino: parseField(data.inquilino)
      });
    }
  }, [isOpen, data]);

  if (!isOpen || !formData) return null;

  // Manejador para campos de primer nivel (referencia, clase, etc)
  const handleMainInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const fieldName = id.replace('modal_', '');
    
    setFormData((prev: any) => ({ 
        ...prev, 
        [fieldName]: type === 'checkbox' ? checked : value 
    }));
  };

  // Manejador para datos anidados (Propietario / Inquilino)
  const handleNestedChange = (personType: 'propietario' | 'inquilino', field: string, value: string) => {
    setFormData((prev: any) => {
        const updatedPerson = { ...prev[personType] };
        
        // Manejo especial para la estructura de Propietario (telefonos principal)
        if (personType === 'propietario' && field === 'telefono') {
            updatedPerson.telefonos = { ...updatedPerson.telefonos, principal: value };
        } else if (personType === 'propietario' && field === 'correo') {
            updatedPerson.correos = [value];
        } else {
            updatedPerson[field] = value;
        }

        return { ...prev, [personType]: updatedPerson };
    });
  };

  const handleSave = () => {
      // ANTES DE GUARDAR: Convertimos los objetos de nuevo a String para la API
      const payload = {
          ...formData,
          propietario: JSON.stringify(formData.propietario),
          inquilino: JSON.stringify(formData.inquilino)
      };
      onSave(payload);
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10 px-4">
      <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-2xl rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
        
        <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Editar Unidad: {formData.clase} {formData.referencia}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            
            {/* 1. Información Principal */}
            <fieldset className={fieldsetClasses}>
                <legend className={legendClasses}>Información de la Entidad</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClasses}>Clase:</label>
                        <input type="text" id="modal_clase" value={formData.clase || ''} onChange={handleMainInputChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Referencia:</label>
                        <input type="text" id="modal_referencia" value={formData.referencia || ''} onChange={handleMainInputChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Clasificación:</label>
                        <select id="modal_clasificacion" value={formData.clasificacion || ''} onChange={handleMainInputChange} className={inputClasses}>
                            <option value="SOLVENTE">SOLVENTE</option>
                            <option value="MOROSO">MOROSO</option>
                            <option value="JURIDICO">JURIDICO</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Representante:</label>
                        <input type="text" id="modal_representante" value={formData.representante || ''} onChange={handleMainInputChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Estado Actual:</label>
                        <input type="text" id="modal_estadoActual" value={formData.estadoActual || ''} onChange={handleMainInputChange} className={inputClasses} />
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Comentarios:</label>
                    <textarea id="modal_comentarios" rows={2} value={formData.comentarios || ''} onChange={handleMainInputChange} className={inputClasses} />
                </div>
            </fieldset>
            
            {/* 2. Datos Propietario */}
            <fieldset className={fieldsetClasses}>
                <legend className={legendClasses}>Datos del Propietario</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Nombre:</label>
                        <input type="text" value={formData.propietario?.nombre || ''} onChange={(e) => handleNestedChange('propietario', 'nombre', e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Cédula:</label>
                        <input type="text" value={formData.propietario?.cedula || ''} onChange={(e) => handleNestedChange('propietario', 'cedula', e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Teléfono:</label>
                        <input type="text" value={formData.propietario?.telefonos?.principal || ''} onChange={(e) => handleNestedChange('propietario', 'telefono', e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Email:</label>
                        <input type="email" value={formData.propietario?.correos?.[0] || ''} onChange={(e) => handleNestedChange('propietario', 'correo', e.target.value)} className={inputClasses} />
                    </div>
                </div>
            </fieldset>

            {/* 3. Datos Inquilino */}
            <fieldset className={fieldsetClasses}>
                <legend className={legendClasses}>Datos del Inquilino</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Nombre:</label>
                        <input type="text" value={formData.inquilino?.nombre || ''} onChange={(e) => handleNestedChange('inquilino', 'nombre', e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Cédula:</label>
                        <input type="text" value={formData.inquilino?.cedula || ''} onChange={(e) => handleNestedChange('inquilino', 'cedula', e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Teléfono:</label>
                        <input type="text" value={formData.inquilino?.telefono || ''} onChange={(e) => handleNestedChange('inquilino', 'telefono', e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Email:</label>
                        <input type="email" value={formData.inquilino?.correo || ''} onChange={(e) => handleNestedChange('inquilino', 'correo', e.target.value)} className={inputClasses} />
                    </div>
                </div>
            </fieldset>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700 mt-6">
          <button onClick={onClose} className="py-2 px-6 rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="py-2 px-6 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg">
            <Save className="w-5 h-5" />
            <span>Actualizar Registro</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntidadModal;