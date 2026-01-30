import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, 
    ArrowUp, 
    ArrowDown, 
    Loader2, 
    Landmark,
    Printer,
    MoreVertical,
    ClipboardCopy,
    FileSpreadsheet
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import ModalImprimirBancos from './ModalImprimirBancos';

interface HistorialBancoProps {
    idBanco: number;
}

const LeyendaBancos: React.FC = () => {
    return (
        <div className="flex justify-start items-center space-x-4 text-[10px] uppercase tracking-wider mt-2 mb-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 border border-gray-200">
            <span className="font-bold text-gray-700 dark:text-gray-300">Leyenda:</span>
            <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span className="text-red-600 dark:text-red-400">Salida (Débito)</span>
            </span>
            <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                <span className="text-green-600 dark:text-green-400">Entrada (Crédito)</span>
            </span>
        </div>
    );
};

const HistorialBanco: React.FC<HistorialBancoProps> = ({ idBanco }) => {
    const { user } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú
    const [sortColumn, setSortColumn] = useState<string>('fecha');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    
    // Estados para el Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [loadingModal, setLoadingModal] = useState(false);

    // Clases para el diseño del menú
    const menuItemClasses = "flex items-center space-x-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 w-full transition-colors";
    const menuIconClasses = "w-4 h-4 text-gray-500 dark:text-gray-400";

    const fetchHistorial = useCallback(async () => {
        if (!idBanco) return;
        setLoading(true);
        try {
            const response = await axios.get<any[]>(`https://bknd.condominios-online.com/bancos/cuenta/${idBanco}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            
            if (Array.isArray(response.data) && response.data.length > 0) {
                const firstElement = response.data[0];
                if (firstElement['@res']) {
                    const parsed = JSON.parse(firstElement['@res']);
                    setData(parsed.body || []);
                }
            }
        } catch (error) {
            console.error("Error al obtener historial bancario:", error);
        } finally {
            setLoading(false);
        }
    }, [idBanco, user?.token]);

    useEffect(() => {
        fetchHistorial();
    }, [fetchHistorial]);

    // Función para imprimir el historial completo (Acción del menú)
    const handlePrintHistorial = async () => {
        setIsMenuOpen(false);
        setModalOpen(true);
        setLoadingModal(true);
        try {
            const payload = {
                nombre_funcion: "prepFrmEdoCtaBco", // Ajusta el nombre según tu backend
                usuario: user?.nombreUsuario || "",
                idBanco: idBanco
            };

            const response = await axios.post<{ result?: string }>(`https://bknd.condominios-online.com/entidades/function`, payload, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            console.log("Respuesta de formato de impresión:", response.data);
            if (response.data?.result) {
                setHtmlContent(response.data.result);
            } else {
                setHtmlContent("<p class='text-center p-4'>No se recibió contenido válido del servidor.</p>");
            }
        } catch (error) {
            console.error("Error al generar formato de impresión:", error);
            setHtmlContent("<p class='text-red-500 p-4 font-bold'>Error al conectar con el servidor.</p>");
        } finally {
            setLoadingModal(false);
        }
    };

    const formatMoney = (amount: any) => {
        const value = parseFloat(amount);
        if (value === 0) return '';
        return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    };

    const handleSort = (key: string) => {
        const newOrder = sortColumn === key && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortColumn(key);
        setSortOrder(newOrder);
    };

    const filteredData = data.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    ).sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
    });

    const getSaldoColor = (saldo: number) => {
        if (saldo < 0) return "text-red-600 dark:text-red-400";
        if (saldo > 0) return "text-blue-600 dark:text-blue-400";
        return "text-gray-900 dark:text-white";
    };

    return (
        <div className="flex flex-col h-full space-y-3">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/30 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Landmark size={18} className="text-blue-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Historial de Cuenta</h3>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-2 py-1 border rounded-md text-[11px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 w-32 md:w-64"
                        />
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* MENÚ DE ACCIONES */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(prev => !prev)} 
                            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-52 rounded-md shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-[50] border dark:border-gray-700">
                                <div className="py-1">
                                    <button onClick={() => setIsMenuOpen(false)} className={menuItemClasses}>
                                        <ClipboardCopy className={menuIconClasses} /> <span>Copiar datos</span>
                                    </button>
                                    <button onClick={handlePrintHistorial} className={menuItemClasses}>
                                        <Printer className={menuIconClasses} /> <span>Imprimir Reporte</span>
                                    </button>
                                    <div className="border-t dark:border-gray-700 my-1"></div>
                                    <button onClick={() => setIsMenuOpen(false)} className={menuItemClasses}>
                                        <FileSpreadsheet className={menuIconClasses} /> <span>Exportar Excel</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <LeyendaBancos />
            
            <div className="border rounded-lg overflow-hidden flex-grow dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
                <div className="overflow-auto max-h-[600px]">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0 z-10">
                            <tr>
                                {[
                                    { label: 'Fecha', key: 'fecha', align: 'left' },
                                    { label: 'Ref', key: 'referencia', align: 'left' },
                                    { label: 'Concepto / Detalle', key: 'concepto', align: 'left' },
                                    { label: 'Débito (-)', key: 'debito', align: 'right' },
                                    { label: 'Crédito (+)', key: 'credito', align: 'right' },
                                    { label: 'Saldo', key: 'saldo', align: 'right' },
                                ].map((col) => (
                                    <th 
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        className={`px-3 py-3 text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                                    >
                                        <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                                            {col.label}
                                            {sortColumn === col.key && (sortOrder === 'asc' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-[11px]">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((t, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="px-3 py-3 whitespace-nowrap text-gray-500">{t.fecha}</td>
                                        <td className="px-3 py-3 whitespace-nowrap font-mono font-bold text-blue-600 dark:text-blue-400">{t.referencia}</td>
                                        <td className="px-3 py-3 text-gray-700 dark:text-gray-200 uppercase font-medium">{t.concepto}</td>
                                        <td className="px-3 py-3 text-right text-red-600 font-bold whitespace-nowrap">
                                            {parseFloat(t.debito) > 0 ? `-${formatMoney(t.debito)}` : ''}
                                        </td>
                                        <td className="px-3 py-3 text-right text-green-600 font-bold whitespace-nowrap">
                                            {parseFloat(t.credito) > 0 ? `+${formatMoney(t.credito)}` : ''}
                                        </td>
                                        <td className={`px-3 py-3 text-right font-black whitespace-nowrap bg-gray-50/50 dark:bg-gray-900/20 ${getSaldoColor(parseFloat(t.saldo))}`}>
                                            {formatMoney(t.saldo)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-20 text-center text-gray-400 italic">No hay movimientos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <ModalImprimirBancos 
                    isOpen={modalOpen} 
                    onClose={() => {
                        setModalOpen(false);
                        setHtmlContent(null);
                    }} 
                    htmlContent={htmlContent}
                    loading={loadingModal}
                />
            </div>
        </div>
    );
};

export default HistorialBanco;