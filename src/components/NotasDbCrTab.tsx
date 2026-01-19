import React, { useState, useEffect, useCallback, useRef } from 'react';
import { XCircle, Save, Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface NotasDbCrTabProps {
    idEntidad: number;
    tasaOficial: number;
    periodoActual: { periodo: number; año: number };
    onSaveNota?: (data: any) => void;
}

const initialFormData = {
    fecha: new Date().toISOString().split('T')[0],
    fechaTasa: new Date().toISOString().split('T')[0],
    concepto: '',
    montoBs: '',
    montoUsd: '',
    comentario: '',
};

const NotasDbCrTab: React.FC<NotasDbCrTabProps> = ({ 
    idEntidad, 
    tasaOficial, 
    periodoActual,
    onSaveNota 
}) => {
    const { user } = useAuth();
    const [tipoNota, setTipoNota] = useState<'NDE' | 'NCE'>('NDE'); 
    const [formData, setFormData] = useState(initialFormData);
    const [tasaCargada, setTasaCargada] = useState<number>(tasaOficial);
    const [isLoadingTasa, setIsLoadingTasa] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const dateTasaRef = useRef<HTMLInputElement>(null);
    const dateNotaRef = useRef<HTMLInputElement>(null);

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
                        fechaTasa: fecha,
                        montoUsd: calcularEquivalencia(prev.montoBs, valorDolar)
                    }));
                }
            }
        } catch (error) { 
            setTasaCargada(tasaOficial); 
        } finally { 
            setIsLoadingTasa(false); 
        }
    }, [tasaOficial]);

    useEffect(() => { fetchTasaPorFecha(formData.fechaTasa); }, [fetchTasaPorFecha]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [id]: value };
            if (id === 'montoBs') newData.montoUsd = calcularEquivalencia(value, tasaCargada);
            return newData;
        });
        if (id === 'fechaTasa') fetchTasaPorFecha(value);
    };

    const handleProcesarNota = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const dataFinal = {
            idEntidad: idEntidad,
            clase: tipoNota,
            concepto: formData.concepto,
            fechaCobro: formData.fecha,
            fechaTasa: formData.fechaTasa,
            tasa: tasaCargada,
            montoCobroBs: parseFloat(formData.montoBs),
            montoUsdRef: parseFloat(formData.montoUsd),
            observacionesCobro: formData.comentario,
            moneda: 'Bs',
            idUsuario: user?.id || 'Sistema',
            formaPago: "N-A",
           // periodo: periodoActual.periodo,
           // año: periodoActual.año
        };
        
        try {
            console.log("Enviando datos:", dataFinal);
            const response = await axios.post(
                'https://bknd.condominios-online.com/transacciones/', 
                dataFinal,
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Datos enviados:", dataFinal);
            console.log("Respuesta API:", response.data);
            
            if (onSaveNota) onSaveNota(response.data);
            
            // Resetear formulario tras éxito
            setFormData(initialFormData);
            alert(`${tipoNota} guardada con éxito`);

        } catch (error) {
            console.error("Error al guardar la nota:", error);
            alert("Error al procesar la transacción. Por favor intente de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "mt-1 w-full p-2 border rounded-md text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 text-sm";
    const labelClasses = "block font-medium text-gray-700 dark:text-gray-300 text-xs";

    return (
        <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto">
            <div className={`p-3 rounded-lg border text-center ${tipoNota === 'NDE' ? 'bg-red-50 border-red-100 dark:bg-red-900/20' : 'bg-green-50 border-green-100 dark:bg-green-900/20'}`}>
                <h3 className={`text-lg font-bold ${tipoNota === 'NDE' ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>
                    {tipoNota === 'NDE' ? 'Nota de Débito (Entidad)' : 'Nota de Crédito (Entidad)'}
                </h3>
                <p className="text-xs opacity-70">ID Entidad: {idEntidad} | Periodo: {periodoActual.periodo}-{periodoActual.año}</p>
            </div>

            <form onSubmit={handleProcesarNota} className="max-w-xl mx-auto space-y-4 w-full">
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl justify-center">
                    <button type="button" onClick={() => setTipoNota('NDE')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tipoNota === 'NDE' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500'}`}>
                        DÉBITO (NDE)
                    </button>
                    <button type="button" onClick={() => setTipoNota('NCE')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tipoNota === 'NCE' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500'}`}>
                        CRÉDITO (NCE)
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Fecha de la Nota</label>
                        <div className="relative mt-1 cursor-pointer" onClick={() => dateNotaRef.current?.showPicker()}>
                            <input type="text" value={formData.fecha} className={`${inputClasses} text-center font-bold`} readOnly />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"><Calendar size={16}/></div>
                            <input type="date" id="fecha" ref={dateNotaRef} value={formData.fecha} onChange={handleInputChange} className="absolute opacity-0 inset-0 w-full h-full cursor-pointer" />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Tasa para el cálculo</label>
                        <div className="relative mt-1 cursor-pointer" onClick={() => dateTasaRef.current?.showPicker()}>
                            <input type="text" value={isLoadingTasa ? "Cargando..." : `${tasaCargada.toFixed(4)} Bs`} 
                                className={`${inputClasses} text-center font-bold text-blue-600 bg-blue-50/50`} readOnly />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400"><Calendar size={16}/></div>
                            <input type="date" id="fechaTasa" ref={dateTasaRef} value={formData.fechaTasa} onChange={handleInputChange} className="absolute opacity-0 inset-0 w-full h-full cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Concepto</label>
                    <input type="text" id="concepto" value={formData.concepto} onChange={handleInputChange} className={inputClasses} placeholder="Motivo de la nota..." required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`${labelClasses} text-blue-700`}>Monto en Bolívares (Bs.)</label>
                        <input type="number" step="0.01" id="montoBs" value={formData.montoBs} onChange={handleInputChange} 
                            className={`${inputClasses} font-bold border-blue-300`} placeholder="0.00" required />
                    </div>
                    <div>
                        <label className={labelClasses}>Equivalencia ($)</label>
                        <input type="text" value={formData.montoUsd} className="w-full p-2 border rounded-md text-right bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium" readOnly placeholder="0.00" />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Observaciones de la Nota</label>
                    <textarea id="comentario" value={formData.comentario} onChange={handleInputChange} className={`${inputClasses} h-20 resize-none`} placeholder="Detalles para el registro..." />
                </div>

                <div className="flex justify-center space-x-4 pt-2">
                    <button 
                        type="button" 
                        onClick={() => setFormData(initialFormData)} 
                        disabled={isSubmitting}
                        className="py-2 px-6 rounded-lg bg-gray-500 text-white flex items-center space-x-2 hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        <XCircle size={18} /> <span>Limpiar</span>
                    </button>
                    <button 
                        type="submit" 
                        disabled={!formData.montoBs || !formData.concepto || isLoadingTasa || isSubmitting}
                        className={`py-2 px-6 rounded-lg text-white flex items-center space-x-2 transition-colors ${tipoNota === 'NDE' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-400`}
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{isSubmitting ? 'Procesando...' : `Grabar ${tipoNota}`}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NotasDbCrTab;