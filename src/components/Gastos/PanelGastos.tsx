import { useState } from "react";
import { 
  Box, Container, Typography, Stack, Tabs, Tab, Paper, Button, useTheme 
} from "@mui/material";
import { ReceiptLong as GastosIcon, Add as AddIcon, ChevronLeft } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import NavigationMenu from "../../components/Menu";
import GastosTabla from "./GastosTabla";

export default function PanelGastos() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme(); // Hook para detectar el modo

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 11, pb: 5 }}>
      <NavigationMenu />

      <Button 
        startIcon={<ChevronLeft />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: "#00897b", textTransform: "none", fontWeight: "bold" }}
      >
        Volver
      </Button>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <GastosIcon sx={{ color: "#00897b" }} fontSize="large" />
          <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ textTransform: 'uppercase' }}>
            Control de Gastos
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2, px: 3, py: 1, textTransform: "none",
            backgroundColor: "#00695c", "&:hover": { backgroundColor: "#004d40" },
            boxShadow: 3,
          }}
        >
          Nuevo Gasto
        </Button>
      </Stack>

      <Paper 
        elevation={4}
        sx={{ 
          borderRadius: 3, 
          overflow: "hidden", 
          bgcolor: "background.paper", // Fondo dinámico
          border: `1px solid ${theme.palette.divider}` 
        }}
      >
        {/* Contenedor de Tabs adaptativo */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          bgcolor: theme.palette.mode === 'dark' ? "rgba(255,255,255,0.05)" : "#f5f5f5" 
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{ style: { background: "#00897b", height: 3 } }}
            sx={{
              "& .MuiTab-root": { 
                fontWeight: "bold", 
                fontSize: "11px", 
                py: 2,
                color: theme.palette.text.secondary 
              },
              "& .Mui-selected": { 
                color: theme.palette.mode === 'dark' ? "#4db6ac" : "#00695c" 
              }
            }}
          >
            <Tab label="GASTOS ORDINARIOS" />
            <Tab label="GASTOS EXTRAORDINARIOS" />
          </Tabs>
        </Box>

        <Box sx={{ p: 0 }}>
          {activeTab === 0 && <GastosTabla tipo="ordinario" />}
          {activeTab === 1 && <GastosTabla tipo="extraordinario" />}
        </Box>
      </Paper>
    </Container>
  );
}