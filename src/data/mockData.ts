// src/data/mockData.ts

import {  TransaccionEcta, Servicios, Residente, Vehiculo } from '../types/types';


// Datos simulados para Residentes (pestaña Residentes)
export const mockResidentes: Residente[] = [
    { id: 1, nombre: "Juan Pérez", fecNacimiento: "15/05/1980", parentesco: "Propietario", status: true },
    { id: 2, nombre: "María L. González", fecNacimiento: "22/08/1985", parentesco: "Inquilino", status: true },
    { id: 3, nombre: "Jhon P. Pérez", fecNacimiento: "10/01/2010", parentesco: "Hijo", status: true },
];

// Datos simulados para Vehículos (pestaña Vehículos)
export const mockVehiculos: Vehiculo[] = [
    { id: 101, placa: "PAA-00A", marca: "Toyota", modelo: "Corolla", color: "Gris" },
    { id: 102, placa: "ABC-123", marca: "Ford", modelo: "Explorer", color: "Negro" },
];

// Datos simulados para Estado de Cuenta (pestaña Estado de Cuenta)
export const mockEcta: TransaccionEcta[] = [
    { id: 1, fecha: "01/08/2025", tipo: "Cuota", referencia: "AGO2025", concepto: "Cuota de Mantenimiento Agosto 2025", debitos: "$15.00", creditos: "$0.00", saldo: "$15.00" },
    { id: 2, fecha: "05/08/2025", tipo: "Cobro", referencia: "00001", concepto: "Pago cuota Agosto 2025", debitos: "$0.00", creditos: "$15.00", saldo: "$0.00" },
    { id: 3, fecha: "01/09/2025", tipo: "Cuota", referencia: "SEP2025", concepto: "Cuota de Mantenimiento Septiembre 2025", debitos: "$15.00", creditos: "$0.00", saldo: "$15.00" },
    { id: 4, fecha: "15/09/2025", tipo: "NotaDéb", referencia: "ND-001", concepto: "Recargo por pago tardío", debitos: "$1.50", creditos: "$0.00", saldo: "$16.50" },
];

// Datos simulados para Bitácora (pestaña Bitácora)
export const objBitacora = [
    { fecha: "01/10/2025 10:00", detalle: "Se genera Cuota de Mantenimiento OCT2025" },
    { fecha: "01/10/2025 10:05", detalle: "Se notifica al Propietario por Email" },
    { fecha: "04/10/2025 15:30", detalle: "Cobro registrado por $15.00. Ref: CBB002" },
];

// Datos para la Constancia de Residencia (pestaña Documentos)
export const valoresConstanciaResidencia = [
    { nombre: "Juan Pérez", cedula: "V-12345678" },
    { nombre: "María L. González", cedula: "V-20000000" },
];

// Contenido de Documentos (pestaña Documentos)
export const objDocumentos: { [key: string]: { titulo: string, contenido: string } } = {
    autorMudanza: {
        titulo: "Autorización de Mudanza",
        contenido: "Por la presente, la Administración autoriza la mudanza de enseres desde/hacia la unidad C-34, el día [FECHA]. Horario permitido: 8:00am - 4:00pm. Debe coordinar con vigilancia. [Firma del Administrador]",
    },
    autorVisitas: {
        titulo: "Autorización de Ingreso de Visitas (Frecuentes)",
        contenido: "Se autoriza el ingreso de los vehículos/personas listadas para la unidad C-34, hasta nuevo aviso. Esta autorización debe ser notificada previamente a la vigilancia. [Firma del Propietario/Inquilino]",
    },
};

// Datos iniciales para la pestaña de Servicios
export const initialServiciosData: Servicios = {
    // Servicios Básicos
    electricidad: true,
    aseoPublico: true,
    aseoPrivado: false,
    internet: true,
    proveedorInternet: "NetOne / 12345678",
    
    // Suministro de Agua
    capacidadTanque: 5000,
    tipoTanque: "subterraneo", // 'subterraneo' | 'aereo'
    
    // Gas Natural / Cilindros
    gasNaturalActivo: true,
    gasNaturalTipo: "tuberias", // 'cilindros' | 'tuberias'
    gasNaturalProveedor: "GasCom",
    gasNaturalContrato: "GNC-00456",
    gasNaturalTelefono: "0255-9990000",
    gasNaturalEmail: "gascom@mail.com",
    gasNaturalDetalles: "Medidor en pared lateral.",
    gasNaturalObservaciones: "No tiene pedidos pendientes."
};

// Datos para Cobranza
export const mockCobranza = {
    formasPago: ["Transferencia", "Pago Móvil", "Depósito $", "Zelle"],
    bancos: ["Mercantil", "Provincial", "Banesco", "Banco de Origen $"],
    cuentas: ["Cta. Corriente Bs", "Cta. Ahorro $"],
    monedas: ["$", "€"],
    monedaBanco: ["Bs", "$"],
    tasaOficial: 36.50,
    periodoActual: { periodo: 10, año: 2025 },
};