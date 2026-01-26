import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, 
    ArrowUp, 
    ArrowDown, 
    Loader2, 
    Landmark,
    Printer // Importamos el icono de impresora
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
    const [sortColumn, setSortColumn] = useState<string>('fecha');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    
    // Estados para el Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [loadingModal, setLoadingModal] = useState(false);

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

    // Función para obtener el HTML de la API e imprimir
    const handleOpenModal = async (movimientoId: string) => {
        setModalOpen(true);
        setLoadingModal(true);
        try {
            // REEMPLAZAR CON TU RUTA DE API PARA EL FORMATO HTML
            const response = await axios.get<any>(`https://bknd.condominios-online.com/bancos/formato-impresion/${movimientoId}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            
            // Suponiendo que la API devuelve el HTML directamente o dentro de un objeto
            setHtmlContent(response.data.html || response.data); 
        } catch (error) {
            console.error("Error al obtener formato de impresión:", error);
            setHtmlContent("<p className='text-red-500'>Error al cargar el formato.</p>");
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
                
                <div className="flex items-center gap-2">
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
                                    { label: '', key: 'actions', align: 'center' }, // Columna para el botón
                                ].map((col) => (
                                    <th 
                                        key={col.key}
                                        onClick={() => col.key !== 'actions' && handleSort(col.key)}
                                        className={`px-3 py-3 text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 ${col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700' : ''} ${col.align === 'right' ? 'text-right' : 'text-left'}`}
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
                                    <td colSpan={7} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td>
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
                                        <td className="px-3 py-3 text-center">
                                            <button 
                                                onClick={() => handleOpenModal(t.id)}
                                                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md transition-colors"
                                                title="Imprimir comprobante"
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-20 text-center text-gray-400 italic">No hay movimientos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Integración del Modal */}
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