import React, { useState, useEffect, useRef } from 'react';
import { XCircle, Save, Loader2, Landmark, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

// --- Interfaces ---
interface BancoAuxiliar {
    Nombre: string;
    Codigo: string;
}

interface MovimientoBancosProps {
    idBanco: number;
    numeroCuenta: string;
    moneda: string;
}

const MAPA_FORMAS_PAGO = [
    { label: 'Transferencia', value: 'TRF' },
    { label: 'Pago Móvil', value: 'PMV' },
    { label: 'Cheque', value: 'CHQ' },
    { label: 'Depósito', value: 'DEP' },
    { label: 'Efectivo', value: 'EFC' }
];

const MovimientoBancos: React.FC<MovimientoBancosProps> = ({ idBanco, numeroCuenta, moneda }) => {
    const { user } = useAuth();
    
    const initialFormData = {
        fecha: new Date().toISOString().split('T')[0],
        nroCuenta: numeroCuenta,
        bancoAux: '', // Cambiamos el nombre interno para que sea genérico
        formaPago: 'TRF',
        montoBs: '',
        referencia: '',
        moneda: moneda || 'Bs',
        comentario: '',
    };

    const [tipoOp, setTipoOp] = useState<'DB' | 'CR'>('DB');
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [listaBancosAux, setListaBancosAux] = useState<BancoAuxiliar[]>([]);

    const dateRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(prev => ({ ...prev, nroCuenta: numeroCuenta, moneda: moneda }));
    }, [numeroCuenta, moneda]);

    useEffect(() => {
        const fetchBancosAux = async () => {
            try {
                const response = await axios.get<any[]>('https://bknd.condominios-online.com/bancos/auxiliar/list');
                if (response.data?.[0]?.['@res']) {
                    const dataParsed = JSON.parse(response.data[0]['@res']);
                    if (dataParsed.body) setListaBancosAux(dataParsed.body);
                }
            } catch (e) { console.error("Error:", e); }
        };
        fetchBancosAux();
    }, []);

    const formatVisualNumber = (value: string) => {
        if (!value) return '';
        const cleanValue = value.replace(/\D/g, "");
        const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        return new Intl.NumberFormat('de-DE', options).format(parseFloat(cleanValue) / 100);
    };

    const unformatNumber = (value: string): number => {
        if (!value) return 0;
        return parseFloat(value.replace(/\./g, '').replace(',', '.'));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        if (id === 'montoBs') {
            setFormData(prev => ({ ...prev, montoBs: formatVisualNumber(value) }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const valorBanco = formData.formaPago === 'EFC' ? 'EFECTIVO' : formData.bancoAux;

        const dataFinal = {
            idBanco: idBanco,
            // Si es Débito, enviamos bancoDestino y bancoOrigen vacío. 
            // Si es Crédito, enviamos bancoOrigen y bancoDestino vacío.
            bancoDestino: tipoOp === 'DB' ? valorBanco : '',
            bancoOrigen: tipoOp === 'CR' ? valorBanco : '',
            idUsuario: user?.id || 'Sistema',
            moneda: "Bs",
            //nroCuenta: formData.nroCuenta,
            formaPago: formData.formaPago,
            clase: tipoOp === 'DB' ? 'debito' : 'credito',
            montoBs: unformatNumber(formData.montoBs),
            referencia: formData.referencia,
            fecha: formData.fecha,
            comentario: formData.comentario,
        };
        console.log("Datos a enviar:", dataFinal);
        try {
            await axios.post('https://bknd.condominios-online.com/bancos/movimientos', dataFinal, {
                headers: { Authorization: `Bearer ${user?.token}`, "Content-Type": "application/json" }
            });
            alert("Movimiento registrado con éxito.");
            setFormData({ ...initialFormData, nroCuenta: numeroCuenta, moneda: moneda });
        } catch (error) { 
            alert("Error al registrar el movimiento."); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const inputClasses = "mt-1 w-full p-2 border rounded-md text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 text-sm";
    const labelClasses = "block font-medium text-gray-700 dark:text-gray-300 text-[11px] uppercase tracking-wider";

    return (
        <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto">
            <div className={`p-3 rounded-lg border text-center transition-colors ${tipoOp === 'DB' ? 'bg-red-50 border-red-100 dark:bg-red-900/20' : 'bg-green-50 border-green-100 dark:bg-green-900/20'}`}>
                <h3 className={`text-base font-bold flex items-center justify-center gap-2 ${tipoOp === 'DB' ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>
                    <Landmark size={18} />
                    {tipoOp === 'DB' ? 'MOVIMIENTO DÉBITO' : 'MOVIMIENTO CRÉDITO'}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 w-full">
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <button type="button" onClick={() => setTipoOp('DB')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${tipoOp === 'DB' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500'}`}>DÉBITO (-)</button>
                    <button type="button" onClick={() => setTipoOp('CR')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${tipoOp === 'CR' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500'}`}>CRÉDITO (+)</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Fecha Op.</label>
                        <div className="relative mt-1 cursor-pointer" onClick={() => dateRef.current?.showPicker()}>
                            <input type="text" value={formData.fecha} className={`${inputClasses} text-center font-bold`} readOnly />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"><Calendar size={14}/></div>
                            <input type="date" id="fecha" ref={dateRef} value={formData.fecha} onChange={handleInputChange} className="absolute opacity-0 inset-0 w-full cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>F. Pago</label>
                        <select id="formaPago" value={formData.formaPago} onChange={handleInputChange} className={inputClasses}>
                            {MAPA_FORMAS_PAGO.map(fp => (
                                <option key={fp.value} value={fp.value}>{fp.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        {/* El Título cambia dinámicamente según la operación */}
                        <label className={`${labelClasses} text-blue-600 dark:text-blue-400 font-bold`}>
                            {tipoOp === 'DB' ? 'Banco Destino' : 'Banco Origen'}
                        </label>
                        <select 
                            id="bancoAux" 
                            value={formData.bancoAux} 
                            onChange={handleInputChange} 
                            className={`${inputClasses} ${formData.formaPago === 'EFC' ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : ''}`}
                            disabled={formData.formaPago === 'EFC'}
                            required={formData.formaPago !== 'EFC'}
                        >
                            <option value="">{formData.formaPago === 'EFC' ? 'N/A' : '-- SELECCIONAR --'}</option>
                            {listaBancosAux.map(b => (
                                <option key={b.Codigo} value={b.Nombre.trim()}>{b.Nombre.trim()}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Ref. / Recibo</label>
                        <input 
                            type="text" 
                            id="referencia" 
                            value={formData.referencia} 
                            onChange={handleInputChange} 
                            className={`${inputClasses} ${formData.formaPago === 'EFC' ? 'bg-gray-100 dark:bg-gray-800' : ''}`} 
                            disabled={formData.formaPago === 'EFC'}
                            placeholder={formData.formaPago === 'EFC' ? 'N/A' : 'NRO.'} 
                            required={formData.formaPago !== 'EFC'} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`${labelClasses} text-blue-700 dark:text-blue-400 font-bold`}>Monto Bs.</label>
                        <input 
                            type="text" 
                            id="montoBs" 
                            value={formData.montoBs} 
                            onChange={handleInputChange} 
                            className={`${inputClasses} font-bold border-blue-300 dark:border-blue-800 text-right pr-4`} 
                            placeholder="0,00" 
                            required 
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Moneda</label>
                        <input type="text" id="moneda" value={formData.moneda} className={`${inputClasses} bg-gray-100 dark:bg-gray-800 font-bold text-center text-gray-500`} readOnly />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Comentarios / Detalle del Movimiento</label>
                    <textarea 
                        id="comentario" 
                        value={formData.comentario} 
                        onChange={handleInputChange} 
                        className={`${inputClasses} h-20 resize-none`}
                        placeholder="Escriba aquí detalles adicionales..."
                    />
                </div>

                <div className="flex justify-center space-x-4 pt-2">
                    <button type="button" onClick={() => setFormData(initialFormData)} className="py-2 px-6 rounded-lg bg-gray-500 text-white flex items-center space-x-2 text-sm transition-colors hover:bg-gray-600">
                        <XCircle size={16} /> <span>Limpiar</span>
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !formData.montoBs} 
                        className={`py-2 px-6 rounded-lg text-white flex items-center space-x-2 text-sm shadow-md transition-all ${tipoOp === 'DB' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-400`}
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span className="font-bold uppercase">Grabar</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MovimientoBancos;