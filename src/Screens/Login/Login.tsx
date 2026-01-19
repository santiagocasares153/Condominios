import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment,
  IconButton,
  MenuItem,
} from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  LockOutlined as LockOutlinedIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion"; // 👈 Importamos animación
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [selectionToken, setSelectionToken] = useState<string | null>(null);
  const [clientes, setClientes] = useState<
    { id: number; razonSocial: string }[]
  >([]);
  const [selectedClient, setSelectedClient] = useState<number | "">("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 💡 NUEVOS ESTADOS para guardar los datos del usuario del primer paso
const [userId, setUserId] = useState<number | null>(null);
const [userName, setUserName] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

 // 🔹 Paso 1: login inicial
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/login`,
      { login: username, pwd: password },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data as {
      selectionToken: string;
      user: { id: number; login: string }; // <--- 💡 Tipo de la respuesta
      clientes?: { id: number; razonSocial: string }[];
    };
    
    // 💡 GUARDAR el ID y el nombre de usuario
    setSelectionToken(data.selectionToken);
    setClientes(data.clientes || []);
    setUserId(data.user.id); // ⬅️ GUARDAMOS EL ID
    setUserName(data.user.login); // ⬅️ GUARDAMOS EL NOMBRE
    
  } catch (err) {
    setError("Credenciales incorrectas. Por favor, verifica tus datos.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

// 🔹 Paso 2: seleccionar cliente (recibir JWT final)
const handleSelectClient = async () => {
  // Aseguramos que tenemos todos los datos necesarios
  if (!selectionToken || !selectedClient || userId === null || userName === null) return; 

  setLoading(true);
  try {
    const response = await axios.post(
      `${API_BASE_URL}/select-client`,
      { idCliente: selectedClient },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${selectionToken}`,
        },
      }
    );

    const data = response.data as { token: string };
    const workToken = data.token;
    
    // 💡 LLAMADA A LOGIN CON TODOS LOS DATOS
    login(workToken, {
      id: String(userId), // El ID que guardamos en el paso 1
      nombreUsuario: userName, // El nombre que guardamos en el paso 1
      // El correoUsuario no viene, se queda como estaba (vacío o si lo tienes de la API, añádelo)
      correoUsuario: "", 
    });

    navigate("/table", { replace: true });
  } catch (err) {
    setError("Error al seleccionar cliente.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(45deg, #1a1a1a 30%, #2c3e50 90%)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          marginTop: 8,
          display: "flex",
          flexDirection: selectionToken ? "row" : "column", // 👈 cambia layout
          alignItems: "center",
          gap: 4,
          p: 4,
          borderRadius: 3,
          boxShadow:
            "0 8px 16px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)",
          bgcolor: "background.paper",
          width: "100%",
          maxWidth: selectionToken ? "800px" : "450px", // más ancho en selección
          transition: "all 0.4s ease",
        }}
      >
        {/* 🔒 Icono superior */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "primary.main",
            borderRadius: "50%",
            p: 2,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LockOutlinedIcon fontSize="large" />
        </Box>

        {/* 🔹 Formulario de login */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{
            scale: selectionToken ? 0.9 : 1,
            x: selectionToken ? -50 : 0,
          }}
          transition={{ duration: 0.5 }}
          style={{ flex: 1 }}
        >
          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            sx={{ mt: 2, fontWeight: "bold", textAlign: "center" }}
          >
            Inicia Sesión
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 2 }}
          >
            {selectionToken
              ? "Selecciona el cliente para continuar"
              : "Accede a tu cuenta para gestionar tus clientes."}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!selectionToken && (
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Stack spacing={3}>
                <TextField
                  label="Usuario"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mt: 2,
                    fontWeight: "bold",
                    fontSize: "1rem",
                    borderRadius: "999px",
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </Stack>
            </form>
          )}
        </motion.div>

        {/* 🔹 Selector de cliente (animado desde la derecha) */}
        <AnimatePresence>
          {selectionToken && (
            <motion.div
              key="client-selector"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ flex: 1, width: "100%" }}
            >
              <Stack spacing={3} sx={{ width: "100%" }}>
                <TextField
                  select
                  label="Selecciona Cliente"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(Number(e.target.value))}
                  fullWidth
                >
                  {clientes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.razonSocial}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSelectClient}
                  disabled={loading || !selectedClient}
                  sx={{
                    py: 1.5,
                    fontWeight: "bold",
                    fontSize: "1rem",
                    borderRadius: "999px",
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
