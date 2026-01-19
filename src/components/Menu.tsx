import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    AccountBalance as BancoIcon,
} from "@mui/icons-material";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Avatar,
    Tooltip,
    ListItemIcon,
    Badge,
    Box,
    Button,
} from "@mui/material";
import {
    Brightness4,
    Brightness7,
    Logout,
    Group as EntidadesIcon, // Ícono para Entidades
    LocalShipping as ProveedoresIcon, // Ícono para Proveedores
    AttachMoney as GastosIcon, // 💸 Ícono para Gastos (NUEVO)
    Notifications,
} from "@mui/icons-material";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const NavigationMenu = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifEl, setNotifEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
        setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) =>
        setNotifEl(event.currentTarget);
    const handleNotifClose = () => setNotifEl(null);

    // Función para manejar la navegación con `useNavigate`
    const handleNavigate = (path: string) => {
        navigate(path);
        handleMenuClose();
    };

    const handleLogout = () => {
        Swal.fire({
            title: "¿Cerrar sesión?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await logout();
                navigate("/");
                Swal.fire("Sesión cerrada", "", "success");
            }
        });
    };

    return (
        <AppBar position="fixed" color="primary" sx={{ zIndex: 1200 }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* --- Título y Enlaces de Navegación --- */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/home" // Asumo que '/home' es la ruta de inicio
                        sx={{
                            fontWeight: "bold",
                            letterSpacing: 0.5,
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        Condominios
                    </Typography>

                    {/* Botón Entidades */}
                    <Button
                        onClick={() => handleNavigate("/table")}
                        color="inherit"
                        startIcon={<EntidadesIcon />}
                        sx={{
                            textTransform: "none",
                            fontWeight: 500,
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.1)", // Efecto hover sutil
                            },
                        }}
                    >
                        Entidades
                    </Button>

                    {/* Botón Proveedores */}
                    <Button
                        onClick={() => handleNavigate("/proveedores")} // RUTA A LA TABLA DE PROVEEDORES
                        color="inherit"
                        startIcon={<ProveedoresIcon />}
                        sx={{
                            textTransform: "none",
                            fontWeight: 500,
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.1)",
                            },
                        }}
                    >
                        Proveedores
                    </Button>
                    
                    {/* Botón Gastos (AÑADIDO) */}
                    <Button
                        onClick={() => handleNavigate("/gastos")} // **NUEVA RUTA A LA GESTIÓN DE GASTOS**
                        color="inherit"
                        startIcon={<GastosIcon />}
                        sx={{
                            textTransform: "none",
                            fontWeight: 500,
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.1)",
                            },
                        }}
                    >
                        Gastos
                    </Button>

                     <Button
                        onClick={() => handleNavigate("/bancos")} // **NUEVA RUTA A LA GESTIÓN DE BANCOS**
                        color="inherit"
                        startIcon={<BancoIcon />}
                        sx={{
                            textTransform: "none",
                            fontWeight: 500,
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.1)",
                            },
                        }}
                    >
                        Bancos
                    </Button>
                </Box>

                {/* --- Acciones a la derecha --- */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Modo oscuro */}
                    <Tooltip title="Cambiar tema">
                        <IconButton color="inherit" onClick={toggleDarkMode}>
                            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>
                    </Tooltip>

                    {/* Notificaciones */}
                    <Tooltip title="Notificaciones">
                        <IconButton color="inherit" onClick={handleNotifOpen}>
                            <Badge badgeContent={3} color="error">
                                <Notifications />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* Menú de Notificaciones */}
                    <Menu
                        anchorEl={notifEl}
                        open={Boolean(notifEl)}
                        onClose={handleNotifClose}
                        PaperProps={{
                            sx: { mt: 1.5, minWidth: 250 },
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>
                            Notificaciones
                        </Typography>
                        <Divider />
                        <MenuItem onClick={handleNotifClose}>
                            Nueva alerta en cola #1
                        </MenuItem>
                        <MenuItem onClick={handleNotifClose}>
                            Usuario registrado correctamente
                        </MenuItem>
                        <MenuItem onClick={handleNotifClose}>
                            No hay más notificaciones
                        </MenuItem>
                    </Menu>

                    {/* Perfil */}
                    <Tooltip title="Cuenta">
                        <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
                            <Avatar
                                sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                                alt={user?.nombreUsuario || "User"}
                            />
                        </IconButton>
                    </Tooltip>

                    {/* Menú de Perfil */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: { mt: 1.5, minWidth: 220 },
                        }}
                    >
                        {/* Opción Entidades */}
                        <MenuItem
                            onClick={() => handleNavigate("/table")}
                        >
                            <ListItemIcon>
                                <EntidadesIcon fontSize="small" />
                            </ListItemIcon>
                            Gestionar Entidades
                        </MenuItem>

                        {/* Opción Proveedores */}
                        <MenuItem
                            onClick={() => handleNavigate("/proveedores")}
                        >
                            <ListItemIcon>
                                <ProveedoresIcon fontSize="small" />
                            </ListItemIcon>
                            Gestionar Proveedores
                        </MenuItem>

                        {/* Opción Gastos (AÑADIDO) */}
                        <MenuItem
                            onClick={() => handleNavigate("/gastos")}
                        >
                            <ListItemIcon>
                                <GastosIcon fontSize="small" />
                            </ListItemIcon>
                            Gestionar Gastos
                        </MenuItem>
                        
                        <Divider />

                        {/* Opción Cerrar Sesión */}
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Cerrar sesión
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default NavigationMenu;