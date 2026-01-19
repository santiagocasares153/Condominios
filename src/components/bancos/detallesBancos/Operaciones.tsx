import React, { useState, useEffect, useCallback, useRef } from 'react';
import { XCircle, Save, Loader2, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import NavigationMenu from '../../Menu';

// --- Interfaces ---
interface Banco { Nombre: string; Codigo: string; }
interface CuentaDestino { id: number; nombre: string; datos: { numeroCuenta: string; }; }

interface OperacionesBancosTabProps {
    idEntidad: number;
    tasaOficial: number;
    periodoActual?: { periodo: number; año: number };
    onSaveOperacion?: (data: any) => void;
}

const initialFormData = {
    fecha: new Date().toISOString().split('T')[0],
    fechaTasa: new Date().toISOString().split('T')[0],
    concepto: '',
    montoBs: '', // Se guardará como string formateado para la vista
    montoUsd: '',
    comentario: '',
    bancoOrigen: '',
    bancoDestino: '',
    referencia: '',
};

export const Operaciones: React.FC<OperacionesBancosTabProps> = ({ 
    idEntidad, 
    tasaOficial, 
    onSaveOperacion 
}) => {
    const { user } = useAuth();
    const [tipoOp, setTipoOp] = useState<'DB' | 'CR'>('DB'); 
    const [formData, setFormData] = useState(initialFormData);
    const [tasaCargada, setTasaCargada] = useState<number>(tasaOficial);
    const [isLoadingTasa, setIsLoadingTasa] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [listaBancos, setListaBancos] = useState<Banco[]>([]);
    const [listaCuentasDestino, setListaCuentasDestino] = useState<CuentaDestino[]>([]);
    const [isLoadingBancos, setIsLoadingBancos] = useState(false);
    const [isLoadingCuentas, setIsLoadingCuentas] = useState(false);
    
    const dateTasaRef = useRef<HTMLInputElement>(null);
    const dateOpRef = useRef<HTMLInputElement>(null);

    // --- Funciones de Formateo ---
    const formatVisualNumber = (value: string) => {
        if (!value) return '';
        // Elimina todo lo que no sea número o punto
        const cleanValue = value.replace(/\D/g, "");
        // Formatea con puntos de miles y coma decimal (estilo local)
        const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        return new Intl.NumberFormat('de-DE', options).format(parseFloat(cleanValue) / 100);
    };

    const unformatNumber = (value: string): number => {
        if (!value) return 0;
        // Convierte "1.250,50" -> "1250.50"
        return parseFloat(value.replace(/\./g, '').replace(',', '.'));
    };

    // --- Lógica de Cálculos ---
    const calcularEquivalencia = (montoBsFormatted: string, tasa: number) => {
        const numBs = unformatNumber(montoBsFormatted);
        return (numBs > 0 && tasa > 0) ? (numBs / tasa).toFixed(2) : '';
    };

    // --- Peticiones API (Bancos) ---
    useEffect(() => {
        const fetchBancos = async () => {
            setIsLoadingBancos(true);
            try {
                const response = await axios.get<any[]>('https://bknd.condominios-online.com/bancos/auxiliar/list');
                if (response.data?.[0]?.['@res']) {
                    const dataParsed = JSON.parse(response.data[0]['@res']);
                    if (dataParsed.body) setListaBancos(dataParsed.body);
                }
            } catch (e) { console.error(e); } finally { setIsLoadingBancos(false); }
        };
        const fetchCuentas = async () => {
            setIsLoadingCuentas(true);
            try {
                const response = await axios.get<any>('https://bknd.condominios-online.com/bancos');
                if (response.data?.data?.[0]?.['@res']) {
                    const resParsed = JSON.parse(response.data.data[0]['@res']);
                    if (resParsed.body) setListaCuentasDestino(resParsed.body);
                }
            } catch (e) { console.error(e); } finally { setIsLoadingCuentas(false); }
        };
        fetchBancos(); fetchCuentas();
    }, []);

    const fetchTasaPorFecha = useCallback(async (fecha: string) => {
        setIsLoadingTasa(true);
        try {
            const response = await axios.get<{ dolar?: string }>(`https://svg.iot-ve.online/rateExchange/date/${fecha}/dolar`, {
                headers: { 'x-api-key': '**123LosPataLisa2026456**', 'Content-Type': 'application/json' }
            });
            if (response.data?.dolar) {
                const valorDolar = parseFloat(response.data.dolar.replace(',', '.').trim());
                setTasaCargada(valorDolar);
                setFormData(prev => ({ ...prev, montoUsd: calcularEquivalencia(prev.montoBs, valorDolar) }));
            }
        } catch (e) { setTasaCargada(tasaOficial); } finally { setIsLoadingTasa(false); }
    }, [tasaOficial]);

    useEffect(() => { fetchTasaPorFecha(formData.fechaTasa); }, [fetchTasaPorFecha]);

    // --- Manejadores de Input ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;

        if (id === 'montoBs') {
            const formatted = formatVisualNumber(value);
            setFormData(prev => ({
                ...prev,
                montoBs: formatted,
                montoUsd: calcularEquivalencia(formatted, tasaCargada)
            }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
            if (id === 'fechaTasa') fetchTasaPorFecha(value);
        }
    };
    
    const handleProcesarOperacion = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const dataFinal = {
            idEntidad: idEntidad,
            clase: tipoOp,
            concepto: formData.concepto,
            fechaCobro: formData.fecha,
            fechaTasa: formData.fechaTasa,
            tasa: tasaCargada,
            montoCobroBs: unformatNumber(formData.montoBs), // Enviamos número real
            montoUsdRef: parseFloat(formData.montoUsd),
            observacionesCobro: formData.comentario,
            bancoOrigen: formData.bancoOrigen,
            bancoDestino: formData.bancoDestino,
            referenciaCobro: formData.referencia,
            moneda: 'Bs',
            idUsuario: user?.id || 'Sistema',
            formaPago: "TRANSFERENCIA",
        };
        
        try {
            await axios.post('https://bknd.condominios-online.com/transacciones/', dataFinal, {
                headers: { Authorization: `Bearer ${user?.token}`, "Content-Type": "application/json" }
            });
            if (onSaveOperacion) onSaveOperacion(dataFinal);
            setFormData(initialFormData);
            alert(`Operación registrada exitosamente.`);
        } catch (error) {
            alert("Error al procesar la transacción.");
        } finally { setIsSubmitting(false); }
    };

    const inputClasses = "mt-1 w-full p-2 border rounded-md text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 text-sm";
    const labelClasses = "block font-medium text-gray-700 dark:text-gray-300 text-xs";

    return (
        <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto">
          
            <div className={`p-3 rounded-lg border text-center ${tipoOp === 'DB' ? 'bg-red-50 border-red-100 dark:bg-red-900/20' : 'bg-green-50 border-green-100 dark:bg-green-900/20'}`}>
                <h3 className={`text-lg font-bold ${tipoOp === 'DB' ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>
                    {tipoOp === 'DB' ? 'Operación de Débito Bancario' : 'Operación de Crédito Bancario'}
                </h3>
            </div>

            <form onSubmit={handleProcesarOperacion} className="max-w-xl mx-auto space-y-3 w-full">
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl justify-center">
                    <button type="button" onClick={() => setTipoOp('DB')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tipoOp === 'DB' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>DÉBITO</button>
                    <button type="button" onClick={() => setTipoOp('CR')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tipoOp === 'CR' ? 'bg-green-600 text-white' : 'text-gray-500'}`}>CRÉDITO</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Fecha Operación</label>
                        <div className="relative mt-1 cursor-pointer" onClick={() => dateOpRef.current?.showPicker()}>
                            <input type="text" value={formData.fecha} className={`${inputClasses} text-center font-bold`} readOnly />
                            <input type="date" id="fecha" ref={dateOpRef} value={formData.fecha} onChange={handleInputChange} className="absolute opacity-0 inset-0 w-full cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Tasa de Cambio</label>
                        <div className="relative mt-1 cursor-pointer" onClick={() => dateTasaRef.current?.showPicker()}>
                            <input type="text" value={isLoadingTasa ? "..." : `${tasaCargada.toFixed(4)} Bs`} className={`${inputClasses} text-center font-bold text-blue-600`} readOnly />
                            <input type="date" id="fechaTasa" ref={dateTasaRef} value={formData.fechaTasa} onChange={handleInputChange} className="absolute opacity-0 inset-0 w-full cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Banco Origen</label>
                        <select id="bancoOrigen" value={formData.bancoOrigen} onChange={handleInputChange} className={inputClasses}>
                            <option value="">-- Seleccione --</option>
                            {listaBancos.map(b => <option key={b.Codigo} value={b.Nombre.trim()}>{b.Nombre.trim()}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Referencia</label>
                        <input type="text" id="referencia" value={formData.referencia} onChange={handleInputChange} className={inputClasses} placeholder="Nro Operación" required />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Cuenta Destino (Nuestra)</label>
                    <select id="bancoDestino" value={formData.bancoDestino} onChange={handleInputChange} className={inputClasses}>
                        <option value="">-- Seleccione --</option>
                        {listaCuentasDestino.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre} - {c.datos.numeroCuenta.slice(-4)}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClasses}>Concepto</label>
                    <input type="text" id="concepto" value={formData.concepto} onChange={handleInputChange} className={inputClasses} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`${labelClasses} text-blue-700`}>Monto Bs.</label>
                        <input 
                            type="text" 
                            id="montoBs" 
                            value={formData.montoBs} 
                            onChange={handleInputChange} 
                            className={`${inputClasses} font-bold border-blue-300 text-right`} 
                            placeholder="0,00" 
                            required 
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Equiv. USD ($)</label>
                        <input type="text" value={formData.montoUsd} className="w-full p-2 border rounded-md text-right bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium" readOnly />
                    </div>
                </div>

                <div className="flex justify-center space-x-4 pt-2">
                    <button type="button" onClick={() => setFormData(initialFormData)} className="py-2 px-6 rounded-lg bg-gray-500 text-white flex items-center space-x-2"><XCircle size={18} /> <span>Limpiar</span></button>
                    <button type="submit" disabled={isSubmitting || !formData.montoBs} className={`py-2 px-6 rounded-lg text-white flex items-center space-x-2 ${tipoOp === 'DB' ? 'bg-red-600' : 'bg-green-600'}`}>
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>Grabar Operación</span>
                    </button>
                </div>
            </form>
        </div>
    );
};