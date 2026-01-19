import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    Box,
    Alert,
    MenuItem,
    Stack,
    Typography,
    Switch,
    FormControlLabel,
} from "@mui/material";
// Asegúrate de que esta ruta de importación sea correcta en tu proyecto
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

// ------------------------------------
// 1. INTERFACES DE DATOS
// ------------------------------------

interface PropietarioData {
    nombre: string;
    cedula: string;
    telefonos: {
        principal: string;
        secundario: string;
    };
    // ⭐ CORREGIDO: Usamos string para el input/state y luego parseamos para enviar a la API
    correos: string[]; 
    propietario?: boolean; 
}

interface InquilinoData {
    nombre: string;
    cedula: string;
    telefono: string;
    correo: string;
}

/**
 * Interfaz de la entidad.
 */
interface Entidad {
    id: number;
    clase: string;
    referencia: string;
    representante: "Propietario" | "Inquilino" | string;
    // Acepta string (JSON) o PropietarioData (Objeto anidado de la API)
    propietario: string | PropietarioData; 
    // Acepta string (JSON) o InquilinoData (Objeto anidado de la API) o null
    inquilino: string | InquilinoData | null; 
    saldoActual: string | number; 
    clasificacion: "DEUDOR" | "SOLVENTE" | string;
    fecUltGestion?: string; 
    fecProxGestion: string;
    comentarios: string;
    // La API devuelve 'ACTIVO'/'INACTIVO', pero internamente lo convertimos a boolean para el Switch
    estadoActual: string | boolean; 
    condicion: string; 
}

/**
 * FormData local para el estado del formulario.
 */
interface FormData {
    clase: string;
    referencia: string;
    representante: "Propietario" | "Inquilino"; 
    saldoActual: string;
    clasificacion: string;
    fecUltGestion: string;
    fecProxGestion: string;
    comentarios: string;
    condicion: "Habitada" | "Deshabitada" | "Alquilada"; 
    estadoActual: boolean; // Usamos boolean para el Switch
}

/**
 * Props del componente.
 */
interface EntidadFormDialogProps {
    open: boolean;
    onClose: (saved?: boolean) => void;
    entidadToEdit: Entidad | null;
    onSuccess: () => void;
}

interface AxiosErrorResponse {
    response?: {
        status?: number;
        data?: {
            error: string;
            message?: string; // Algunas APIs usan 'message' en lugar de 'error'
        };
    };
}

const BASE_API_URL = "https://bknd.condominios-online.com/entidades";

const DEFAULT_PROPIETARIO_DATA: PropietarioData = {
    nombre: "",
    cedula: "",
    telefonos: {
        principal: "",
        secundario: "",
    },
    correos: [],
};

const DEFAULT_INQUILINO_DATA: InquilinoData = {
    nombre: "",
    cedula: "",
    telefono: "",
    correo: "",
};

const CLASIFICACIONES = ["DEUDOR", "SOLVENTE", "MOROSO", "VACIO", "INACTIVO"];
const CONDICIONES: FormData['condicion'][] = ["Habitada", "Deshabitada", "Alquilada"];
const REPRESENTANTES: FormData['representante'][] = ["Propietario", "Inquilino"];

// ------------------------------------
// 2. FUNCIONES DE PARSEO (CORREGIDAS)
// ------------------------------------

/**
 * Función genérica de parseo seguro para el JSON anidado.
 * Asegura que se devuelva un objeto, incluso si la entrada es null o string inválido.
 */
const safeJsonParse = (data: string | object | null | undefined): any => {
    // ⭐ CORRECCIÓN: Si es nulo, indefinido o cadena vacía, devolvemos un objeto vacío para evitar TypeError.
    if (!data) {
        return {};
    }

    if (typeof data === 'string') {
        try {
            // Un chequeo adicional para cadenas vacías o de solo espacios.
            if (data.trim() === "") {
                return {};
            }
            return JSON.parse(data);
        } catch (e) {
            console.error("Error al parsear JSON:", e);
            return {};
        }
    } else if (typeof data === 'object' && data !== null) {
        return data;
    }
    return {};
};

/**
 * Parsea el propietario que puede ser un string JSON o un objeto directo.
 */
const parsePropietario = (propietarioData: string | PropietarioData | undefined): PropietarioData => {
    const parsed = safeJsonParse(propietarioData);
    
    // Asegurar la estructura anidada y el array de correos.
    return {
        ...DEFAULT_PROPIETARIO_DATA,
        ...parsed,
     telefonos: {
            // Esto asegura que al menos tienes un objeto telefonos vacío o por defecto
            ...DEFAULT_PROPIETARIO_DATA.telefonos,
            // Esto chequea si parsed.telefonos es null/undefined y usa {} en su lugar
            ...(parsed.telefonos || {}), 
        },
        // Asegurar que correos es un array (viene como array en la respuesta de tu API)
        correos: Array.isArray(parsed.correos) ? parsed.correos : [],
    };
};

/**
 * Parsea el inquilino que puede ser un string JSON o un objeto directo.
 */
const parseInquilino = (inquilinoData: string | InquilinoData | null | undefined): InquilinoData => {
    const parsed = safeJsonParse(inquilinoData);
    
    // ⭐ CORRECCIÓN: Fusionamos con el valor por defecto PRIMERO.
    // Esto garantiza que 'nombre' siempre exista en 'inquilinoWithDefaults'.
    const inquilinoWithDefaults = {
        ...DEFAULT_INQUILINO_DATA,
        ...parsed,
    };

    // Se considera que hay un inquilino válido si el campo 'nombre' no está vacío.
    if (inquilinoWithDefaults.nombre && inquilinoWithDefaults.nombre !== DEFAULT_INQUILINO_DATA.nombre) {
        return inquilinoWithDefaults;
    }
    
    // Si no hay datos válidos, retorna el objeto por defecto seguro.
    return DEFAULT_INQUILINO_DATA;
};

/**
 * Determina la condición inicial.
 */
const getInitialCondicion = (entidad: Entidad | null): FormData["condicion"] => {
    if (entidad?.condicion) {
        // Usamos .toUpperCase() para manejar inconsistencias (ALQUILADA, Alquilada, etc.)
        const apiCondicion = entidad.condicion.toUpperCase(); 

        if (apiCondicion === "ALQUILADA") {
            return "Alquilada";
        }
        if (apiCondicion === "DESHABITADA") {
            return "Deshabitada";
        }
        if (apiCondicion === "HABITADA") {
            return "Habitada";
        }
    }

    // Lógica de fallback: si hay datos de inquilino (que no sean los por defecto), asumimos 'Alquilada'
    const inquilino = parseInquilino(entidad?.inquilino);
    // ⭐ parseInquilino ahora garantiza que 'inquilino.nombre' es una cadena, no nulo.
    if (inquilino.nombre && inquilino.nombre !== DEFAULT_INQUILINO_DATA.nombre) {
        return "Alquilada";
    }
    
    return "Habitada"; 
};

/**
 * Determina el representante inicial.
 */
const getInitialRepresentante = (entidad: Entidad | null, condicion: FormData['condicion']): FormData['representante'] => {
    if (entidad?.representante) {
        // Convertimos la respuesta de la API (ej: "inquilino") a formato de formulario (ej: "Inquilino")
        const apiRepresentante: string = entidad.representante.charAt(0).toUpperCase() + entidad.representante.slice(1).toLowerCase();
        if (REPRESENTANTES.includes(apiRepresentante as FormData['representante'])) {
            return apiRepresentante as FormData['representante'];
        }
    }

    // Fallback: si está alquilada, el representante por defecto es Inquilino (si los datos de inquilino existen), 
    // sino, siempre Propietario.
    if (condicion === "Alquilada") {
        const inquilino = parseInquilino(entidad?.inquilino);
        if (inquilino.nombre) {
            return "Inquilino";
        }
    }
    
    return "Propietario";
};

/**
 * Obtiene el estado inicial completo del formulario.
 */
const getInitialFormState = (entidad: Entidad | null): FormData => {
    const condicion = getInitialCondicion(entidad);
    const representante = getInitialRepresentante(entidad, condicion);
    
    // Lógica para convertir el string 'Activo'/'Inactivo' a boolean:
    const estadoActualBool = entidad?.estadoActual 
        ? (String(entidad.estadoActual)).toUpperCase() === "ACTIVO" 
        : true; 

    return {
        clase: entidad?.clase ?? "",
        referencia: entidad?.referencia ?? "",
        representante: representante,
        // Convertimos 'saldoActual' (que puede ser number) a string para el TextField.
        saldoActual: String(entidad?.saldoActual ?? "0.00"), 
        clasificacion: entidad?.clasificacion ?? "SOLVENTE",
        // Solo tomamos la parte de la fecha (AAAA-MM-DD)
        fecUltGestion: entidad?.fecUltGestion?.split("T")[0] ?? "", 
        fecProxGestion: entidad?.fecProxGestion?.split("T")[0] ?? "",
        comentarios: entidad?.comentarios ?? "",
        condicion: condicion,
        estadoActual: estadoActualBool, 
    }
};

// ------------------------------------
// 3. COMPONENTE PRINCIPAL
// ------------------------------------

const EntidadFormDialog = ({
    open,
    onClose,
    entidadToEdit,
    onSuccess,
}: EntidadFormDialogProps) => {
    const { user } = useAuth(); 
    const isEditing = !!entidadToEdit;

    // Estados iniciales
    const [formData, setFormData] = useState<FormData>(
        getInitialFormState(entidadToEdit)
    );

    const [propietarioData, setPropietarioData] = useState<PropietarioData>(
        parsePropietario(entidadToEdit?.propietario)
    );

    const [inquilinoData, setInquilinoData] = useState<InquilinoData>(
        parseInquilino(entidadToEdit?.inquilino)
    );

    const isAlquilada = formData.condicion === "Alquilada";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Efecto para resetear el estado al abrir el diálogo o cambiar la entidad a editar.
     */
    useEffect(() => {
        if (open) {
            setFormData(getInitialFormState(entidadToEdit));
            setPropietarioData(parsePropietario(entidadToEdit?.propietario));
            setInquilinoData(parseInquilino(entidadToEdit?.inquilino));
            setError(null);
        }
    }, [entidadToEdit, open]);

    /**
     * Manejador de cambios para los campos del formulario principal.
     */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, checked, type } = e.target as HTMLInputElement;

        if (name === 'estadoActual' && type === 'checkbox') {
            setFormData((prev) => ({ ...prev, estadoActual: checked }));
            return;
        }

        if (name === "condicion") {
            const newCondicion = value as FormData["condicion"];
            setFormData((prev) => ({ ...prev, [name]: newCondicion }));
            
            // Si la condición cambia a algo que NO es Alquilada, limpiar datos del inquilino 
            // y asegurar que el representante es Propietario.
            if (newCondicion !== "Alquilada") {
                setInquilinoData(DEFAULT_INQUILINO_DATA);
                setFormData(prev => ({ ...prev, representante: "Propietario" }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    /**
     * Manejador de cambios para los campos de datos del propietario.
     */
    const handlePropietarioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setPropietarioData(prev => {
            if (name.startsWith("telefono-")) {
                const phoneKey = name.split("-")[1] as keyof PropietarioData['telefonos'];
                return {
                    ...prev,
                    telefonos: { ...prev.telefonos, [phoneKey]: value }
                };
            }

            if (name === 'correos') {
                // Maneja la entrada de correos separados por coma, limpia espacios y quita entradas vacías.
                const correosArray = value.split(',').map(c => c.trim()).filter(c => c.length > 0);
                return { ...prev, correos: correosArray };
            }
            
            // Maneja los campos directos (nombre, cedula)
            return { ...prev, [name as keyof PropietarioData]: value };
        });
    };

    /**
     * Manejador de cambios para los campos de datos del inquilino.
     */
    const handleInquilinoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInquilinoData((prev) => ({ ...prev, [name as keyof InquilinoData]: value }));
    };


    /**
     * Validaciones del formulario.
     */
    const validateForm = (): boolean => {
        if (!formData.clase || !formData.referencia || !formData.representante) {
            setError("Los campos Clase/Nombre, Referencia y Representante son obligatorios.");
            return false;
        }
        
        // ⭐ Corregido: Validación de SaldoActual más estricta para números
        const saldo = parseFloat(formData.saldoActual);
        if (isNaN(saldo) || saldo < 0) {
            setError("El Saldo Actual debe ser un número positivo válido.");
            return false;
        }
        
        if (isAlquilada) {
            // Aseguramos que los campos obligatorios del inquilino se llenen si está alquilada
            if (!inquilinoData.nombre || !inquilinoData.telefono) {
                setError("Si la condición es 'Alquilada', el Nombre y Teléfono del Inquilino son obligatorios.");
                return false;
            }
        }
        
        // Si el representante es Inquilino, debe estar alquilada.
        if (formData.representante === "Inquilino" && !isAlquilada) {
             setError("El Representante no puede ser 'Inquilino' si la Condición no es 'Alquilada'.");
             return false;
        }
        
        setError(null);
        return true;
    };

    /**
     * Envío del formulario (Creación o Edición).
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        const token = user?.token;
        if (!token) {
            setError("Token no disponible. Por favor, inicia sesión.");
            setLoading(false);
            return;
        }

        // 1. JSON Propietario: Añadimos 'propietario: true' si no existe, ya que aparece en tu respuesta de API.
        const finalPropietarioData: PropietarioData = { 
            ...propietarioData,
            propietario: true 
        };
        const finalPropietarioJson = JSON.stringify(finalPropietarioData);

        // 2. JSON Inquilino: Si no está alquilada, enviamos los datos por defecto (vacíos), lo que la API debería interpretar como null/vacío.
        const finalInquilinoData = isAlquilada ? inquilinoData : DEFAULT_INQUILINO_DATA;
        const finalInquilinoJson = JSON.stringify(finalInquilinoData);

        // 3. Conversión de estadoActual (boolean -> string 'ACTIVO'/'INACTIVO')
        const estadoActualString = formData.estadoActual ? "ACTIVO" : "INACTIVO"; 

        // 4. Crear el payload final para la API
        const payload = {
            // Campos principales del formulario
            clase: formData.clase,
            referencia: formData.referencia,
            // ⭐ CORREGIDO: La API espera "propietario" o "inquilino" en minúsculas.
            representante: formData.representante.toLowerCase(), 
            // Enviamos el saldo como número
            saldoActual: parseFloat(formData.saldoActual), 
            clasificacion: formData.clasificacion,
            fecUltGestion: formData.fecUltGestion || null, // Enviamos null si está vacío para evitar problemas de fecha vacía
            fecProxGestion: formData.fecProxGestion || null, // Enviamos null si está vacío para evitar problemas de fecha vacía
            comentarios: formData.comentarios,
            // ⭐ CORREGIDO: La API parece preferir la condición en mayúsculas ("ALQUILADA").
            condicion: formData.condicion.toUpperCase(), 
            
            // Campos que la API espera con nombres específicos
            nombre: formData.clase, 
            propietario: finalPropietarioJson, 
            inquilino: finalInquilinoJson,
            estadoActual: estadoActualString, 
        };
        
        const url = isEditing ? `${BASE_API_URL}/${entidadToEdit!.id}` : `${BASE_API_URL}/`;
        
        console.log("➡️ Payload enviado a la API:", { 
            method: isEditing ? 'PUT' : 'POST',
            url: url,
            payload: {
                ...payload,
                // Parseamos el JSON para mostrar los datos internos en el log
                propietario: JSON.parse(payload.propietario),
                inquilino: JSON.parse(payload.inquilino),
                estadoActual: payload.estadoActual
            }
        });

        try {
            const headers = { Authorization: `Bearer ${token}` };

            let response;
            if (isEditing) {
                // Usamos axios.put para la edición
                response = await axios.put(url, payload, { headers }); 
            } else {
                // Usamos axios.post para la creación
                response = await axios.post(url, payload, { headers });
            }

            console.log(
                `✅ Respuesta de la API (${isEditing ? 'PUT' : 'POST'} - ${response.status}):`, 
                response.data
            );
            
            onSuccess();
            onClose(true); 
        } catch (err) {
            const axiosError = err as AxiosErrorResponse;
            const defaultMessage = isEditing ? "Error al actualizar la entidad." : "Error al crear la entidad.";
            // Intenta obtener el error de 'error' o 'message' de la respuesta de la API.
            const apiErrorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message;
            const errorMessage = apiErrorMessage || defaultMessage;

            console.error("❌ ERROR:", errorMessage, axiosError);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------
    // 4. RENDERIZADO DEL COMPONENTE
    // ------------------------------------

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="lg" fullWidth>
            <DialogTitle>
                {isEditing ? `✏️ Editar Entidad ID: ${entidadToEdit?.id}` : "➕ Crear Nueva Entidad"}
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Stack spacing={2}>
                        {/* SECCIÓN DATOS PRINCIPALES */}
                        <Typography variant="subtitle1" fontWeight="bold">
                            Datos Generales de la Entidad
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                                margin="none" name="clase" label="Clase / Nombre" fullWidth variant="outlined"
                                value={formData.clase} onChange={handleChange} required size="small" sx={{ flex: 1 }}
                            />
                            <TextField
                                margin="none" name="referencia" label="Referencia" fullWidth variant="outlined"
                                value={formData.referencia} onChange={handleChange} required size="small" sx={{ flex: 1 }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                                select margin="none" name="clasificacion" label="Clasificación" fullWidth variant="outlined"
                                value={formData.clasificacion} onChange={handleChange} size="small" sx={{ flex: 1 }}
                            >
                                {CLASIFICACIONES.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                margin="none" name="saldoActual" label="Saldo Actual" type="number" fullWidth variant="outlined"
                                value={formData.saldoActual} onChange={handleChange} inputProps={{ step: "0.01" }} size="small" sx={{ flex: 1 }}
                            />
                        </Box>

                        <hr />

                        {/* SECCIÓN DETALLES DE OCUPACIÓN */}
                        <Typography variant="subtitle1" fontWeight="bold">
                            Detalles de Ocupación
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                                select margin="none" name="condicion" label="Condición" fullWidth variant="outlined"
                                value={formData.condicion} onChange={handleChange} size="small" required sx={{ flex: 1 }}
                            >
                                {CONDICIONES.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select margin="none" name="representante" label="Representante" fullWidth variant="outlined"
                                value={formData.representante} onChange={handleChange} required size="small" sx={{ flex: 1 }}
                            >
                                {REPRESENTANTES.map((option) => (
                                    <MenuItem 
                                        key={option} 
                                        value={option} 
                                        // ⭐ Deshabilitar Inquilino si no está alquilada
                                        disabled={!isAlquilada && option === "Inquilino"} 
                                    >
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {/* SUB-FORMULARIO DE INQUILINO (RENDERIZADO CONDICIONAL) */}
                        {isAlquilada && (
                            <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1, mt: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                    Datos del Inquilino
                                </Typography>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                        <TextField
                                            margin="none" name="nombre" label="Nombre del Inquilino" fullWidth variant="outlined"
                                            value={inquilinoData.nombre} onChange={handleInquilinoChange} required={isAlquilada} size="small" sx={{ flex: 1.5 }}
                                        />
                                        <TextField
                                            margin="none" name="cedula" label="Cédula/ID Inquilino" fullWidth variant="outlined"
                                            value={inquilinoData.cedula} onChange={handleInquilinoChange} size="small" sx={{ flex: 1 }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                        <TextField
                                            margin="none" name="telefono" label="Teléfono Inquilino" fullWidth variant="outlined"
                                            value={inquilinoData.telefono} onChange={handleInquilinoChange} required={isAlquilada} size="small" sx={{ flex: 1 }}
                                        />
                                        <TextField
                                            margin="none" name="correo" label="Correo Inquilino" fullWidth variant="outlined"
                                            value={inquilinoData.correo} onChange={handleInquilinoChange} size="small" sx={{ flex: 1 }}
                                        />
                                    </Box>
                                </Stack>
                            </Box>
                        )}
                        
                        <hr />

                        {/* SUB-FORMULARIO DE PROPIETARIO */}
                        <Typography variant="subtitle1" fontWeight="bold">
                            Datos del Propietario
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start' }}>
                            <TextField
                                margin="none" name="nombre" label="Nombre del Propietario" fullWidth variant="outlined"
                                value={propietarioData.nombre} onChange={handlePropietarioChange} size="small" sx={{ flex: 1.5 }}
                            />
                            <TextField
                                margin="none" name="cedula" label="Cédula/ID Propietario" fullWidth variant="outlined"
                                value={propietarioData.cedula} onChange={handlePropietarioChange} size="small" sx={{ flex: 1 }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                                margin="none" name="telefono-principal" label="Teléfono Principal" fullWidth variant="outlined"
                                value={propietarioData.telefonos.principal} onChange={handlePropietarioChange} size="small" sx={{ flex: 1 }}
                            />
                            <TextField
                                margin="none" name="telefono-secundario" label="Teléfono Secundario" fullWidth variant="outlined"
                                value={propietarioData.telefonos.secundario} onChange={handlePropietarioChange} size="small" sx={{ flex: 1 }}
                            />
                        </Box>

                        <TextField
                            fullWidth label="Correos (separados por coma, ej: a@mail.com, b@mail.com)"
                            name="correos" multiline rows={1} variant="outlined" size="small"
                            value={propietarioData.correos.join(', ')}
                            onChange={handlePropietarioChange}
                        />

                        <hr />
                        
                        {/* SECCIÓN GESTIÓN Y COMENTARIOS */}
                        <Typography variant="subtitle1" fontWeight="bold">
                            Gestión y Comentarios
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start' }}>
                            <TextField
                                margin="none" name="fecUltGestion" label="Fecha Última Gestión" type="date" fullWidth variant="outlined"
                                value={formData.fecUltGestion} onChange={handleChange} InputLabelProps={{ shrink: true }} size="small" sx={{ flex: 1 }}
                            />
                            <TextField
                                margin="none" name="fecProxGestion" label="Fecha Próxima Gestión" type="date" fullWidth variant="outlined"
                                value={formData.fecProxGestion} onChange={handleChange} InputLabelProps={{ shrink: true }} size="small" sx={{ flex: 1 }}
                            />
                            {/* SWITCH DE ESTADO ACTUAL */}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.estadoActual}
                                        onChange={handleChange}
                                        name="estadoActual"
                                        color="primary"
                                    />
                                }
                                label={
                                    <Stack direction="column" spacing={-0.5} sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="textSecondary">
                                            Estado Actual
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            fontWeight="bold" 
                                            color={formData.estadoActual ? 'success.main' : 'error.main'}
                                        >
                                            {formData.estadoActual ? 'Activo' : 'Inactivo'}
                                        </Typography>
                                    </Stack>
                                }
                                sx={{ 
                                    flexShrink: 0, 
                                    m: 0, 
                                    pt: 0.5, 
                                    alignItems: 'center', 
                                    '.MuiFormControlLabel-label': { ml: 0.5 }
                                }}
                            />
                        </Box>

                        <TextField
                            fullWidth label="Comentarios" name="comentarios" multiline rows={3} variant="outlined"
                            value={formData.comentarios} onChange={handleChange} size="small"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => onClose()} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={
                            loading ? <CircularProgress size={20} color="inherit" /> : null
                        }
                    >
                        {isEditing ? "Guardar Cambios" : "Crear Entidad"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default EntidadFormDialog;