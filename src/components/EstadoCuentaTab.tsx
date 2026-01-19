// src/components/EstadoCuentaTab.tsx

import React, { useState } from 'react';
import { Search, MoreVertical, ClipboardCopy, Printer, Mail, FileText, FileSpreadsheet, ArrowUp, ArrowDown } from 'lucide-react';
import { TransaccionEcta } from '../types/types';

interface EstadoCuentaTabProps {
    data: TransaccionEcta[];
}

// Componente Leyenda
const LeyendaEdoCta: React.FC = () => {
    return (
        <div className="flex justify-start items-center space-x-4 text-sm mt-2 mb-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 border border-gray-200">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Leyenda:</span>
            <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span className="text-red-600 dark:text-red-400">Deuda (Saldo Negativo)</span>
            </span>
            <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-blue-600 dark:text-blue-400">A Favor (Saldo Positivo)</span>
            </span>
            <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-gray-900 dark:bg-gray-50"></span>
                <span className="text-gray-900 dark:text-gray-50">Saldado </span>
            </span>
        </div>
    );
};


const EstadoCuentaTab: React.FC<EstadoCuentaTabProps> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sortColumn, setSortColumn] = useState<number | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Clases comunes para el menú
    const menuItemClasses = "flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700";
    const menuIconClasses = "w-4 h-4 text-gray-600 dark:text-gray-400";

    const handleSort = (columnIndex: number, _dataType: string) => {
        const newOrder = sortColumn === columnIndex && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortColumn(columnIndex);
        setSortOrder(newOrder);
    };

    const sortedData = [...data].sort((a, b) => {
        if (sortColumn === null) return 0;
        
        // Columna 0: Fecha, Columna 4: Débitos, Columna 5: Créditos, Columna 6: Saldo
        const keys: (keyof TransaccionEcta)[] = ['fecha', 'tipo', 'referencia', 'concepto', 'debitos', 'creditos', 'saldo'];
        const key = keys[sortColumn];
        if (!key) return 0;

        // Aseguramos que los valores sean tratados como strings o numbers para la comparación
        let aVal = a[key as keyof TransaccionEcta];
        let bVal = b[key as keyof TransaccionEcta];
        
        let comparison = 0;
        
        if (['debitos', 'creditos', 'saldo'].includes(key as string)) { // Columna de números (Débito, Crédito, Saldo)
            // Se asume que los valores de débito/crédito/saldo son strings con formato monetario (ej: $1,200.00)
            const numA = parseFloat(String(aVal).replace('$', '').replace(',', ''));
            const numB = parseFloat(String(bVal).replace('$', '').replace(',', ''));
            comparison = numA - numB;
        } else if (key === 'fecha') { // Columna de Fecha (formato dd/mm/yyyy)
            const [dA, mA, yA] = String(aVal).split('/').map(Number);
            const dateA = new Date(yA, mA - 1, dA).getTime();
            const [dB, mB, yB] = String(bVal).split('/').map(Number);
            const dateB = new Date(yB, mB - 1, dB).getTime();
            comparison = dateA - dateB;
        } else { // Columna de texto
            comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const filteredData = sortedData.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    
    // Función para determinar la clase del saldo
    const getSaldoClass = (saldoString: string): string => {
        // Se asume que el saldo puede venir como string monetario (ej: $100.00 o -$50.00)
        const saldoNum = parseFloat(saldoString.replace('$', '').replace(',', ''));
        
        if (saldoNum < 0) {
            return "text-red-600 dark:text-red-400"; // Deuda (Rojo)
        } else if (saldoNum > 0) {
            return "text-blue-600 dark:text-blue-400"; // A Favor (Azul)
        } else {
            return "text-gray-900 dark:text-gray-50"; // Saldado (Negro/Gris Oscuro)
        }
    };

    // Función para renderizar el icono de ordenación
    const renderSortIcon = (columnIndex: number) => {
        if (sortColumn !== columnIndex) return null;
        return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-gray-800 dark:text-gray-200" /> : <ArrowDown className="w-3 h-3 ml-1 text-gray-800 dark:text-gray-200" />;
    };

    // Acciones simuladas
    const handleAction = (action: string) => {
        console.log(`Acción de Estado de Cuenta: ${action}`);
        setIsMenuOpen(false);
        // Lógica de simulación
    };

    return (
        <div className="flex flex-col h-full space-y-2">
            {/* Título */}
            <h3 className="text-lg font-bold text-center text-gray-700 dark:text-gray-100 mb-2">Estado de Cuenta</h3>
            
            {/* Header con búsqueda y menú */}
            <div className="flex justify-between items-center">
                <div className="relative">
                    <input 
                        id="searchInput" 
                        type="text" 
                        placeholder="Buscar transacción..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-2 py-1 border rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                    <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                
                {/* Menú de acciones Kebab */}
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(prev => !prev)} id="ecta-actions-button" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>
                    {/* Contenedor del menú */}
                    <div id="ecta-actions-menu" className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 z-10 ${isMenuOpen ? '' : 'hidden'}`}>
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

            {/* LEYENDA AÑADIDA AQUÍ */}
            <LeyendaEdoCta />
            
            {/* Contenedor de la tabla */}
            <div className="border rounded-lg overflow-auto flex-grow dark:border-gray-600">
                <table id="tablaEstadoCuenta" className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    {/* Encabezado de la tabla */}
                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                        <tr>
                            {[
                                { title: 'Fecha', col: 0, type: 'date' },
                                { title: 'Tipo', col: 1, type: 'string' },
                                { title: 'Referencia', col: 2, type: 'string' },
                                { title: 'Concepto', col: 3, type: 'string', sortable: false },
                                { title: 'Débitos ($)', col: 4, type: 'number' },
                                { title: 'Créditos ($)', col: 5, type: 'number' },
                                { title: 'Saldo ($)', col: 6, type: 'number' },
                            ].map(({ title, col, type, sortable = true }) => (
                                <th 
                                    key={col} 
                                    scope="col" 
                                    className={`px-2 py-2 text-xs font-medium uppercase tracking-wider ${col < 4 ? 'text-left' : 'text-right'} text-gray-500 dark:text-gray-300 ${sortable ? 'cursor-pointer sortable-header hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors' : ''}`}
                                    onClick={() => sortable && handleSort(col, type)}
                                >
                                    <div className={`flex items-center ${col < 4 ? 'justify-start' : 'justify-end'} space-x-1`}>
                                        <span>{title}</span> {renderSortIcon(col)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {/* Cuerpo de la tabla */}
                    <tbody id="estadoCuentaBody" className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-xs dark:text-gray-100">
                        {filteredData.length > 0 ? (
                            filteredData.map((t, index) => (
                                <tr 
                                    key={t.id} 
                                    className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                                >
                                    <td className="px-2 py-2 whitespace-nowrap">{t.fecha}</td>
                                    <td className="px-2 py-2 whitespace-nowrap">{t.tipo}</td>
                                    <td className="px-2 py-2 whitespace-nowrap">{t.referencia}</td>
                                    <td className="px-2 py-2">{t.concepto}</td>
                                    {/* Colores de débito/crédito */}
                                    <td className="px-2 py-2 text-right font-medium text-red-600 whitespace-nowrap">{t.debitos}</td>
                                    <td className="px-2 py-2 text-right font-medium text-green-600 whitespace-nowrap">{t.creditos}</td>
                                    {/* CLASE DE SALDO APLICADA AQUÍ */}
                                    <td className={`px-2 py-2 text-right font-bold whitespace-nowrap ${getSaldoClass(t.saldo)}`}>{t.saldo}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">No se encontraron transacciones.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EstadoCuentaTab;