import { useLocation, useNavigate } from "react-router-dom";
import { 
    Container, Paper, Typography, TextField, Button, 
    Stack, Box, Divider, MenuItem, CircularProgress, Alert 
} from "@mui/material";
import { 
    ArrowBack as BackIcon, 
    Save as SaveIcon 
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import NavigationMenu from "../../components/Menu";

const BASE_API_URL = "https://bknd.condominios-online.com/bancos";

const FormBancos = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    const estadoInicial = {
        tipo: "BANCO",
        nombre: "",
        apodo: "",
        numeroCuenta: "",
        mondeda: "Bs",
        telefono: "", 
        rif: "",      
        comentarios: ""
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [esEdicion, setEsEdicion] = useState(false);
    const [bancoId, setBancoId] = useState<number | null>(null);
    
    // Estados para feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const bancoAEditar = location.state?.banco;
        if (bancoAEditar) {
            setBancoId(bancoAEditar.id);
            setFormData({
                tipo: bancoAEditar.tipo || "BANCO",
                nombre: bancoAEditar.nombre || "",
                apodo: bancoAEditar.apodo || "",
                numeroCuenta: bancoAEditar.datos?.numeroCuenta || "",
                mondeda: bancoAEditar.datos?.mondeda || "Bs",
                telefono: bancoAEditar.datos?.pagoMovil?.telefono || "",
                rif: bancoAEditar.datos?.pagoMovil?.rif || "",
                comentarios: bancoAEditar.comentarios || ""
            });
            setEsEdicion(true);
        }
    }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Al construir el objeto así, garantizamos que SOLO se envíen estos campos
    // Los campos de eliminación (null) que mencionas no se incluirán.
    const payload = {
        tipo: formData.tipo,
        nombre: formData.nombre,
        apodo: formData.apodo,
        datos: {
            numeroCuenta: formData.numeroCuenta,
            mondeda: formData.mondeda,
            pagoMovil: {
                telefono: formData.telefono,
                rif: formData.rif
            }
        },
        comentarios: formData.comentarios,
        estadoActual: "activo" 
    };

    try {
        const config = {
            headers: { Authorization: `Bearer ${user?.token}` }
        };

        let response;

        if (esEdicion && bancoId) {
            // Petición PUT para actualizar
            response = await axios.put(`${BASE_API_URL}/${bancoId}`, payload, config);
            console.log("Respuesta API (Actualizar):", response.data);
        } else {
            // Petición POST para crear
            response = await axios.post(`${BASE_API_URL}/`, payload, config);
            console.log("Respuesta API (Crear):", response.data);
        }

        // Si quieres ver el contenido de @res parseado en la consola:
     console.log("Datos enviados al servidor:", payload);
     console.log("Respuesta completa del servidor:", response);

        navigate("/bancos"); 
    } catch (err: any) {
        console.error("Error al guardar:", err);
        setError(err.response?.data?.message || "Ocurrió un error al procesar la solicitud.");
    } finally {
        setLoading(false);
    }
};

    return (
        <Container maxWidth="md" sx={{ pt: 11, pb: 5 }}>
            <NavigationMenu />
            
            <Stack direction="row" mb={2}>
                <Button 
                    startIcon={<BackIcon />} 
                    onClick={() => navigate("/bancos")}
                    sx={{ color: "#9e9e9e", textTransform: "none", "&:hover": { color: "#757575" } }}
                >
                    Volver a la Lista
                </Button>
            </Stack>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #f0f0f0', boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' }}>
                <Typography variant="h5" mb={0.5} fontWeight="bold" color="#4db6ac">
                    {esEdicion ? "Modificar Entidad" : "Registro de Banco"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Ingrese los detalles de la cuenta bancaria y pago móvil a continuación.
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                
                <Divider sx={{ mb: 4, borderColor: '#f5f5f5' }} />
                
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        
                        {/* FILA 1: Tipo, Nombre y Apodo */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField 
                                select
                                label="Tipo" 
                                required
                                sx={{ flex: 1 }} 
                                variant="outlined"
                                value={formData.tipo}
                                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                            >
                                <MenuItem value="BANCO">BANCO</MenuItem>
                                <MenuItem value="EFECTIVO">EFECTIVO</MenuItem>
                                <MenuItem value="ZELLE">ZELLE</MenuItem>
                                <MenuItem value="OTRO">OTRO</MenuItem>
                            </TextField>
                            <TextField 
                                label="Nombre del Banco" 
                                required
                                sx={{ flex: 2 }} 
                                variant="outlined"
                                value={formData.nombre}
                                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                            />
                            <TextField 
                                label="Apodo (Alias)" 
                                sx={{ flex: 1 }} 
                                variant="outlined"
                                value={formData.apodo}
                                onChange={(e) => setFormData({...formData, apodo: e.target.value})}
                            />
                        </Stack>

                        {/* FILA 2: Cuenta y Moneda */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField 
                                label="Número de Cuenta" 
                                sx={{ flex: 3 }}
                                variant="outlined"
                                value={formData.numeroCuenta}
                                onChange={(e) => setFormData({...formData, numeroCuenta: e.target.value})}
                            />
                            <TextField 
                                label="Moneda" 
                                sx={{ flex: 1 }}
                                variant="outlined"
                                value={formData.mondeda}
                                onChange={(e) => setFormData({...formData, mondeda: e.target.value})}
                            />
                        </Stack>

                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                            Datos de Pago Móvil (Opcional)
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField 
                                label="Teléfono (Pago Móvil)" 
                                sx={{ flex: 1 }}
                                variant="outlined"
                                value={formData.telefono}
                                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                            />
                            <TextField 
                                label="RIF / Cédula" 
                                sx={{ flex: 1 }}
                                variant="outlined"
                                value={formData.rif}
                                onChange={(e) => setFormData({...formData, rif: e.target.value})}
                            />
                        </Stack>

                        <TextField 
                            label="Comentarios u Observaciones" 
                            multiline 
                            rows={3} 
                            fullWidth 
                            variant="outlined"
                            value={formData.comentarios}
                            onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                        />
                        
                        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                            <Button 
                                type="submit"
                                variant="contained" 
                                size="large"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                sx={{ 
                                    backgroundColor: "#00695c", 
                                    px: 8, 
                                    py: 1.5,
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    borderRadius: 2,
                                    boxShadow: '0 4px 10px rgba(0, 105, 92, 0.2)',
                                    "&:hover": { backgroundColor: "#004d40" }
                                }}
                            >
                                {loading ? "Procesando..." : (esEdicion ? "Actualizar Datos" : "Guardar Banco")}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};

export default FormBancos;