import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Asumiendo que esta ruta es correcta
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
    AppBar,
    Toolbar,
    Box,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocalShipping as ProveedoresIcon,
    Add as AddIcon,
} from "@mui/icons-material";
import NavigationMenu from "../../components/Menu"; // Asumiendo que esta ruta es correcta
import Swal from "sweetalert2";

// 🌐 URL BASE DE PRODUCCIÓN
const BASE_API_URL = "https://bknd.condominios-online.com";
const ENDPOINT_PROVEEDORES = `${BASE_API_URL}/proveedores`;

// --- ❗❗ INTERFAZ PROVEEDOR CORREGIDA (Basada en tu JSON de la API) ❗❗ ---
interface Proveedor {
    id: number;
    personalidad: "J" | "N" | "G" | string;
    idFiscal: string; // RIF o Identificación Fiscal
    razonSocial: string; // Nombre de la empresa o persona
    domicilioFiscal: string;
    // Se fuerza a string[] para el mapeo y renderizado de la tabla
    emails: string[];
    telefonos: string[];
    otrosDatos: string | null;
    estadoActual: string;
    comentarios: string | null;
    motivoEliminacion: string | null;
    fechaEliminacion: string | null;
    // Se mantienen en la interfaz ya que vienen en el JSON de la API
    referencia?: string | null; 
    clase?: string; 
}

// --- ❗❗ INTERFAZ DE RESPUESTA DE LA API (Ajustada a la estructura de tu API) ❗❗ ---
interface ProveedoresAPIResponse {
    response: string;
    status: string;
    body: ProveedorRaw[] | ""; // Puede ser un array de ProveedorRaw o un string vacío
}

// Interfaz para el cuerpo de la respuesta ANTES del mapeo de emails/telefonos
interface ProveedorRaw {
    id: number;
    personalidad: "J" | "N" | "G" | string;
    idFiscal: string;
    razonSocial: string;
    domicilioFiscal: string;
    emails: string | string[]; // Puede ser string (separado por coma) o array
    telefonos: string | string[]; // Puede ser string (separado por coma) o array
    otrosDatos: string | null;
    estadoActual: string;
    comentarios: string | null;
    motivoEliminacion: string | null;
    fechaEliminacion: string | null;
    referencia?: string | null; 
    clase?: string; 
}

// Definición básica de la estructura de error de Axios
interface AxiosErrorResponse {
    response?: {
        data?: {
            message?: string;
            error?: string;
            response?: string;
        } | string;
        status?: number;
    };
    message: string;
}

const ProveedoresTable = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 🔄 --- Función para obtener los proveedores (Método GET) ---
  // 🔄 --- Función para obtener los proveedores (Método GET) ---
    const fetchProveedores = useCallback(async () => {
        setLoading(true);
        setError("");
        const token = user?.token;

        if (!token) {
            setError("Token de usuario no disponible. Por favor, inicia sesión.");
            setLoading(false);
            return;
        }

        try {
            // ❗ CORRECCIÓN: El tipo genérico de Axios debe ser ProveedoresAPIResponse directamente
            const response = await axios.get<ProveedoresAPIResponse>(
                `${ENDPOINT_PROVEEDORES}?page=1&limit=100`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            console.log("Respuesta completa de proveedores:", response.data);
            
            // ❗ CORRECCIÓN: Accedemos directamente a response.data
            const apiData = response.data;
            const rawBody = apiData.body;
            let finalProviders: Proveedor[] = [];

            if (rawBody === "" || rawBody === null || (Array.isArray(rawBody) && rawBody.length === 0)) {
                // ... el resto del código es correcto ...
                // Si el body es una cadena vacía, nulo o un array vacío (no hay proveedores)
                console.log("Advertencia: No hay proveedores en el 'body'.");
                finalProviders = [];
                // Se muestra un mensaje informativo si el servidor lo proporciona.
                if (apiData.response && apiData.response.includes('no encontrado')) {
                    setError(`Información: ${apiData.response.trim()}`);
                }
            } else if (Array.isArray(rawBody)) {
                // Si es un array, mapeamos para asegurar el formato de `emails` y `telefonos`
                finalProviders = rawBody.map((item: ProveedorRaw) => {
                    const mapStringToArray = (field: string | string[]): string[] => {
                        if (Array.isArray(field)) {
                            return field;
                        }
                        if (typeof field === 'string' && field.trim()) {
                            return field.split(',').map(e => e.trim()).filter(e => e); // Divide y filtra vacíos
                        }
                        return ['N/A'];
                    };

                    return {
                        ...item,
                        // Asegura que emails y telefonos son arrays de strings
                        emails: mapStringToArray(item.emails),
                        telefonos: mapStringToArray(item.telefonos),
                    } as Proveedor;
                });
            } else {
                console.error("El 'body' de la respuesta tiene un formato inesperado:", rawBody);
                setError("Formato de datos de proveedor inesperado. Contácte al administrador de la API.");
            }

            setData(finalProviders);

        } catch (err) {
            console.error("Error fetching proveedores:", err);
            let errorMessage = "Error desconocido al conectar con el servidor.";

            const axiosError = err as AxiosErrorResponse;
            if (axiosError.response) {
                const errorResponse = axiosError.response;
                if (typeof errorResponse.data === 'object' && errorResponse.data !== null) {
                    // Intenta obtener el error del campo 'error' o 'message' o 'response' de la respuesta anidada
                    const dataError = errorResponse.data.error || errorResponse.data.message || errorResponse.data.response;
                    errorMessage = dataError || axiosError.message || errorMessage;
                } else if (typeof errorResponse.data === 'string') {
                    errorMessage = errorResponse.data || axiosError.message || errorMessage;
                } else {
                    errorMessage = axiosError.message || errorMessage;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }

            setError(`Error al obtener los proveedores: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    // Ejecutamos fetchProveedores una vez al inicio
    useEffect(() => {
        fetchProveedores();
    }, [fetchProveedores]);

    // --- Manejadores de Navegación ---
    const handleCreate = () => {
        navigate("/proveedoresForm");
    };

    const handleEdit = (proveedor: Proveedor) => {
        // Usamos el ID como clave de navegación
        const idToUse = proveedor.id; 
        navigate(`/proveedoresForm`, { state: { proveedor, id: idToUse } });
    };

    // 🗑️ --- FUNCIÓN DE ELIMINACIÓN (DELETE /proveedores/:id) ---
    const handleDelete = async (proveedorId: number, razonSocial: string) => {
        const token = user?.token;

        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Error de Autenticación",
                text: "Token de usuario no disponible.",
            });
            return;
        }

        if (!proveedorId) {
            Swal.fire({
                icon: "error",
                title: "Error de ID",
                text: "ID de proveedor no disponible para eliminar.",
            });
            return;
        }

        const result = await Swal.fire({
            title: `¿Estás seguro de eliminar a **${razonSocial}**?`,
            text: "¡Esta acción es irreversible!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const URL_DELETE = `${ENDPOINT_PROVEEDORES}/${proveedorId}`;

                await axios.delete(URL_DELETE, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                Swal.fire({
                    icon: "success",
                    title: "Eliminado!",
                    html: `El proveedor **${razonSocial}** ha sido eliminado con éxito.`,
                    showConfirmButton: false,
                    timer: 1500,
                }).then(() => {
                    fetchProveedores(); // Recarga la tabla
                });
            } catch (err) {
                console.error("Error al eliminar proveedor:", err);
                let errorMessage = "Error al intentar eliminar el proveedor.";

                const axiosError = err as AxiosErrorResponse;
                // Lógica de manejo de errores mejorada
                if (axiosError.response) {
                    const errorResponse = axiosError.response;

                    if (errorResponse.status === 404) {
                        errorMessage = `El proveedor con ID ${proveedorId} ya no existe o fue eliminado previamente.`;
                    }
                    
                    if (typeof errorResponse.data === 'object' && errorResponse.data !== null) {
                        const dataError = errorResponse.data.error || errorResponse.data.message || errorResponse.data.response;
                        errorMessage = dataError || errorMessage;
                    } else if (typeof errorResponse.data === 'string') {
                        errorMessage = errorResponse.data || errorMessage;
                    }
                } 
                if (errorMessage === "Error al intentar eliminar el proveedor." && axiosError.message) {
                    errorMessage = axiosError.message;
                }

                Swal.fire({
                    icon: "error",
                    title: "Error de Eliminación",
                    text: errorMessage,
                }).then(() => {
                    fetchProveedores(); // Intenta recargar por si acaso
                });

            } finally {
                setLoading(false);
            }
        }
    };
    // 🔚 --- FIN FUNCIÓN DE ELIMINACIÓN ---

    // Función para obtener el color del Chip
    const getPersonalidadColor = (personalidad: string | null | undefined): string => {
        const p = personalidad ? personalidad.toString().charAt(0).toUpperCase() : '';
        switch (p) {
            case "J":
                return "#1976d2"; // Jurídica (Azul)
            case "N":
                return "#388e3c"; // Natural (Verde)
            case "G":
                return "#fbc02d"; // Gobierno (Amarillo)
            default:
                return "#0288d1";
        }
    };

    // Función para mostrar el texto de Personalidad
    const getPersonalidadLabel = (personalidad: string | null | undefined): string => {
        const p = personalidad ? personalidad.toString().charAt(0).toUpperCase() : '';
        switch (p) {
            case "J":
                return "Jurídica";
            case "N":
                return "Natural";
            case "G":
                return "Gobierno";
            default:
                const fullClass = (personalidad || '').toString();
                if (fullClass.length > 1) {
                    return fullClass;
                }
                return 'Desconocida';
        }
    };


    // --- Renderizado de Carga y Error y AppBar ---

    const FixedAppBar = () => (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 1, 
                backgroundColor: '#ffffff', 
                color: 'black', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}
        >
            <Toolbar disableGutters>
                <NavigationMenu />
            </Toolbar>
        </AppBar>
    );

    const LoadingContent = () => (
        <Stack alignItems="center" sx={{ pt: 14 }}>
            <CircularProgress color="success" />
            <Typography variant="body2" color="text.secondary" mt={2}>
                Cargando proveedores...
            </Typography>
        </Stack>
    );

    const ErrorContent = () => (
        <Container maxWidth="md" sx={{ pt: 14 }}>
            <Alert severity="error">{error}</Alert>
            <Typography variant="body2" color="text.secondary" mt={2} align="center">
                Intente recargar si el error persiste, o si está esperando ver proveedores.
            </Typography>
        </Container>
    );
    
    // Contenido condicional para carga y error (se muestra solo si NO hay datos)
    if (loading && data.length === 0)
        return (
            <Box>
                <FixedAppBar />
                <LoadingContent />
            </Box>
        );

    if (error && data.length === 0)
        return (
            <Box>
                <FixedAppBar />
                <ErrorContent />
            </Box>
        );


    // --- Renderizado Principal de la Tabla ---
    return (
        <Box>
            {/* 1. Contenedor del Menú de Navegación (Fijo) */}
            <FixedAppBar />

            {/* 2. Contenedor Principal de la Página */}
            <Container maxWidth="lg" sx={{ mt: 10, pt: 4, pb: 4 }}>

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <ProveedoresIcon sx={{ color: "#00897b" }} fontSize="large" />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            Gestión de Proveedores
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
                        Agregar Proveedor
                    </Button>
                </Stack>
                
                {/* 3. Mostrar el error si hay datos, pero se quiere informar (ej. info de no encontrados) */}
                {error && data.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
                )}

                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 3,
                        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                    }}
                >
                    <Table sx={{ minWidth: 1000 }} size="small">
                        <TableHead>
                            <TableRow sx={{ background: "#004d40" }}>
                                {[
                                    "ID", 
                                    "Razón Social", 
                                    "ID Fiscal", 
                                    "Tipo",
                                    "Teléfonos",
                                    "Emails",
                                    "Domicilio Fiscal", 
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
                                data.map((proveedor) => (
                                    <TableRow
                                        // Usar un ID único (siempre debe ser proveedor.id)
                                        key={proveedor.id}
                                        hover
                                        // Clic en fila para editar (excluyendo el clic en la celda de acciones)
                                        onClick={() => handleEdit(proveedor)}
                                        sx={{
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                backgroundColor: "#f5f5f5",
                                                transform: "scale(1.005)",
                                            },
                                        }}
                                    >
                                        <TableCell>{proveedor.id}</TableCell>
                                        <TableCell>
                                            <Tooltip title={proveedor.comentarios || proveedor.razonSocial}>
                                                <Box component="span" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {proveedor.razonSocial}
                                                </Box>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{proveedor.idFiscal}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getPersonalidadLabel(proveedor.personalidad)}
                                                size="small"
                                                sx={{
                                                    fontWeight: "bold",
                                                    textTransform: "capitalize",
                                                    color: "white",
                                                    backgroundColor: getPersonalidadColor(proveedor.personalidad),
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {/* Se usa el array de strings ya mapeado */}
                                            {proveedor.telefonos.join(", ")}
                                        </TableCell>
                                        <TableCell>
                                            {/* Se usa el array de strings ya mapeado */}
                                            {proveedor.emails.join(", ")}
                                        </TableCell>
                                        <TableCell>{proveedor.domicilioFiscal}</TableCell>
                                        {/* Celda de Acciones: se detiene la propagación del evento para que no active handleEdit */}
                                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                            <Stack direction="row" spacing={0.5} justifyContent="center">

                                                <Tooltip title="Editar proveedor">
                                                    <IconButton
                                                        onClick={() => handleEdit(proveedor)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: "#00897b",
                                                            color: "white",
                                                            "&:hover": { backgroundColor: "#00695c" },
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Eliminar proveedor">
                                                    <IconButton
                                                        onClick={() => handleDelete(proveedor.id, proveedor.razonSocial)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: "#d32f2f",
                                                            color: "white",
                                                            "&:hover": { backgroundColor: "#b71c1c" },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {loading ? "Cargando..." : "No se encontraron proveedores. Presione 'Agregar Proveedor' para comenzar."}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
};

export default ProveedoresTable;