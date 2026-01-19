// App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./Screens/Login/Login";
import { DarkModeProvider, useDarkMode } from "./context/DarkModeContext";
import ProtectedRoute from "./context/ProtectedRoute";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import HomePage from "./components/HomePage";
import ProveedoresTable from "./components/proveedores/Proveedores";
import ProveedorForm from "./components/proveedores/ProveedorForm";
import GastosForm from "./components/Gastos/GastosForm";
import MainPage from "./Screens/Entidades/MainPage";
import TableBancos from "./components/bancos/bancos";
import FormBanco from "./components/bancos/FormBanco";
import { BancoDetalle } from "./components/bancos/detallesBancos/BancoDetalle";

function AppContent() {
  const { isDarkMode } = useDarkMode();

  // 👇 Aquí le dices a MUI qué tema usar
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
    },
  });
return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/home/:id?" element={<HomePage />} />
          
         
          <Route path="/table" element={<MainPage />} /> 
          
          <Route path="/proveedores" element={<ProveedoresTable />} />
          <Route path="/proveedoresForm" element={<ProveedorForm />} />
          <Route path="/gastos" element={<GastosForm />} />
          <Route path="/bancos" element={<TableBancos />} />
           <Route path="/formbancos" element={<FormBanco />} />
          <Route path="/bancoDetalle" element={<BancoDetalle />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}


function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
