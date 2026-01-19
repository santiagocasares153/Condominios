
import React, { useState } from 'react';
import { Home, Truck, Users, MoreVertical, ClipboardCopy, Printer, Mail, FileText, FileSpreadsheet } from 'lucide-react';
import { objDocumentos, valoresConstanciaResidencia } from '../data/mockData';

const DocumentosTab: React.FC = () => {
    const [selectedDocType, setSelectedDocType] = useState<string>('');
    const [documentoTitulo, setDocumentoTitulo] = useState('Seleccione un documento');
    const [documentoContenido, setDocumentoContenido] = useState('');
    const [selectedResidenteIndex, setSelectedResidenteIndex] = useState<string>('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const generateConstanciaContent = (index: string) => {
        const selectedIndex = parseInt(index);
        if (selectedIndex >= 0) {
            const residente = valoresConstanciaResidencia[selectedIndex];
            const newContent = `Por medio de la presente, se hace constar que el ciudadano(a) ${residente.nombre.toUpperCase()}, titular de la Cédula de Identidad ${residente.cedula}, reside en este conjunto residencial, en la dirección: Casa 34, Calle 1.\n\nConstancia que se expide a petición de la parte interesada en Araure, a los ${new Date().toLocaleDateString('es-VE')}.\n\nAtentamente,\n\nLa Administración.`;
            setDocumentoTitulo("Constancia de Residencia");
            setDocumentoContenido(newContent);
        } else {
            setDocumentoTitulo('Seleccione un Residente');
            setDocumentoContenido('');
        }
    };

    const handleDocSelect = (tipoDoc: string) => {
        setSelectedDocType(tipoDoc);
        setIsMenuOpen(false); // Close menu on action
        
        if (tipoDoc === 'ConstResidencia') {
            setDocumentoTitulo('Seleccione un Residente');
            setDocumentoContenido('');
            setSelectedResidenteIndex('');
        } else {
            const doc = objDocumentos[tipoDoc];
            if (doc) {
                setDocumentoTitulo(doc.titulo);
                setDocumentoContenido(doc.contenido);
            }
        }
    };

    const handleResidenteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = e.target.value;
        setSelectedResidenteIndex(index);
        generateConstanciaContent(index);
    };

    const handleCopy = () => {
        try {
            // Usamos la API de Clipboard (aunque a veces no funciona en iframes)
            navigator.clipboard.writeText(documentoContenido).then(() => {
                console.log('Documento copiado al portapapeles!');
            }).catch(err => {
                console.error('Error al copiar:', err);
            });
        } catch (err) {
            console.error('Error al copiar:', err);
        }
        setIsMenuOpen(false);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`<html><head><title>${documentoTitulo}</title></head><body><pre>${documentoContenido}</pre></body></html>`);
            printWindow.document.close();
            printWindow.print();
        }
        setIsMenuOpen(false);
    };

    const handleEmail = () => {
        const subject = encodeURIComponent(documentoTitulo);
        const body = encodeURIComponent(documentoContenido);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        setIsMenuOpen(false);
    };
    
    const isDocumentReady = documentoContenido.trim() !== '';

    // Clases comunes para el menú
    const menuItemClasses = "flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700";
    const menuIconClasses = "w-4 h-4 text-gray-600 dark:text-gray-400";
    const selectClasses = "mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Título */}
            <h3 className="text-lg font-bold text-center text-gray-700 dark:text-gray-100">Documentos</h3>
            
            {/* Header con botones de selección y menú de acciones */}
            <div className="flex justify-between items-center">
                {/* Botones de selección de documento (colores fijos, no requieren dark: para texto blanco) */}
                <div className="flex space-x-4">
                    <button onClick={() => handleDocSelect('ConstResidencia')} className="doc-button bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors text-sm">
                        <Home className="w-5 h-5" />
                        <span>Const.Residencia</span>
                    </button>
                    <button onClick={() => handleDocSelect('autorMudanza')} className="doc-button bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors text-sm">
                        <Truck className="w-5 h-5" />
                        <span>Autor.Mudanza</span>
                    </button>
                    <button onClick={() => handleDocSelect('autorVisitas')} className="doc-button bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors text-sm">
                        <Users className="w-5 h-5" />
                        <span>Aut.Visitantes</span>
                    </button>
                </div>
                
                {/* Menú de acciones Kebab */}
                <div className="relative">
                    {/* Botón: Fondo de hover y color de icono adaptativo */}
                    <button 
                        onClick={() => setIsMenuOpen(prev => !prev)} 
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
                        disabled={!isDocumentReady}
                    >
                        {/* El icono usa text-gray-700, que se convierte en dark:text-gray-200 */}
                        <MoreVertical className={`w-5 h-5 ${isDocumentReady ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`} />
                    </button>
                    {/* Menú desplegable: Fondo y borde adaptativos */}
                    <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 z-10 ${isMenuOpen ? '' : 'hidden'}`}>
                        <div className="py-1">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCopy(); }} className={menuItemClasses}>
                                <ClipboardCopy className={menuIconClasses} />
                                <span>Copiar al portapapeles</span>
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handlePrint(); }} className={menuItemClasses}>
                                <Printer className={menuIconClasses} />
                                <span>Imprimir</span>
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleEmail(); }} className={menuItemClasses}>
                                <Mail className={menuIconClasses} />
                                <span>Enviar por Email</span>
                            </a>
                            <div className="border-t my-1 dark:border-gray-600"></div>
                            {/* Acciones de exportación simuladas */}
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
            
            {/* Dropdown for Constancia de Residencia */}
            <div id="constanciaResidenciaOptions" className={`${selectedDocType === 'ConstResidencia' ? '' : 'hidden'} my-2`}>
                <label htmlFor="residenteSelect" className={labelClasses}>Seleccione Residente para la Constancia:</label>
                <select id="residenteSelect" value={selectedResidenteIndex} onChange={handleResidenteChange} className={selectClasses}>
                    <option value="">-- Seleccione --</option>
                    {valoresConstanciaResidencia.map((res, index) => (
                        <option key={index} value={index}>{res.nombre}</option>
                    ))}
                </select>
            </div>
            
            {/* Área de visualización del documento */}
            {/* Fondo y borde adaptativos */}
            <div className="flex-grow border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 overflow-y-auto flex flex-col">
                {/* Título del documento */}
                <h3 id="documentoTitulo" className="text-lg font-bold mb-2 text-gray-700 dark:text-gray-100">{documentoTitulo}</h3>
                {/* Textarea de contenido: Fondo, borde y texto adaptativos */}
                <textarea 
                    id="documentoContenido" 
                    value={documentoContenido} 
                    onChange={(e) => setDocumentoContenido(e.target.value)}
                    className="flex-grow w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 font-sans text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>
        </div>
    );
};

export default DocumentosTab;