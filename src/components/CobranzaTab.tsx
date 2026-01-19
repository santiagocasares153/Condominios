import React, { useState, useEffect, useCallback, useRef } from 'react';
import { XCircle, CheckSquare, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Banco {
    Nombre: string;
    Codigo: string;
}

interface CuentaDestino {
    id: number;
    nombre: string;
    datos: {
        numeroCuenta: string;
    };
}

interface CobranzaTabProps {
    idEntidad: number;
    tasaOficial: number;
    periodoActual: { periodo: number, año: number };
    onSaveCobranza: (data: any) => void;
    formasPago?: string[];
    cuentas: string[];
}

// Mapeo para mostrar nombre completo pero manejar abreviación
const MAPA_FORMAS_PAGO = [
    { label: 'Transferencia', value: 'TRF' },
    { label: 'Pago Móvil', value: 'PMV' },
    { label: 'Cheque', value: 'CHQ' },
    { label: 'Depósito', value: 'DEP' },
    { label: 'Efectivo', value: 'EFC' }
];

const initialFormData = {
    cobranza: {
        formaPago: '',
        referenciaCobro: '',
        bancoOrigen: '',
        bancoDestino: '',
        montoCobroBs: '',
        montoReferenciaUsd: '',
        moneda: 'USD',
        monedaBanco: 'VES',
        observacionesCobro: '',
        fechaTasa: new Date().toISOString().split('T')[0],
        fechaCobro: new Date().toISOString().split('T')[0], // Nueva fecha de cobro
    }
};

const CobranzaTab: React.FC<CobranzaTabProps> = ({ 
    idEntidad,
    tasaOficial, 
    periodoActual, 
    onSaveCobranza 
}) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState(initialFormData);
    const [isFormValid, setIsFormValid] = useState(false);
    const [tasaCargada, setTasaCargada] = useState<number>(tasaOficial);
    const [isLoadingTasa, setIsLoadingTasa] = useState(false);
    const [listaBancos, setListaBancos] = useState<Banco[]>([]);
    const [listaCuentasDestino, setListaCuentasDestino] = useState<CuentaDestino[]>([]);
    const [isLoadingBancos, setIsLoadingBancos] = useState(false);
    const [isLoadingCuentas, setIsLoadingCuentas] = useState(false);
    const dateTasaRef = useRef<HTMLInputElement>(null);
    const dateCobroRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchBancos = async () => {
            setIsLoadingBancos(true);
            try {
                const response = await axios.get<any[]>('https://bknd.condominios-online.com/bancos/auxiliar/list');
                if (Array.isArray(response.data) && response.data.length > 0) {
                    const primerElemento = response.data[0];
                    if (primerElemento['@res']) {
                        const dataParsed = JSON.parse(primerElemento['@res']);
                        if (dataParsed.body && Array.isArray(dataParsed.body)) setListaBancos(dataParsed.body);
                    }
                }
            } catch (error) { console.error(error); } finally { setIsLoadingBancos(false); }
        };
        fetchBancos();
    }, []);

    useEffect(() => {
        const fetchCuentasDestino = async () => {
            setIsLoadingCuentas(true);
            try {
                const response = await axios.get<any>('https://bknd.condominios-online.com/bancos');
                if (response.data?.data?.[0]?.['@res']) {
                    const resParsed = JSON.parse(response.data.data[0]['@res']);
                    if (resParsed.body && Array.isArray(resParsed.body)) setListaCuentasDestino(resParsed.body);
                }
            } catch (error) { console.error(error); } finally { setIsLoadingCuentas(false); }
        };
        fetchCuentasDestino();
    }, []);

    const calcularEquivalencia = (montoBs: string, tasa: number) => {
        const bs = parseFloat(montoBs);
        return (!isNaN(bs) && tasa > 0) ? (bs / tasa).toFixed(2) : '';
    };

    const fetchTasaPorFecha = useCallback(async (fecha: string) => {
        setIsLoadingTasa(true);
        try {
            const response = await axios.get<{ dolar?: string }>(`https://svg.iot-ve.online/rateExchange/date/${fecha}/dolar`, {
                headers: { 'x-api-key': '**123LosPataLisa2026456**', 'Content-Type': 'application/json' }
            });
            if (response.data?.dolar) {
                const valorDolar = parseFloat(response.data.dolar.replace(',', '.').trim());
                if (!isNaN(valorDolar)) {
                    setTasaCargada(valorDolar);
                    setFormData(prev => ({
                        ...prev,
                        cobranza: {
                            ...prev.cobranza,
                            fechaTasa: fecha,
                            montoReferenciaUsd: calcularEquivalencia(prev.cobranza.montoCobroBs, valorDolar)
                        }
                    }));
                }
            }
        } catch (error) { setTasaCargada(tasaOficial); } finally { setIsLoadingTasa(false); }
    }, [tasaOficial]);

    useEffect(() => { fetchTasaPorFecha(formData.cobranza.fechaTasa); }, [fetchTasaPorFecha]);

    useEffect(() => {
        const c = formData.cobranza;
        const esEfectivo = c.formaPago === 'EFEC';
        const camposBasicos = c.formaPago !== '' && c.montoCobroBs !== '' && c.bancoDestino !== '' && c.fechaCobro !== '';
        const camposBancarios = esEfectivo ? true : (c.bancoOrigen !== '' && c.referenciaCobro !== '');
        setIsFormValid(camposBasicos && camposBancarios);
    }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => {
            const newCobranza = { ...prev.cobranza, [id]: value };
            if (id === 'montoCobroBs') newCobranza.montoReferenciaUsd = calcularEquivalencia(value, tasaCargada);
            return { ...prev, cobranza: newCobranza };
        });
        if (id === 'fechaTasa') fetchTasaPorFecha(value);
    };

    const handleProcesarCobro = () => {
        const dataFinal = {
            ...formData.cobranza,
          //  tipo: 'COB',
            idEntidad: idEntidad,
            montoBs: parseFloat(formData.cobranza.montoCobroBs),
            montoUsdRef: parseFloat(formData.cobranza.montoReferenciaUsd),
            clase: 'COB',
            moneda: 'Bs',
            tasa: tasaCargada,
            idUsuario: user?.id || 'Sistema'
        };
        
        onSaveCobranza({ cobranza: dataFinal });
        setFormData(initialFormData);
    };

    const inputClasses = "mt-1 w-full p-2 border rounded-md text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 text-sm";
    const labelClasses = "block font-medium text-gray-700 dark:text-gray-300 text-xs";

    return (
        <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300">Registro de Cobranza (Bolívares)</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400">ID Entidad: {idEntidad} | Año: {periodoActual.año}</p>
            </div>
            
            <form className="max-w-xl mx-auto space-y-3 w-full">
                <div className="grid grid-cols-2 gap-4">
                    {/* Fecha del Cobro Real */}
                    <div>
                        <label className={labelClasses}>Fecha del Cobro</label>
                        <div className="relative mt-1 cursor-pointer" onClick={() => dateCobroRef.current?.showPicker()}>
                            <input type="text" value={formData.cobranza.fechaCobro} 
                                className={`${inputClasses} text-center font-bold`} readOnly />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"><Calendar size={16}/></div>
                            <input type="date" id="fechaCobro" ref={dateCobroRef} value={formData.cobranza.fechaCobro} 
                                onChange={handleInputChange} className="absolute opacity-0 inset-0 w-full h-full cursor-pointer" />
                        </div>
                    </div>

                    {/* Tasa de Cambio */}
                    <div>
                        <label className={labelClasses}>Tasa (Bs./$ por fecha)</label>
                        <div className="relative mt-1 cursor-pointer" onClick={() => dateTasaRef.current?.showPicker()}>
                            <input type="text" value={isLoadingTasa ? "Cargando..." : `${tasaCargada.toFixed(4)} Bs`} 
                                className={`${inputClasses} text-center font-bold text-blue-600 bg-blue-50/50`} readOnly />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"><Calendar size={16}/></div>
                            <input type="date" id="fechaTasa" ref={dateTasaRef} value={formData.cobranza.fechaTasa} 
                                onChange={handleInputChange} className="absolute opacity-0 inset-0 w-full h-full cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Forma de Pago</label>
                        <select id="formaPago" value={formData.cobranza.formaPago} onChange={handleInputChange} className={inputClasses}>
                            <option value="">-- Seleccione --</option>
                            {MAPA_FORMAS_PAGO.map(fp => <option key={fp.value} value={fp.value}>{fp.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Referencia</label>
                        <input type="text" id="referenciaCobro" value={formData.cobranza.referenciaCobro} onChange={handleInputChange} 
                            className={`${inputClasses} ${formData.cobranza.formaPago === 'EFEC' ? 'bg-gray-100' : ''}`}
                            disabled={formData.cobranza.formaPago === 'EFEC'} placeholder="Nro Operación" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Banco Origen (Cliente)</label>
                        <select id="bancoOrigen" value={formData.cobranza.bancoOrigen} onChange={handleInputChange} 
                            className={`${inputClasses} ${formData.cobranza.formaPago === 'EFEC' ? 'bg-gray-100' : ''}`}
                            disabled={isLoadingBancos || formData.cobranza.formaPago === 'EFEC'}>
                            <option value="">{isLoadingBancos ? 'Cargando...' : '-- Seleccione --'}</option>
                            {listaBancos.map(b => <option key={b.Codigo} value={b.Nombre.trim()}>{b.Nombre.trim()}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Cuenta Destino (Nuestra)</label>
                        <select id="bancoDestino" value={formData.cobranza.bancoDestino} onChange={handleInputChange} className={inputClasses} disabled={isLoadingCuentas}>
                            <option value="">{isLoadingCuentas ? 'Cargando...' : '-- Seleccione --'}</option>
                            {listaCuentasDestino.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre} - {c.datos.numeroCuenta.slice(-4)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`${labelClasses} text-blue-700`}>Monto Cobrado (Bs.)</label>
                        <input type="number" id="montoCobroBs" value={formData.cobranza.montoCobroBs} onChange={handleInputChange} 
                            className={`${inputClasses} font-bold border-blue-300`} placeholder="0.00" />
                    </div>
                    <div>
                        <label className={labelClasses}>Referencia ($) - Equiv.</label>
                        <input type="text" value={formData.cobranza.montoReferenciaUsd} className="w-full p-2 border rounded-md text-right bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium" readOnly placeholder="0.00" />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Observaciones</label>
                    <textarea 
                        id="observacionesCobro"
                        value={formData.cobranza.observacionesCobro}
                        onChange={handleInputChange}
                        className={`${inputClasses} h-20 resize-none`}
                        placeholder="Detalles adicionales del cobro..."
                    />
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                    <button type="button" onClick={() => setFormData(initialFormData)} className="py-2 px-6 rounded-lg bg-gray-500 text-white flex items-center space-x-2 hover:bg-gray-600 transition-colors">
                        <XCircle size={18} /> <span>Limpiar</span>
                    </button>
                    <button type="button" onClick={handleProcesarCobro} disabled={!isFormValid || isLoadingTasa}
                        className="py-2 px-6 rounded-lg bg-blue-600 text-white flex items-center space-x-2 disabled:bg-gray-400 hover:bg-blue-700 transition-colors">
                        <CheckSquare size={18} /> <span>Procesar Cobro</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CobranzaTab;