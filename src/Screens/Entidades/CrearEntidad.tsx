import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { User } from 'lucide-react'; 

// Ampliamos la interfaz ClienteType para incluir la propiedad de cola
interface ClienteType {
  id: string;
  nombreContacto: string;
  planServicio_cola?: string; // Hacemos que sea opcional por si acaso no siempre viene
  // Podrías añadir otras propiedades si las necesitas, como idFiscal, mailContacto, etc.
}

const CrearEntidad = ({ usuario }: { usuario: any, onSuccess: () => void }) => {
  const { user } = useAuth();

  interface FormDataType {
    nombre: string;
    correo: string;
    clave?: string;
    direccion: string;
    telefono: string;
    rol: string;
    id: string;
  }

  const [formData, setFormData] = useState<FormDataType>({
    nombre: "",
    correo: "",
    clave: "",
    direccion: "",
    telefono: "",
    rol: "",
    id: "",
  });

  const [, setAvailableClients] = useState<ClienteType[]>([]);
  const [, setSelectedClientIds] = useState<string[]>([]);
  const [, setLoadingClients] = useState(true);
  const [, setErrorClients] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombreUsuario || "",
        correo: usuario.correoUsuario || "",
        clave: "", // No precargar la clave por seguridad
        direccion: usuario.direccionUsuario || "",
        telefono: usuario.telefonoUsuario || "",
        rol: usuario.rolUsuario || "",
        id: usuario.id || "",
      });
      // Asegurarse de que los clientes existentes estén seleccionados
      if (usuario.clientes && Array.isArray(usuario.clientes)) {
        setSelectedClientIds(usuario.clientes.map((c: { id: string }) => c.id));
      } else {
        setSelectedClientIds([]);
      }
    } else {
      setFormData({
        nombre: "",
        correo: "",
        clave: "",
        direccion: "",
        telefono: "",
        rol: "",
        id: "",
      });
      setSelectedClientIds([]);
    }
  }, [usuario]);

  useEffect(() => {
    const fetchAvailableClients = async () => {
      setLoadingClients(true);
      setErrorClients(null);
      if (!user || !user.id) {
        console.warn('Usuario no logueado o ID de usuario no disponible. No se pueden cargar los clientes.');
        setAvailableClients([]);
        setLoadingClients(false);
        return;
      }

      try {
        const apiUrl = `https://wsrv.iot-ve.online/cliente/index?usuario=${user.id}`;
        const response = await axios.get(apiUrl);

        if (
          response.data &&
          typeof response.data === "object" &&
          "body" in response.data &&
          Array.isArray((response.data as { body?: unknown }).body)
        ) {
          setAvailableClients((response.data as { body: ClienteType[] }).body);
        } else if (response.data && Array.isArray(response.data)) {
          setAvailableClients(response.data);
        } else {
          console.warn('La respuesta de la API no contiene un array de clientes válido:', response.data);
          setAvailableClients([]);
        }
      } catch (err) {
        console.error('Error al obtener clientes disponibles:', err);
        setErrorClients('Error al cargar la lista de clientes.');
        setAvailableClients([]);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchAvailableClients();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };



  const inputFormClass = "w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-700 dark:text-white";
  const sectionClass = "bg-gray-100 p-4 rounded-lg shadow-sm dark:bg-gray-900";
  const sectionTitleClass = "text-blue-600 font-semibold mb-3 text-base border-b border-blue-300 pb-1 dark:text-white dark:border-blue-700 flex items-center gap-2";
  const labelClass = "block mb-1 font-medium text-gray-700 dark:text-gray-300";

  return (
    <form  className="grid grid-cols-1 gap-4 p-6 bg-white rounded-lg shadow-lg text-sm dark:bg-gray-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center dark:text-gray-100 col-span-full">
        {usuario ? "Actualizar Usuario" : "Agregar Usuario"}
      </h2>

      {/* Grid para Información Personal y Contacto/Acceso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información Personal */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}><User className="w-5 h-5" /> Información Personal</h3>
          <div>
            <label htmlFor="nombre" className={labelClass}>Nombre completo</label>
            <input
              type="text"
              name="nombre"
              className={inputFormClass}
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="correo" className={labelClass}>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              className={inputFormClass}
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
        </div>

     
      </div>

      {/* Grid para Dirección y Acceso a Clientes */}
    
     

      {/* Botón */}
      <div className="col-span-full flex justify-end mt-6">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md dark:bg-blue-500 dark:hover:bg-blue-600">
          {usuario ? "Actualizar Usuario" : "Guardar Usuario"}
        </button>
      </div>
    </form>
  );
};

export default CrearEntidad;