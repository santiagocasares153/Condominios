import  { useState } from 'react';
import type { FormEvent, JSX } from 'react';
import { Container, Box, TextField, Button, Typography, CircularProgress, Alert, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const API_BASE_URL: string = 'http://bknd.condominios-online.com';

interface UserAccess {
  idCliente: number;
}

interface RegisterUserData {
  login: string;
  pwd: string;
  accesos: UserAccess[];
}

interface RegisterSuccessResponse {
  id: number;
  login: string;
}

const Register = (): JSX.Element => {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [clientesInput, setClientesInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Lógica para manejar el envío del formulario de registro
  const handleRegister = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    // Prepara la lista de clientes (accesos)
    let accesos: UserAccess[] = [];
    if (clientesInput) {
      accesos = clientesInput.split(',').map((id) => ({ idCliente: parseInt(id.trim(), 10) }));
    }

    const userData: RegisterUserData = {
      login,
      pwd: password,
      accesos,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result: RegisterSuccessResponse = await response.json();
        setSuccessMessage(`Usuario '${result.login}' registrado con éxito.`);
        setLogin('');
        setPassword('');
        setClientesInput('');
      } else {
        const errorText = await response.text();
        setErrorMessage(`Error al registrar: ${errorText}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(`Error de conexión: ${error.message}`);
      } else {
        setErrorMessage('Error de conexión desconocido.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #1a1a1a 30%, #2c3e50 90%)',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            position: 'relative',
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            borderRadius: 3,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)',
            bgcolor: 'background.paper',
            
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'primary.main',
              borderRadius: '50%',
              p: 2,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Box>
          <Typography component="h1" variant="h4" gutterBottom sx={{ mt: 2 }}>
            Registro de Usuario
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Completa el formulario para crear una nueva cuenta y gestionar tus clientes.
          </Typography>
          
          <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                id="login"
                label="Nombre de Usuario"
                name="login"
                autoComplete="login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                id="clientesInput"
                label="IDs de Clientes (separados por coma)"
                name="clientesInput"
                value={clientesInput}
                onChange={(e) => setClientesInput(e.target.value)}
                variant="outlined"
                helperText="Ejemplo: 1, 2, 3"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {successMessage && <Alert severity="success">{successMessage}</Alert>}
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, borderRadius: '999px', py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar'}
            </Button>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              ¿Ya tienes una cuenta?{' '}
              <Link href="#/login" variant="body2">
                Inicia sesión
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
