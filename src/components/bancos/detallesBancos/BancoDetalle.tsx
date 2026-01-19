import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  ChevronLeft,
  History,
  FileText,
  Settings
} from "lucide-react";
import { Operaciones } from "./Operaciones";
import { ResumenTab } from "./Resumen";
import BancosPanel from "./BancosPanel"; // Importamos el nuevo componente
import NavigationMenu from "../../Menu";

export const BancoDetalle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("resumen");

  const banco = location.state?.banco;

  const tabs = [
    { id: "resumen", icon: LayoutDashboard, label: "Resumen" },
    { id: "operaciones", icon: ArrowLeftRight, label: "Operaciones" },
    { id: "historial", icon: History, label: "Historial" },
    { id: "documentos", icon: FileText, label: "Docs" },
    { id: "config", icon: Settings, label: "Config" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "resumen": return <ResumenTab banco={banco} />;
      case "operaciones": return <Operaciones idEntidad={banco?.idEntidad || 0} tasaOficial={banco?.tasaOficial || 0} periodoActual={banco?.periodoActual || { periodo: 0, año: 0 }} />;
      default: return <ResumenTab banco={banco} />;
    }
  };
return (
 <div className="max-w-7xl mx-auto p-4">
  {/* Contenedor del Menú */}
  <div className="mb-10 relative z-10"> 
    <NavigationMenu />
  </div>
  
  {/* Botón Volver Ajustado */}
  <div className="relative z-20 flex">
    <button 
      onClick={() => navigate(-1)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 mb-6 transition-colors"
    >
      <ChevronLeft className="w-5 h-5 mr-1" />
      Volver a la lista
    </button>
  </div>
      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LADO IZQUIERDO */}
        <BancosPanel banco={banco} />

        {/* LADO DERECHO */}
        <div className="lg:col-span-3 flex flex-col h-full min-h-[700px] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-none bg-white dark:bg-gray-800 overflow-hidden">
          
          {/* Cabecera */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                  {activeTab} - {banco?.apodo}
              </h2>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2 text-[10px] md:text-xs font-bold flex flex-col items-center justify-center flex-1 min-w-[80px] transition-all border-b-2
                  ${activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-gray-700 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/30"
                  }`}
              >
                <tab.icon className={`w-4 h-4 mb-1 ${activeTab === tab.id ? "animate-pulse" : ""}`} />
                <span className="uppercase tracking-tighter text-center">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Área de Contenido */}
          <div className="p-4 flex-grow overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
};