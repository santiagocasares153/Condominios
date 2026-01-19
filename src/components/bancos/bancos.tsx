import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Container, Typography, Button, IconButton,
    CircularProgress, Alert, Stack, Chip, Tooltip
} from "@mui/material";
import {
    Edit as EditIcon,
    AccountBalance as BancoIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import NavigationMenu from "../../components/Menu";

// --- INTERFACES ---
interface Banco {
    id: number;
    tipo: string;
    nombre: string;
    apodo: string;
    datos: {
        numeroCuenta: string;
        mondeda: string; 
        pagoMovil?: {
            telefono: string;
            rif: string;
        };
    };
    estadoActual: string;
    comentarios: string;
}

interface ApiResponseWrapper {
    metadata: { info: string };
    data: Array<{ "@res": string }>;
}

interface DecodedRes {
    response: string;
    status: string;
    body: Banco[];
}

const BASE_API_URL = "https://bknd.condominios-online.com/bancos";

const TableBancos = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<Banco[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBancos = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get<ApiResponseWrapper>(`${BASE_API_URL}/`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });

            const resData = response.data?.data?.[0];
            if (!resData || !resData["@res"]) {
                setData([]);
                setLoading(false);
                return;
            }

            let raw = resData["@res"];
            let parsedRes: DecodedRes | null = null;

            try {
                const sanitized = raw
                    .replace(/rn/g, "")           
                    .replace(/[\n\r\t]/g, " ")    
                    .trim();

                parsedRes = JSON.parse(sanitized);
            } catch (parseError) {
                console.error("Error de parseo técnico:", parseError);
                setError("Error de formato en los datos recibidos.");
            }

            if (parsedRes && (parsedRes.status === "success" || parsedRes.status === "ok")) {
                const cleanBody = Array.isArray(parsedRes.body) ? parsedRes.body : [];
                setData(cleanBody);
            } else if (parsedRes) {
                setError(parsedRes.response || "Error en la consulta.");
            }

        } catch (err: any) {
            console.error("Error de conexión:", err);
            setError("No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) fetchBancos();
    }, [user?.token]);

    const handleVerDetalles = (banco: Banco) => {
        navigate("/bancoDetalle", { state: { banco } });
    };

    const handleAgregarNuevo = () => {
        navigate("/formbancos", { state: { banco: null } });
    };

    const handleEditar = (e: React.MouseEvent, banco: Banco) => {
        e.stopPropagation();
        navigate("/formbancos", { state: { banco } });
    };

    const handleEliminar = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        console.log("Eliminar banco ID:", id);
    };

    if (loading) return <Stack alignItems="center" mt={10}><CircularProgress /></Stack>;

    return (
    <Container maxWidth="lg" sx={{ pt: 11, pb: 5 }}>
        <NavigationMenu />
        
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <BancoIcon sx={{ color: "#00897b" }} fontSize="large" />
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Bancos Registrados
                </Typography>
            </Stack>
            <Button
                variant="contained"
                onClick={handleAgregarNuevo}
                startIcon={<AddIcon />}
                sx={{
                    borderRadius: 2, px: 2, py: 0.8, textTransform: "none",
                    backgroundColor: "#00695c", "&:hover": { backgroundColor: "#004d40" },
                    boxShadow: 3,
                }}
            >
                Agregar Banco
            </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                        {["ID", "Nombre / Apodo", "Tipo", "Moneda", "Cuenta / Pago Móvil", "Estado", "Acciones"].map((header) => (
                            <TableCell
                                key={header}
                                sx={{ color: "white", fontWeight: 600, fontSize: 13, borderBottom: "none", py: 1.5 }}
                            >
                                {header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((banco) => (
                            <TableRow 
                                key={banco.id} 
                                hover
                                onClick={() => handleVerDetalles(banco)}
                                sx={{
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    "&:hover": { 
                                        backgroundColor: "#80cbc4 !important", 
                                        boxShadow: "inset 8px 0 0 #004d40",
                                        // Esto fuerza a que todos los textos (Typography y celdas) 
                                        // sean legibles sobre el fondo oscuro del hover
                                        "& .MuiTypography-root, & .MuiTableCell-root": {
                                            color: "#002420 !important",
                                            fontWeight: 500
                                        }
                                    },
                                }}
                            >
                                <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>{banco.id}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold">{banco.nombre || "Sin nombre"}</Typography>
                                    <Typography variant="caption" color="textSecondary">{banco.apodo}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                                        {banco.tipo}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={banco.datos?.mondeda || "Bs"} 
                                        size="small" 
                                        sx={{ 
                                            fontWeight: "bold", 
                                            backgroundColor: "#00695c", 
                                            color: "white" 
                                        }} 
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{banco.datos?.numeroCuenta || "N/A"}</Typography>
                                    {banco.datos?.pagoMovil?.telefono && (
                                        <Typography 
                                            variant="caption" 
                                            display="block" 
                                            color="primary" 
                                            sx={{ fontWeight: 500 }}
                                        >
                                            PM: {banco.datos.pagoMovil.telefono}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={(banco.estadoActual || "Inactivo").toUpperCase()} 
                                        size="small" 
                                        sx={{
                                            fontWeight: "bold", color: "white",
                                            backgroundColor: banco.estadoActual?.toLowerCase() === "activo" ? "#388e3c" : "#757575"
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Editar">
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handleEditar(e, banco)}
                                                sx={{ backgroundColor: "#00897b", color: "white", "&:hover": { backgroundColor: "#00695c" } }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handleEliminar(e, banco.id)}
                                                sx={{ backgroundColor: "#d32f2f", color: "white", "&:hover": { backgroundColor: "#b71c1c" } }}
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
                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                No se encontraron registros válidos.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </Container>
);
};

export default TableBancos;