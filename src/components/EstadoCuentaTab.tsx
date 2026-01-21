import React, { useState, useEffect, useCallback } from 'react';
import { Search, MoreVertical, ClipboardCopy, Printer, FileSpreadsheet, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Asumiendo que usas un context para el token

interface EstadoCuentaTabProps {
    idEntidad: number;
}

// Componente Leyenda (Mantenido exactamente igual)
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

const EstadoCuentaTab: React.FC<EstadoCuentaTabProps> = ({ idEntidad }) => {
    const { user } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sortColumn, setSortColumn] = useState<number | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Clases comunes para el menú
    const menuItemClasses = "flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700";
    const menuIconClasses = "w-4 h-4 text-gray-600 dark:text-gray-400";

    // Petición a la API
        interface ApiResponse<T> {
            status: string;
            body: T;
        }
    
        const fetchEstadoCuenta = useCallback(async () => {
            setLoading(true);
            try {
                const response = await axios.get<ApiResponse<any[]>>(`https://bknd.condominios-online.com/entidades/cuenta/${idEntidad}`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                if (response.data?.status === "success") {
                    setData(response.data.body ?? []);
                }
            } catch (error) {
                console.error("Error al obtener estado de cuenta:", error);
            } finally {
                setLoading(false);
            }
        }, [idEntidad, user?.token]);

    useEffect(() => {
        fetchEstadoCuenta();
    }, [fetchEstadoCuenta]);

    const formatMoney = (amount: any) => {
        const value = parseFloat(String(amount).replace(/[^0-9.-]+/g, ""));
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(isNaN(value) ? 0 : value);
    };

    const handleSort = (columnIndex: number) => {
        const newOrder = sortColumn === columnIndex && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortColumn(columnIndex);
        setSortOrder(newOrder);
    };

    const sortedData = [...data].sort((a, b) => {
        if (sortColumn === null) return 0;
        const keys = ['fecha', 'clase', 'referencia', 'concepto', 'debito', 'credito', 'saldo'];
        const key = keys[sortColumn];
        
        let aVal = a[key];
        let bVal = b[key];
        
        let comparison = 0;
        if (['debito', 'credito', 'saldo'].includes(key)) {
            comparison = parseFloat(aVal) - parseFloat(bVal);
        } else {
            comparison = String(aVal).localeCompare(String(bVal));
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const filteredData = sortedData.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    
    const getSaldoClass = (saldoValue: any): string => {
        const saldoNum = parseFloat(String(saldoValue));
        if (saldoNum > 0) return "text-red-600 dark:text-red-400"; 
        if (saldoNum < 0) return "text-blue-600 dark:text-blue-400";
        return "text-gray-900 dark:text-gray-50";
    };

    const renderSortIcon = (columnIndex: number) => {
        if (sortColumn !== columnIndex) return null;
        return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-gray-800 dark:text-gray-200" /> : <ArrowDown className="w-3 h-3 ml-1 text-gray-800 dark:text-gray-200" />;
    };

    const handleAction = (action: string) => {
        console.log(`Acción de Estado de Cuenta: ${action}`);
        setIsMenuOpen(false);
    };

    return (
        <div className="flex flex-col h-full space-y-2">
            <h3 className="text-lg font-bold text-center text-gray-700 dark:text-gray-100 mb-2">Estado de Cuenta</h3>
            
            <div className="flex justify-between items-center">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Buscar transacción..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-2 py-1 border rounded-lg text-sm focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>
                    <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10 ${isMenuOpen ? '' : 'hidden'}`}>
                        <div className="py-1">
                            <button onClick={() => handleAction('copy')} className={`w-full ${menuItemClasses}`}>
                                <ClipboardCopy className={menuIconClasses} /> <span>Copiar al portapapeles</span>
                            </button>
                            <button onClick={() => handleAction('print')} className={`w-full ${menuItemClasses}`}>
                                <Printer className={menuIconClasses} /> <span>Imprimir</span>
                            </button>
                            <div className="border-t dark:border-gray-600"></div>
                            <button className={`w-full ${menuItemClasses}`}>
                                <FileSpreadsheet className={menuIconClasses} /> <span>Exportar a Excel</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <LeyendaEdoCta />
            
            <div className="border rounded-lg overflow-auto flex-grow dark:border-gray-600">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <table id="tablaEstadoCuenta" className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                            <tr>
                                {[
                                    { title: 'Fecha', col: 0 },
                                    { title: 'Clase', col: 1 },
                                    { title: 'Referencia', col: 2 },
                                    { title: 'Concepto', col: 3, sortable: false },
                                    { title: 'Débitos ($)', col: 4 },
                                    { title: 'Créditos ($)', col: 5 },
                                    { title: 'Saldo ($)', col: 6 },
                                ].map(({ title, col, sortable = true }) => (
                                    <th 
                                        key={col} 
                                        className={`px-2 py-2 text-xs font-medium uppercase tracking-wider ${col < 4 ? 'text-left' : 'text-right'} text-gray-500 dark:text-gray-300 ${sortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600' : ''}`}
                                        onClick={() => sortable && handleSort(col)}
                                    >
                                        <div className={`flex items-center ${col < 4 ? 'justify-start' : 'justify-end'} space-x-1`}>
                                            <span>{title}</span> {renderSortIcon(col)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-xs dark:text-gray-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((t, index) => (
                                    <tr key={t.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                        <td className="px-2 py-2 whitespace-nowrap">{t.fecha}</td>
                                        <td className="px-2 py-2 whitespace-nowrap">{t.clase}</td>
                                        <td className="px-2 py-2 whitespace-nowrap">{t.referencia || '-'}</td>
                                        <td className="px-2 py-2">{t.concepto}</td>
                                        <td className="px-2 py-2 text-right font-medium text-red-600 whitespace-nowrap">{formatMoney(t.debito)}</td>
                                        <td className="px-2 py-2 text-right font-medium text-green-600 whitespace-nowrap">{formatMoney(t.credito)}</td>
                                        <td className={`px-2 py-2 text-right font-bold whitespace-nowrap ${getSaldoClass(t.saldo)}`}>{formatMoney(t.saldo)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">No se encontraron transacciones.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EstadoCuentaTab;