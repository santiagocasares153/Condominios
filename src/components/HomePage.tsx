// src/pages/HomePage.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Residente, Vehiculo, Entidad } from "../types/types";
import EntidadPanel from "../components/EntidadPanel";
import MainLayout from "./MainLayout";
import EntidadModal from "./EntidadModal";
import { Edit } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";
import NavigationMenu from "../components/Menu";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Alert } from "@mui/material";

const BASE_API_URL = "https://bknd.condominios-online.com/entidades";
const TRANSACCIONES_API_URL = "https://bknd.condominios-online.com/transacciones/";

const HomePage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [entidadData, setEntidadData] = useState<Entidad | null>(null);
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [servicios, setServicios] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const entidadDesdeNavegacion = location.state?.entidad as Entidad;
    if (entidadDesdeNavegacion) {
      setEntidadData(entidadDesdeNavegacion);
      setResidentes(Array.isArray(entidadDesdeNavegacion.residentes) ? entidadDesdeNavegacion.residentes : []);
      setVehiculos(Array.isArray(entidadDesdeNavegacion.vehiculos) ? entidadDesdeNavegacion.vehiculos : []);
      setServicios(entidadDesdeNavegacion.servicios || null);
    } else {
      setError("No se encontraron datos en el estado de navegación.");
    }
  }, [location.state]);

  // Función para actualizar datos maestros de la entidad (PUT)
  const handleUpdateServer = async (updatedPayload: any) => {
    if (!user?.token || !entidadData) return;
    
    const fullPayload = {
      ...entidadData,
      ...updatedPayload,
    };

    try {
      const response = await axios.put(`${BASE_API_URL}/${entidadData.id}`, fullPayload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      setEntidadData(response.data || fullPayload); 
      console.log("✅ Entidad actualizada");
    } catch (err: any) {
      console.error("❌ Error en PUT:", err);
      alert("Error al sincronizar con el servidor.");
    }
  };

  // NUEVA FUNCIÓN: Enviar cobranza directamente como transacción (POST)
  const handleSaveCobranzaDirecta = async (data: any) => {
    if (!user?.token) {
      alert("Sesión no válida");
      return;
    }

    // Extraemos el objeto que construyó el formulario en CobranzaTab
    const payload = data.cobranza;

    console.group("📤 Enviando Transacción de Cobranza (POST)");
    console.log("URL:", TRANSACCIONES_API_URL);
    console.log("Payload:", payload);
    console.groupEnd();

    try {
      const response = await axios.post(
        TRANSACCIONES_API_URL,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Transacción exitosa:", response.data);
      alert("Cobro procesado y registrado correctamente.");
    } catch (err: any) {
      console.error("❌ Error al postear transacción:", err);
      const mensajeError = err.response?.data?.message || "Error al conectar con el servidor";
      alert(`Error al registrar cobro: ${mensajeError}`);
    }
  };
  
  const handleSaveEntidad = async (updated: Entidad) => {
    setIsModalOpen(false);
    await handleUpdateServer(updated);
  };

  if (error || !entidadData) {
    return (
      <div className="container mx-auto pt-20 px-4">
        <NavigationMenu />
        <Alert severity="warning" className="mt-4">{error || "Cargando datos..."}</Alert>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? "dark bg-gray-900" : "bg-gray-100"} min-h-screen text-gray-900 dark:text-white`}>
      <NavigationMenu />
      <div className="container mx-auto pt-20 px-4 pb-10">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border dark:border-gray-700">
          <header className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsModalOpen(true)} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md">
                <Edit size={22} />
              </button>
              <h1 className="text-2xl font-black uppercase">
                {entidadData.clase} — Ref: <span className="text-blue-600 dark:text-blue-400">{entidadData.referencia}</span>
              </h1>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <EntidadPanel data={entidadData} />
            </div>
            <div className="lg:col-span-3">
              <MainLayout
                entidadData={entidadData}
                idEntidad={entidadData.id}
                residentes={residentes}
                vehiculos={vehiculos}
                servicios={servicios}
                bitacora={[]}
                estadoCuenta={[]}
                cobranzaData={{
                  formasPago: [], bancos: [], cuentas: [], tasaOficial: 0,
                  periodoActual: { periodo: 1, año: 2026 }, monedas: [], monedaBanco: []
                }}
                onSaveServicios={(s) => handleUpdateServer({ servicios: s })}
                onUpdateVehiculos={(v) => handleUpdateServer({ vehiculos: v })}
                onUpdateResidentes={(r) => {
                    setResidentes(r);
                    handleUpdateServer({ residentes: r });
                }}
                // Aquí pasamos la nueva función de envío por POST
                onSaveCobranza={handleSaveCobranzaDirecta} 
              />
            </div>
          </div>
        </div>
      </div>
      <EntidadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={entidadData} onSave={handleSaveEntidad} />
    </div>
  );
};

export default HomePage;