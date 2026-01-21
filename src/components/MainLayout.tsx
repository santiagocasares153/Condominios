// src/components/MainLayout.tsx
import React, { useState } from "react";
import EntidadTab from "./EntidadTab";
import ResidentesTab from "./ResidentesTab";
import VehiculosTab from "./VehiculosTab";
import ServiciosTab from "./ServiciosTab";
import CobranzaTab from "./CobranzaTab";
import NotasDbCrTab from "./NotasDbCrTab";
import DocumentosTab from "./DocumentosTab";
import BitacoraTab from "./BitacoraTab";
import EstadoCuentaTab from "./EstadoCuentaTab";

import {
  Home,
  Users,
  Car,
  Settings,
  DollarSign,
  Edit3,
  FileText,
  ListChecks,
  FileBadge,
  MessageSquare,
  Mail,
  Phone,
} from "lucide-react";

import {
  Residente,
  Vehiculo,
  Servicios,
  TransaccionEcta,
  Entidad,
} from "../types/types";

import Correo from "./correos/Correos";
import Whattsap from "./whattsap/Whattsap";
import Sms from "./sms/MensajeSms";

interface MainLayoutProps {
  entidadData: Entidad;
  idEntidad: number; // <--- AGREGA ESTA LÍNEA
  residentes: Residente[];
  vehiculos: Vehiculo[];
  servicios: Servicios;
  bitacora: { fecha: string; detalle: string }[];
  estadoCuenta: TransaccionEcta[];
  cobranzaData: {
    formasPago: string[];
    bancos: string[];
    cuentas: string[];
    tasaOficial: number;
    periodoActual: { periodo: number; año: number };
    monedas: string[];
    monedaBanco: string[];
  };
  onSaveServicios: (updatedServicios: Servicios) => void;
  onUpdateVehiculos: (updatedVehiculos: Vehiculo[]) => void;
  onUpdateResidentes: (updatedResidentes: Residente[]) => void; // Prop añadida para consistencia
  onSaveCobranza: (data: any) => void; // Nueva prop para guardar cobranza
  
}

const MainLayout: React.FC<MainLayoutProps> = ({
  entidadData,
  idEntidad,
  residentes,
  vehiculos,
  servicios,
  bitacora,
  //estadoCuenta,
  cobranzaData,
  onSaveServicios,
  onUpdateVehiculos,
  onUpdateResidentes,
  onSaveCobranza
}) => {
  const [activeTab, setActiveTab] = useState("entidad");

  const tabs = [
    { id: "entidad", icon: Home, label: "Info" },
    { id: "residentes", icon: Users, label: "Res." },
    { id: "vehiculos", icon: Car, label: "Vehíc." },
    { id: "servicios", icon: Settings, label: "Serv." },
    { id: "cobranza", icon: DollarSign, label: "Cobrar" },
    { id: "notasdbcr", icon: Edit3, label: "Notas" },
    { id: "documentos", icon: FileText, label: "Docs" },
    { id: "bitacora", icon: ListChecks, label: "Bitác." },
    { id: "estadocuenta", icon: FileBadge, label: "Cta" },
    { id: "sms", icon: Phone, label: "SMS" },
    { id: "whattsap", icon: MessageSquare, label: "WhatsApp" },
    { id: "correo", icon: Mail, label: "Correo" },
  ];

  const {
    periodoActual,
    tasaOficial,
    formasPago,
    cuentas,
  } = cobranzaData;

  const renderContent = () => {
    switch (activeTab) {
      case "entidad":
        return <EntidadTab entidadData={entidadData} />;
      case "residentes":
        return (
          <ResidentesTab 
            entidadData={entidadData} 
            residentes={residentes} 
            onUpdateResidentes={(r) => {
              console.log("🔵 MainLayout → onUpdateResidentes:", r);
              onUpdateResidentes(r);
            }}
          />
        );
      case "vehiculos":
        return (
          <VehiculosTab
            entidadData={entidadData}
            vehiculos={vehiculos}
            onChangeVehiculos={(v) => {
              console.log("🟣 MainLayout → onChangeVehiculos:", v);
              onUpdateVehiculos(v);
            }}
          />
        );
      case "servicios":
        return <ServiciosTab servicios={servicios} onSaveServicios={onSaveServicios} />;
      case "cobranza":
        return (
          <CobranzaTab
            formasPago={formasPago}
            idEntidad={idEntidad}
           // bancos={bancos}
            cuentas={cuentas}
            tasaOficial={tasaOficial}
            periodoActual={periodoActual}
           // monedas={monedas}
           // monedaBanco={monedaBanco}
          onSaveCobranza={onSaveCobranza} // <--- Pasamos la función
          />
        );
      case "notasdbcr":
       return (
          <NotasDbCrTab idEntidad={idEntidad} tasaOficial={tasaOficial}  periodoActual={periodoActual} />);
      case "documentos":
        return <DocumentosTab />;
      case "bitacora":
        return <BitacoraTab data={bitacora} />;
      case "estadocuenta":
        return <EstadoCuentaTab idEntidad={idEntidad} />;
      case "sms":
        return <Sms />;
      case "whattsap":
        return <Whattsap />;
      case "correo":
        return <Correo />;
      default:
        return <EntidadTab entidadData={entidadData} />;
    }
  };

  return (
    <div className="lg:col-span-3 flex flex-col h-full min-h-[700px] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-none bg-white dark:bg-gray-800">
      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-2 text-[10px] md:text-xs font-bold flex flex-col items-center justify-center flex-1 min-w-[60px] transition-all border-b-2
              ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-gray-700 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/30"
              }`}
          >
            <tab.icon className={`w-4 h-4 mb-1 ${activeTab === tab.id ? "animate-pulse" : ""}`} />
            <span className="uppercase">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainLayout;