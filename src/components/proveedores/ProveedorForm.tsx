import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Switch,
  FormControlLabel,
  useTheme,
} from "@mui/material";
import { Save as SaveIcon, ArrowBack as BackIcon } from "@mui/icons-material";
import NavigationMenu from "../../components/Menu";
import Swal from "sweetalert2";

// --- Interfaces ---
interface Proveedor {
  id: number;
  personalidad: "J" | "N" | string;
  idFiscal: string;
  razonSocial: string;
  domicilioFiscal: string;
  emails: string;
  telefonos: string;
  comentarios: string | null;
  otrosDatos: string | null;
  activo: "Activo" | "Inactivo" | string;
}

// --- Estado Inicial ---
const initialProveedorState: Omit<Proveedor, "id"> = {
  personalidad: "J",
  idFiscal: "",
  razonSocial: "",
  domicilioFiscal: "",
  emails: "",
  telefonos: "",
  comentarios: null,
  otrosDatos: null,
  activo: "Activo",
};

const BASE_API_URL = "https://bknd.condominios-online.com";
const ENDPOINT_PROVEEDORES = `${BASE_API_URL}/proveedores`;

const ProveedorForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const existingProveedor = location.state?.proveedor as Proveedor | undefined;

  const [formData, setFormData] = useState<Omit<Proveedor, "id">>(
    existingProveedor
      ? { ...existingProveedor, activo: existingProveedor.activo || "Activo" }
      : initialProveedorState
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!existingProveedor;
  const proveedorId = existingProveedor?.id;
  const pageTitle = isEditing ? "Editar Proveedor" : "Crear Proveedor";

  // ⭐⭐⭐ CAMBIO IMPORTANTE: Convertimos arrays a strings si vienen así
  useEffect(() => {
    if (existingProveedor) {
      setFormData({
        ...existingProveedor,
        emails: Array.isArray(existingProveedor.emails)
          ? existingProveedor.emails.join(", ")
          : existingProveedor.emails || "",
        telefonos: Array.isArray(existingProveedor.telefonos)
          ? existingProveedor.telefonos.join(", ")
          : existingProveedor.telefonos || "",
        activo: existingProveedor.activo || "Activo",
      });
    }
  }, [existingProveedor]);

  // --- Manejador de cambios ---
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }
    >
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, checked, type } = target;

    if (type === "checkbox" && name === "activo") {
      setFormData((prev) => ({
        ...prev,
        activo: checked ? "Activo" : "Inactivo",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name as string]: value,
      }));
    }
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = user?.token;

    if (!token) {
      setError("Token de usuario no disponible. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        emails: formData.emails || "",
        telefonos: formData.telefonos || "",
        comentarios: formData.comentarios || null,
        otrosDatos: formData.otrosDatos || null,
        activo: formData.activo,
      };

      console.log("📤 Enviando payload:", payload);

      let response;

      if (isEditing && proveedorId) {
        response = await axios.put(`${ENDPOINT_PROVEEDORES}/${proveedorId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📥 Respuesta API (PUT):", response.data);

        Swal.fire({
          icon: "success",
          title: "Proveedor Actualizado",
        }).then(() => navigate("/proveedores"));
      } else {
        response = await axios.post(ENDPOINT_PROVEEDORES, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📥 Respuesta API (POST):", response.data);

        Swal.fire({
          icon: "success",
          title: "Proveedor Creado",
        }).then(() => navigate("/proveedores"));
      }
    } catch (err) {
      console.error("❌ Error API:", err);
      setError("Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 10 }}>
      <NavigationMenu />
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          {pageTitle}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Fila 1 */}
            <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField
                required
                fullWidth
                label="ID Fiscal (RUC/RIF)"
                name="idFiscal"
                value={formData.idFiscal}
                onChange={handleChange}
                disabled={isEditing}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ flex: 1 }}
              />

              <FormControl fullWidth required size="small" sx={{ flex: 1 }}>
                <InputLabel id="personalidad-label">Personalidad</InputLabel>
                <Select
                  labelId="personalidad-label"
                  name="personalidad"
                  value={formData.personalidad}
                  onChange={(e) =>
                    handleChange(e as React.ChangeEvent<HTMLInputElement>)
                  }
                  label="Personalidad"
                >
                  <MenuItem value={"J"}>Jurídica</MenuItem>
                  <MenuItem value={"N"}>Natural</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Razón Social */}
            <TextField
              required
              fullWidth
              label="Razón Social / Nombre"
              name="razonSocial"
              value={formData.razonSocial}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            {/* Emails - Telefonos - Estado */}
            <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField
                fullWidth
                label="Emails (Separados por coma)"
                name="emails"
                value={formData.emails}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ flex: 1 }}
              />

              <TextField
                fullWidth
                label="Teléfonos (Separados por coma)"
                name="telefonos"
                value={formData.telefonos}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ flex: 1 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo === "Activo"}
                    onChange={handleChange}
                    name="activo"
                    color="success"
                  />
                }
                label={`Estado: ${formData.activo}`}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  pl: 1,
                  border: "1px solid #c4c4c4",
                  borderRadius: 1,
                  height: "40px",
                  backgroundColor: theme.palette.background.paper,
                }}
              />
            </Box>

            {/* Domicilio */}
            <TextField
              fullWidth
              label="Domicilio Fiscal"
              name="domicilioFiscal"
              value={formData.domicilioFiscal}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            {/* Comentarios */}
            <TextField
              fullWidth
              label="Comentarios"
              name="comentarios"
              multiline
              rows={2}
              value={formData.comentarios || ""}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            {/* Otros Datos */}
            <TextField
              fullWidth
              label="Otros Datos"
              name="otrosDatos"
              multiline
              rows={2}
              value={formData.otrosDatos || ""}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            {/* Botones */}
            <Stack direction="row" spacing={2} pt={2}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={() => navigate("/proveedores")}
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{
                  backgroundColor: "#00695c",
                  "&:hover": { backgroundColor: "#004d40" },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isEditing ? (
                  "Guardar Cambios"
                ) : (
                  "Crear Proveedor"
                )}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProveedorForm;
