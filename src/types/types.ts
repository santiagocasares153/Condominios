// src/types/types.ts

import React from 'react'; // Necesario para React.Dispatch y React.ChangeEvent
import { SelectChangeEvent } from '@mui/material/Select'; // ¡Importante para SelectChangeEvent!

export type ClienteType = {
  id: string; // Este es el valor que probablemente querrás usar para el 'value' del select
  razonSocial: string; // Este podría ser el texto visible en el select
  idFiscal: string;
  domFiscal: string;
  nombreContacto: string;
  tlfContacto: string;
  mailContacto: string;
  intermediario: string;
  estado: string;
  tlfPruebas: string;
  horarios: string;
  planServicio_nombre: string;
  planServicio_costoMes: string;
  planServicio_cantSmg: string;
  planServicio_disponible: string;
  planServicio_cola: string;
  infTec_host: string;
  infTec_bd: string;
  infTec_user: string;
  infTec_pwd: string;
  infTec_puerto: string;
  infTec_tabla: string;
  infTec_webhook: string;
  infTec_token: string;
  infTec_clave: string;
};

export type TabDataItem = {
  id: string;
  sigla: string;
  valor: any; // El valor ahora puede ser string o objeto
  descripcion?: string;
  tipo: string;
  vista: string;
  posicion: string;
  [key: string]: any; // Permite propiedades adicionales si las hay
};

// En ../../types/types
export interface PlantillaVariable {
  nombre: string;
  descripcion: string;
  clienteId: string;
  estado: string;
  fechaCrecion: string;
  usuarioCreador: string;
  token?: string; // Añade esta línea para permitir la propiedad 'token'
}

export type Portafolio = {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  web?: string;
  contacto?: {
    nombre?: string;
    correo?: string;
  };
  [key: string]: any; // Permite propiedades adicionales si las hay
};

export type EmpresaInfo = {
  idfiscal?: string;
  razonsocial?: string;
  direccionFiscal?: string;
  telfEmpresa?: string;
  correoEmpresa?: string;
  [key: string]: any; // Permite propiedades adicionales si las hay
};

export type Cuenta = {
  idCuenta: {
    aplicacion: string;
  };
  nombreCuenta: string;
  idTelefono: string;
  plataforma: string;
  portafolioMeta: string;
};

export type RespuestaCuentas = {
  status: string;
  result: {
    response_id: string;
    response_msg: string;
  };
  body: Cuenta[];
};



// --- Propiedades para RenderInputs (actualizadas) ---
export type RenderInputsProps = {
  data: any;
  sigla: string;
  openVariableModal: boolean;
  setOpenVariableModal: React.Dispatch<React.SetStateAction<boolean>>;
  newVariable: PlantillaVariable;
  setNewVariable: React.Dispatch<React.SetStateAction<PlantillaVariable>>;
  handleOpenVariableModal: () => void;
  handleCloseVariableModal: () => void;
  // Funciones de cambio separadas para TextField y Select
  handleTextFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (event: SelectChangeEvent<string>) => void;

  clientesList: ClienteType[];
  currentUser: any; // Considera tipar 'user' de useAuth de forma más específica si puedes
  handleCardClick: (id: number, user: { token: string } | null) => Promise<void>;
  setMostrarTabla: React.Dispatch<React.SetStateAction<boolean>>;
};
// src/types/types.ts

// --- Tipos para EntidadData y Modal ---
// ¡ACTUALIZADO CON NUEVOS CAMPOS!
export interface Persona {
    docIdentidad: string;
    nombres: string;
    telefono: string;
    email: string;
    sexo: 'M' | 'F' | ''; // Agregado
    fecNac: string;       // Agregado
    parentesco: string;   // Agregado
    residente: boolean;   // Agregado
    envAlertas: boolean;  // Agregado
}
export interface ControlAcceso {
    // Los valores de 'tipo' ahora solo pueden ser estos cuatro:
    tipo: 'Telefonos' | 'Controles' | 'Tags' | 'Biometrico'; 
    cantidad: number;
    activo: boolean;
    fecActiva?: string; // Hice este opcional por si no está activo
    fecInactiv?: string; // Hice este opcional por si no está inactivo
    comentarios: string;
}



// --- Tipos para Listas ---
export interface Residente {
    id: number;
    nombre: string;
    fecNacimiento: string; // Fecha de nacimiento (puede ser de la Persona o un string)
    parentesco: string;
    status: boolean; // Si reside actualmente
}

export interface Vehiculo {
    id: number;
    placa: string;
    marca: string;
    modelo: string;
    color: string;
}

export interface TransaccionEcta {
    id: number;
    fecha: string;
    tipo: string; // Cuota, Pago, NotaDéb, etc.
    referencia: string;
    concepto: string;
    debitos: string; // Formato con $
    creditos: string; // Formato con $
    saldo: string; // Formato con $
}

// --- Tipos para Servicios
export interface Servicios {
    // Servicios Básicos
    electricidad: boolean;
    aseoPublico: boolean;
    aseoPrivado: boolean;
    internet: boolean;
    proveedorInternet: string;
    
    // Suministro de Agua
    capacidadTanque: number;
    tipoTanque: 'subterraneo' | 'aereo';
    
    // Gas Natural / Cilindros
    gasNaturalActivo: boolean;
    gasNaturalTipo: 'cilindros' | 'tuberias';
    gasNaturalProveedor: string;
    gasNaturalContrato: string;
    gasNaturalTelefono: string;
    gasNaturalEmail: string;
    gasNaturalDetalles: string;
    gasNaturalObservaciones: string;
}

// El tipo Cobranza no necesita exportarse si solo se usa en MainLayoutProps,
// pero se incluye para coherencia.
// ... (Otros tipos si los tienes)
// src/types/entidad.ts

export interface Entidad {
  
  id: number;
  clase: string;
  referencia: string;
  representante: string;
  propietario: string; // JSON.stringify
  inquilino: string | null;
  saldoActual: string;
  clasificacion: "DEUDOR" | "SOLVENTE" | string;
  fecUltGestion: string;
  fecProxGestion: string;
  comentarios: string;
  nombre: string;
  estadoActual: string;
  // ⭐ ¡ESTA PROPIEDAD FALTA Y CAUSA EL ERROR DE INCOMPATIBILIDAD! ⭐
  condicion: string; // <-- AÑADE ESTO (o el tipo correcto si no es string)
  vehiculos: Vehiculo[] | null; // ¡ESTO ES LO QUE NECESITAS AÑADIR/VERIFICAR!
  residentes: any | null; // Cambia 'any' por el tipo Residente[] si lo tienes definido
  servicios: string;
  cobranzas?: any[]; // Usamos 'any[]' o el tipo específico de la cobranza
}