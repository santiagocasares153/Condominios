// src/components/BitacoraTab.tsx

import React, { useState } from 'react';
import { Search, MoreVertical, FileSpreadsheet, FileText, ClipboardCopy, Printer, Mail } from 'lucide-react';
// Nota: objBitacora no es usado aquí, solo 'data'
// import { objBitacora } from '../data/mockData'; 

interface BitacoraTabProps {
    data: { fecha: string, detalle: string }[];
}

const BitacoraTab: React.FC<BitacoraTabProps> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const filteredData = data.filter(row =>
        Object.values(row).some(value =>
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleAction = (action: string) => {
        console.log(`Acción de Bitácora: ${action}`);
        setIsMenuOpen(false);
        // Lógica de simulación de copia/impresión para Bitácora
        if (action === 'copy') {
            alert('Bitácora copiada al portapapeles (simulado).');
        } else if (action === 'print') {
            alert('Bitácora impresa (simulado).');
        } else if (action === 'email') {
            alert('Bitácora enviada por email (simulado).');
        }
    };

    // Usaremos un estilo consistente para los elementos del menú (a)
    const menuItemClasses = "flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700";
    const menuIconClasses = "w-4 h-4 text-gray-600 dark:text-gray-400";

    return (
        <div className="flex flex-col h-full space-y-2">
            {/* Título: Color claro en modo oscuro */}
            <h3 className="text-lg font-bold text-center text-gray-700 dark:text-gray-100 mb-2">Bitácora de Eventos</h3>
            
            {/* Header con búsqueda y menú */}
            <div className="flex justify-between items-center">
                <div className="relative">
                    {/* Input de búsqueda: Color de fondo y borde adaptativo, texto claro */}
                    <input 
                        id="bitacoraSearchInput" 
                        type="text" 
                        placeholder="Buscar en bitácora..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-2 py-1 border rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                    {/* Icono de búsqueda: Color más claro en modo oscuro */}
                    <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400" />
                </div>
                
                {/* Menú de acciones Kebab */}
                <div className="relative">
                    {/* Botón: Fondo de hover y color de icono adaptativo */}
                    <button onClick={() => setIsMenuOpen(prev => !prev)} id="bitacora-actions-button" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>
                    {/* Menú: Fondo blanco, sombra, borde y texto adaptativos */}
                    <div id="bitacora-actions-menu" className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 z-10 ${isMenuOpen ? '' : 'hidden'}`}>
                        <div className="py-1">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleAction('copy'); }} className={menuItemClasses}>
                                <ClipboardCopy className={menuIconClasses} />
                                <span>Copiar al portapapeles</span>
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleAction('print'); }} className={menuItemClasses}>
                                <Printer className={menuIconClasses} />
                                <span>Imprimir</span>
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleAction('email'); }} className={menuItemClasses}>
                                <Mail className={menuIconClasses} />
                                <span>Enviar por Email</span>
                            </a>
                            {/* Separador: Color adaptativo */}
                            <div className="border-t my-1 dark:border-gray-600"></div>
                            <a href="#" onClick={(e) => e.preventDefault()} className={menuItemClasses}>
                                <FileSpreadsheet className={menuIconClasses} />
                                <span>Exportar a Excel (Simulado)</span>
                            </a>
                            <a href="#" onClick={(e) => e.preventDefault()} className={menuItemClasses}>
                                <FileText className={menuIconClasses} />
                                <span>Exportar a PDF (Simulado)</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Contenedor de la tabla: Bordes adaptativos */}
            <div className="border rounded-lg overflow-auto flex-grow dark:border-gray-600">
                <table id="bitacoraTable" className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    {/* Encabezado de la tabla: Fondo y texto adaptativos */}
                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/4">Fecha</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-3/4">Detalle</th>
                        </tr>
                    </thead>
                    {/* Cuerpo de la tabla: Fondo, texto y divisor de fila adaptativos */}
                    <tbody id="bitacoraBody" className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600 text-xs dark:text-gray-100">
                        {filteredData.length > 0 ? (
                            filteredData.map((entrada, index) => (
                                <tr 
                                    key={index} 
                                    // Filas alternadas: bg-white/bg-gray-50 en claro, bg-gray-800/bg-gray-750 en oscuro
                                    className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                                >
                                    <td className="px-4 py-2 whitespace-nowrap">{entrada.fecha}</td>
                                    <td className="px-4 py-2">{entrada.detalle}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">No se encontraron registros.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BitacoraTab;