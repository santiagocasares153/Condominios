import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Container,
    Typography,
    Button,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Stack,
    Chip,
    // Imports para Modales y Formularios
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import {
    Edit as EditIcon,
    Apartment as CondominiosIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import NavigationMenu from "../../components/Menu";
import EntidadFormDialog from "./EntidadFormDialog"; // Importar el componente de formulario

/**
 * Interfaz de la entidad. Se mantiene como estaba ya que
 * EntidadFormDialog y el mapeo de datos lo esperan.
 */
interface Entidad {
    id: number;
    clase: string;
    referencia: string;
    representante: string;
    propietario: string; // Se mantiene string ya que se almacenará el JSON.stringify del objeto propietario
    inquilino: string | null;
    saldoActual: string;
    clasificacion: "DEUDOR" | "SOLVENTE" | "MOROSO" | string;
    fecUltGestion: string;
    fecProxGestion: string;
    comentarios: string;
    nombre: string;
    estadoActual: string;
    condicion: string;
}

// Interfaz para la respuesta del servidor con la estructura anidada que proporcionaste
interface ServerResponseWrapper {
    data: {
        metadata: {
            info: string;
        };
        data: Array<{
            "@res": string; // El string JSON anidado
        }>;
    };
}

const BASE_API_URL = "https://bknd.condominios-online.com/entidades";
const ENDPOINT_GET_ALL = `${BASE_API_URL}/`;

const TableEntidades = (/* props: TableProps */) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<Entidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ESTADOS PARA EL FORMULARIO (Creación/Edición)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEntidad, setSelectedEntidad] = useState<Entidad | null>(null);

    // ESTADOS PARA EL MODAL DE ELIMINACIÓN
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entidadToDelete, setEntidadToDelete] = useState<Entidad | null>(null);
    const [deleteReason, setDeleteReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    
    // ESTADOS PARA EL MODAL DE ÉXITO
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Función para obtener los datos
const fetchEntidades = async () => {
    setLoading(true);
    setError("");
    const token = user?.token;
    if (!token) {
        setError("Token de usuario no disponible. Por favor, inicia sesión.");
        setLoading(false);
        return;
    }

    try {
        const response = await axios.get<ServerResponseWrapper | any>(
            ENDPOINT_GET_ALL,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Respuesta completa del servidor al obtener entidades:", response.data);
        let rawServerResponse: ServerResponseWrapper | any = response.data;
        
        // 1. 💡 CORRECCIÓN PRINCIPAL: Ajustar la ruta de acceso al string JSON anidado
        // La ruta correcta es data[0]['@res'], no data.data[0]['@res']
        let escapedJsonString: string | null = rawServerResponse?.data?.[0]?.["@res"] || null;
        
    //    console.log("Respuesta del servidor al obtener entidades (String JSON @res):", escapedJsonString); 

        let entitiesArray: any[] = [];
        let parsedServerResponse: any = null;

        if (escapedJsonString && typeof escapedJsonString === 'string') {
            
            // 2. Limpieza del string JSON anidado (Necesaria por los caracteres 'rn' y escapes)
            let cleanedString = escapedJsonString
                .replace(/\\"/g, '"') // Reemplaza comillas escapadas incorrectamente
                .replace(/\n/g, '')  // Elimina saltos de línea
                .replace(/\r/g, '')  // Elimina retornos de carro
                .replace(/rn\s*/g, ''); // Elimina 'rn' seguido de espacios
            
            try {
                // Parseo del string anidado (contiene 'response', 'status' y 'body')
                parsedServerResponse = JSON.parse(cleanedString);
            } catch (e) {
                console.error("Error al parsear el JSON anidado en @res. String limpio:", cleanedString, e);
                setError("Error en el formato de datos anidados del servidor.");
                setLoading(false);
                return;
            }
            
            // 3. Extracción del array de entidades desde el campo 'body' del JSON anidado
            if (parsedServerResponse?.body && Array.isArray(parsedServerResponse.body)) {
                entitiesArray = parsedServerResponse.body;
            }

        } else {
             // Fallback de advertencia si la estructura cambia inesperadamente en el futuro
             console.warn("La estructura de la respuesta JSON anidada no se encontró o no es un string. No hay entidades para procesar.");
        }
        
        if (!Array.isArray(entitiesArray)) {
            entitiesArray = [];
        }
        
        let finalData: Entidad[];

        // 4. Mapeo y Normalización de datos (La lógica de limpieza interna es robusta y se mantiene)
        finalData = entitiesArray.map((item: any, index: number) => {
            
            const rawVehiculos = item.vehiculos;
            let cleanVehiculos = [];
            if (Array.isArray(rawVehiculos)) {
           cleanVehiculos = rawVehiculos;
            } else if (typeof rawVehiculos === 'string' && rawVehiculos.toUpperCase() !== "NULL") {
                try {
                    cleanVehiculos = JSON.parse(rawVehiculos);
                } catch {
                    cleanVehiculos = [];
                }
            }
            // **Manejo del campo 'propietario'**
            let propietarioObject: any = null;
            if (typeof item.propietario === 'string' && item.propietario.trim().startsWith('{')) {
                let propToClean = item.propietario;
                propToClean = propToClean.replace(/rn\s*/g, '');
                propToClean = propToClean.replace(/\\"/g, '"');
                propToClean = propToClean.replace(/\n/g, '').replace(/\r/g, '');

                try {
                    propietarioObject = JSON.parse(propToClean);
                } catch (error) {
                    console.warn(`No se pudo parsear el JSON de propietario para entidad ${item.referencia}. Se usará como null.`, error);
                    propietarioObject = null;
                }
            } else if (typeof item.propietario === 'object' && item.propietario !== null) {
                propietarioObject = item.propietario;
            }

            // **Manejo del campo 'inquilino'**
            let inquilinoObject: any = null;
            if (typeof item.inquilino === 'object' && item.inquilino !== null) {
                inquilinoObject = item.inquilino;
            } else if (typeof item.inquilino === 'string' && item.inquilino.trim().startsWith('{')) {
                try {
                    inquilinoObject = JSON.parse(item.inquilino.replace(/rn\s*/g, '').replace(/\\"/g, '"'));
                } catch (error) {
                    inquilinoObject = null;
                }
            }


            // Se asignan valores por defecto o se ajustan tipos
            return {
                ...item,
                id: item.id || (index + 1),
                nombre: item.clase || "",
                saldoActual: String(item.saldoActual === null || item.saldoActual === undefined ? "0.00" : item.saldoActual),
                propietario: propietarioObject ? JSON.stringify(propietarioObject) : JSON.stringify(null),
                inquilino: inquilinoObject ? JSON.stringify(inquilinoObject) : JSON.stringify(null),
                fecUltGestion: item.fecUltGestion || "",
                fecProxGestion: item.fecProxGestion || "",
                clasificacion: item.clasificacion || "",
                estadoActual: item.estadoActual || "",
                condicion: item.condicion || "",
                referencia: item.referencia || "N/A",
                representante: item.representante || "N/A",
                comentarios: item.comentarios || "",
                vehiculos: cleanVehiculos,
            } as Entidad;
        });

        setData(finalData);
    } catch (err) {
        console.error("Error fetching entidades:", err);
        const errorObj = err as any; 
        const errorMessage = errorObj.response?.data?.message || errorObj.message || "Error al obtener las entidades del servidor.";
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
};
    useEffect(() => {
        // Asegurarse de que el token esté disponible antes de la primera llamada
        if (user?.token) {
            fetchEntidades();
        }
    }, [user?.token]);


    // MANEJADORES DE APERTURA/CIERRE DEL FORMULARIO (Creación/Edición)
    const handleCreate = () => {
        setSelectedEntidad(null); // Establece null para modo Creación
        setIsFormOpen(true);
    };

    const handleEdit = (entidad: Entidad) => {
        setSelectedEntidad(entidad); // Establece la entidad para modo Edición
        setIsFormOpen(true);
    };

    const handleCloseForm = (saved: boolean = false) => {
        setIsFormOpen(false);
        setSelectedEntidad(null);
        if (saved) {
            // Si se guardó exitosamente (creación o edición), recargar los datos
            fetchEntidades();
        }
    };
    // ----------------------------------------------------


    // MANEJADORES DE ELIMINACIÓN
    
    // Handler para abrir el modal de eliminación
    const handleDeleteClick = (entidad: Entidad) => {
        setEntidadToDelete(entidad);
        setDeleteReason(""); // Limpiar motivo anterior
        setIsDeleteModalOpen(true);
        setDeleteError(""); // Limpiar error anterior
    };

    // Handler para cerrar el modal de eliminación
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setEntidadToDelete(null);
        setDeleteReason("");
        setDeleteError("");
        setIsDeleting(false);
    };
    
    // HANDLER PARA CERRAR EL MODAL DE ÉXITO
    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
        setSuccessMessage("");
        // Recargar datos solo después de que el usuario reconoce el éxito
        fetchEntidades(); 
    };


    /**
     * Confirma la eliminación de la entidad utilizando el método HTTP DELETE
     * y pasa el motivo de la eliminación en el cuerpo de la petición.
     */

    // Handler para confirmar la eliminación
    const confirmDelete = async () => {
        if (!entidadToDelete || !deleteReason.trim()) {
            setDeleteError("Por favor, ingrese un motivo para la eliminación.");
            return;
        }

        const token = user?.token;
        if (!token) {
            setDeleteError("Token de usuario no disponible. Por favor, inicia sesión.");
            return;
        }

        setIsDeleting(true);
        setDeleteError("");

        // Endpoint con el ID al final
        const ENDPOINT_DELETE = `${BASE_API_URL}/${entidadToDelete.id}`;

        try {
            // Se usa axios.request para forzar un body con el método DELETE
            const response = await axios.request<any>({ 
                url: ENDPOINT_DELETE,
                method: 'DELETE', // Especifica el método HTTP
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                // Aquí 'data' es una propiedad conocida para cualquier tipo de request.
                data: { 
                    action: "delete",
                    motivoEliminacion: deleteReason.trim(), 
                }
            });

            console.log("Respuesta de eliminación:", response);

            // Asume éxito si el estado es 200 y la respuesta del servidor indica éxito
            if (
                response.status === 200 && 
                (response.data?.data?.status === "success" || response.data?.status === 200 || response.data?.status === "success" || response.data?.body?.status === "success")
            ) {
                // Cerrar modal de eliminación
                handleCloseDeleteModal();
                
                // Mostrar el modal de éxito con el mensaje de la API
                const message = response.data?.data?.response || response.data?.response || response.data?.body?.response || "Entidad eliminada correctamente.";
                setSuccessMessage(message.trim());
                setIsSuccessModalOpen(true);
                
                // Nota: fetchEntidades se llama en handleCloseSuccessModal.
                
            } else {
                console.error("Error al intentar eliminar (respuesta del servidor):", response.data);
                const errorMessage = response.data?.data?.response || response.data?.message || response.data?.body?.response || 'Respuesta inesperada del servidor.';
                setDeleteError(`Error al eliminar: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Error al eliminar entidad:", err);
            
            const errorObj = err as any; 
            const errorMessage = errorObj.response?.data?.message || errorObj.response?.data?.response || errorObj.message
                ? (errorObj.response?.data?.message || errorObj.response?.data?.response || errorObj.message)
                : "Error de red o del servidor al intentar eliminar la entidad.";

            setDeleteError(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };
    
    
    // ----------------------------------------------------
    // ✅ FUNCIÓN MODIFICADA: Manejar el click en la fila para obtener detalle y navegar
  const handleRowClick = async (entidad: Entidad) => {
    const token = user?.token;
    if (!token) {
        console.error("Token de usuario no disponible para obtener detalle.");
        navigate(`/home/${entidad.id}`); 
        return;
    }

    const ENDPOINT_GET_DETAIL = `${BASE_API_URL}/${entidad.id}`;
    
    // Variable para guardar la entidad final (la de la tabla o la del servidor)
    let entidadFinal: Entidad = entidad;

    try {
        console.log(`Iniciando petición GET para el detalle de ID: ${entidad.id}`);

        const response = await axios.get<any>(ENDPOINT_GET_DETAIL, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const rawServerResponse = response.data;
        let escapedJsonString = rawServerResponse?.data?.[0]?.["@res"] || null;

        if (escapedJsonString && typeof escapedJsonString === 'string') {
            let cleanedString = escapedJsonString
                .replace(/\\"/g, '"') 
                .replace(/\n/g, '')  
                .replace(/\r/g, '')  
                .replace(/rn\s*/g, ''); 

            try {
                const parsedServerResponse = JSON.parse(cleanedString);
                
                // Si el body existe y trae datos, actualizamos entidadFinal con la info fresca del servidor
                if (parsedServerResponse?.body && parsedServerResponse.body[0]) {
                    console.log("Datos del servidor obtenidos con éxito:", parsedServerResponse.body[0]);
                    
                    // Mezclamos lo que ya tenemos con lo que viene del servidor por si acaso
                    entidadFinal = {
                        ...entidad,
                        ...parsedServerResponse.body[0]
                    };
                }
            } catch (e) {
                console.error(`Error al parsear el JSON del detalle.`, e);
                // Si falla el parseo, entidadFinal seguirá siendo la 'entidad' que recibimos por parámetro
            }
        }

    } catch (err) {
        console.error(`Error al obtener el detalle desde el servidor:`, err);
        // Si el API falla, no bloqueamos al usuario, usamos los datos que ya tenemos de la tabla
    }

    /**
     * ✅ LA CLAVE: Enviamos 'entidadFinal' en el state. 
     * Esto evita que HomePage tenga que volver a hacer el proceso de limpieza y parseo.
     */
    navigate(`/home/${entidad.id}`, { state: { entidad: entidadFinal } });
};

    // ----------------------------------------------------


    if (loading)
        return (
            <Stack alignItems="center" mt={6}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" mt={2}>
                    Cargando entidades...
                </Typography>
            </Stack>
        );

    if (error)
        return (
            <Container maxWidth="md" sx={{ mt: 6 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );

    return (
        <Container maxWidth="lg" sx={{ pt: 1 }}>
            {/* COMPONENTE DE FORMULARIO INTEGRADO */}
            <EntidadFormDialog
                open={isFormOpen}
                onClose={handleCloseForm}
                entidadToEdit={selectedEntidad} // ✅ El tipado ahora es correcto
                onSuccess={() => handleCloseForm(true)} // Llama a handleCloseForm(true) para forzar recarga
            />

            <NavigationMenu />
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <CondominiosIcon sx={{ color: "#00897b" }} fontSize="large" />
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        Gestión de Entidades
                    </Typography>
                </Stack>
                <Button
                    variant="contained"
                    onClick={handleCreate} 
                    startIcon={<AddIcon />}
                    sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 0.8,
                        textTransform: "none",
                        backgroundColor: "#00695c",
                        "&:hover": { backgroundColor: "#004d40" },
                        boxShadow: 3,
                    }}
                >
                    Agregar
                </Button>
            </Stack>

            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                }}
            >
                <Table sx={{ minWidth: 800 }} size="small">
                    <TableHead>
                        <TableRow sx={{ background: "#004d40" }}>
                            {[
                                "ID",
                                "Referencia",
                                "Representante",
                                "Propietario",
                                "Habitada",
                                "Clasif.",
                                "Saldo Actual",
                                "Acciones",
                            ].map((header) => (
                                <TableCell
                                    key={header}
                                    sx={{
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: 13,
                                        borderBottom: "none",
                                        py: 1,
                                    }}
                                >
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((entidad) => {
                                // Aquí es donde se parsea el string de propietario ANTES de mostrarlo
                                let propietarioObj: any;
                                try {
                                    // Intenta parsear el string JSON del propietario
                                    propietarioObj = entidad.propietario && entidad.propietario.trim().startsWith('{')
                                        ? JSON.parse(entidad.propietario)
                                        : {};
                                } catch (e) {
                                    propietarioObj = {};
                                }

                                // Determina si la entidad tiene información de propietario
                                // Se asume que si hay un campo 'propietario' en el objeto, entonces es un propietario.
                                // Si 'propietario' es un objeto complejo, esta lógica podría necesitar más ajuste.
                                const esPropietario = propietarioObj && Object.keys(propietarioObj).length > 0 && propietarioObj.propietario === true ? "Sí" : "No";
                                
                                // Determina si la entidad está habitada por un inquilino
                                const habitada = entidad.inquilino ? "Sí" : "No";

                                return (
                                    <TableRow
                                        key={entidad.id}
                                        hover
                                        // ✅ CAMBIO CLAVE: Llama a la nueva función que hace el GET y luego navega
                                        onClick={() => handleRowClick(entidad)}
                                        sx={{
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                backgroundColor: "#f5f5f5",
                                                transform: "scale(1.005)",
                                            },
                                        }}
                                    >
                                        <TableCell>{entidad.id}</TableCell>
                                        <TableCell>{entidad.referencia}</TableCell>
                                        <TableCell>{entidad.representante}</TableCell>
                                        <TableCell>{esPropietario}</TableCell>
                                        <TableCell>{habitada}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={entidad.clasificacion || "N/A"}
                                                size="small"
                                                sx={{
                                                    fontWeight: "bold",
                                                    textTransform: "capitalize",
                                                    color: "white",
                                                    backgroundColor:
                                                        entidad.clasificacion === "DEUDOR"
                                                            ? "#d32f2f" // Rojo
                                                            : entidad.clasificacion === "MOROSO"
                                                                ? "#f57c00" // Naranja
                                                                : entidad.clasificacion === "SOLVENTE"
                                                                    ? "#388e3c" // Verde
                                                                    : "#0288d1", // Azul (Por defecto)
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600}>
                                                ${Number(entidad.saldoActual).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                            {/* Botón de Editar */}
                                            <Tooltip title="Editar entidad">
                                                <IconButton
                                                    onClick={() => handleEdit(entidad)} 
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: "#00897b",
                                                        color: "white",
                                                        "&:hover": { backgroundColor: "#00695c" },
                                                        marginRight: 1, // Separación
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Botón de Eliminar */}
                                            <Tooltip title="Eliminar entidad">
                                                <IconButton
                                                    onClick={() => handleDeleteClick(entidad)}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: "#d32f2f", // Rojo
                                                        color: "white",
                                                        "&:hover": { backgroundColor: "#b71c1c" },
                                                    }}
                                                    // Deshabilita si se está borrando O si esta entidad es la que se está borrando
                                                    disabled={isDeleting && entidadToDelete?.id !== entidad.id}
                                                >
                                                    {isDeleting && entidadToDelete?.id === entidad.id ? (
                                                        <CircularProgress size={16} color="inherit" />
                                                    ) : (
                                                        <DeleteIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No se encontraron entidades.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Diálogo de Confirmación de Eliminación */}
            <Dialog
                open={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                aria-labelledby="delete-dialog-title"
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle id="delete-dialog-title">
                    Confirmar Eliminación de Entidad
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        ¿Está seguro que desea eliminar la entidad:
                        <Typography component="span" fontWeight="bold">
                            {" "}{entidadToDelete?.referencia || "N/A"} (ID: {entidadToDelete?.id})
                        </Typography>?
                    </Typography>

                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    )}

                    <TextField
                        autoFocus
                        margin="dense"
                        id="deleteReason"
                        label="Motivo de la Eliminación (Requerido)"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        disabled={isDeleting}
                        error={!!deleteError && deleteReason.trim() === ""}
                        helperText={deleteReason.trim() === "" ? "El motivo es obligatorio para proceder." : ""}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCloseDeleteModal}
                        disabled={isDeleting}
                        variant="outlined"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                        disabled={isDeleting || deleteReason.trim() === ""}
                        startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Diálogo de Mensaje de Éxito */}
            <Dialog
                open={isSuccessModalOpen}
                onClose={handleCloseSuccessModal}
                aria-labelledby="success-dialog-title"
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle id="success-dialog-title">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="h6" component="span">
                            Operación Exitosa
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        {successMessage}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCloseSuccessModal}
                        color="primary"
                        variant="contained"
                        autoFocus
                    >
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>
            
        </Container>
    );
};

export default TableEntidades;