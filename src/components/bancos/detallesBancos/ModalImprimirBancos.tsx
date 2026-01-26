import React from 'react';
import { X, Printer, Loader2 } from 'lucide-react';

interface ModalImprimirBancosProps {
    isOpen: boolean;
    onClose: () => void;
    htmlContent: string | null;
    loading?: boolean;
}

const ModalImprimirBancos: React.FC<ModalImprimirBancosProps> = ({ isOpen, onClose, htmlContent, loading }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow && htmlContent) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            // Esperar un poco a que carguen los estilos internos del HTML antes de imprimir
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    };

    return (
        /* Z-index 9999 para asegurar que esté encima de TODO */
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-6">
            
            <div className="bg-slate-100 dark:bg-gray-900 w-full max-w-5xl h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-white/20">
                
                {/* Cabecera superior: Se mantiene fija */}
                <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <Printer size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight">
                                Vista Previa de Documento
                            </h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Estado de Cuenta Generado</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrint}
                            disabled={loading || !htmlContent}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 active:scale-95"
                        >
                            <Printer size={16} />
                            IMPRIMIR
                        </button>
                        <div className="w-px h-6 bg-gray-200 dark:border-gray-700 mx-1"></div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Área de visualización: Fondo gris para resaltar la 'hoja' */}
                <div className="flex-grow overflow-auto p-4 md:p-8 flex justify-center bg-gray-200 dark:bg-gray-950/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                            <span className="text-sm font-bold text-gray-500 animate-pulse uppercase">Preparando Formato...</span>
                        </div>
                    ) : htmlContent ? (
                        /* Contenedor que simula la hoja física */
                        <div 
                            className="bg-white shadow-2xl origin-top w-full overflow-x-auto"
                            style={{ 
                                maxWidth: '8.5in', // Ancho carta
                                minHeight: '11in',
                                padding: '0', // El HTML ya trae sus márgenes
                                backgroundColor: 'white',
                                color: 'black'
                            }}
                        >
                            <div 
                                className="transform-gpu"
                                dangerouslySetInnerHTML={{ __html: htmlContent }} 
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 italic">
                            No se pudo cargar el contenido.
                        </div>
                    )}
                </div>

                {/* Barra de estado inferior */}
                <div className="px-5 py-2 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-1 text-[11px] font-black text-gray-400 hover:text-gray-600 dark:hover:text-white uppercase transition-colors"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalImprimirBancos;