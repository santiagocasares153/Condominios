// src/pages/GastosCondominio.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Checkbox,
  Modal,
  Fade,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import NavigationMenu from "../../components/Menu";

interface GastoItem {
  id: number;
  concepto: string;
  proveedor: string;
  documento: string;
  monto: number;
  saldo: number;
  especial: boolean;
  tipo: "ordinario" | "extraordinario";
}

interface GastosFormState {
  ordinarios: GastoItem[];
  extraordinarios: GastoItem[];
  comentarios: string;
  nroInmuebles: number;
}

const formatCurrency = (value: number): string =>
  parseFloat(value.toFixed(2)).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function GastosCondominio() {
  const [data, setData] = useState<GastosFormState>({
    ordinarios: [],
    extraordinarios: [],
    comentarios: "",
    nroInmuebles: 15,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<{ id: number; tipo: string } | null>(null);

  useEffect(() => {
    const ord: GastoItem[] = [
      { id: 1, concepto: "Vigilancia", proveedor: "Vigilaca", documento: "001A", monto: 1200, saldo: 0, especial: true, tipo: "ordinario" },
      { id: 2, concepto: "Áreas Verdes", proveedor: "Portro", documento: "002B", monto: 150, saldo: 50, especial: false, tipo: "ordinario" },
      { id: 3, concepto: "Electricidad", proveedor: "Corpoelect", documento: "003C", monto: 25, saldo: 0, especial: true, tipo: "ordinario" },
      { id: 4, concepto: "Aseo Privado", proveedor: "Pedro Pérez", documento: "004D", monto: 100, saldo: 100, especial: false, tipo: "ordinario" },
      { id: 5, concepto: "Administración", proveedor: "SICCA", documento: "005E", monto: 250, saldo: 0, especial: true, tipo: "ordinario" },
    ];
    const ext: GastoItem[] = [
      { id: 6, concepto: "Rep. Portón", proveedor: "Ing. Carlos", documento: "X101", monto: 75, saldo: 75, especial: true, tipo: "extraordinario" },
      { id: 7, concepto: "Bote Malezas", proveedor: "Pedro Pérez", documento: "X102", monto: 25, saldo: 0, especial: false, tipo: "extraordinario" },
      { id: 8, concepto: "Colaboración", proveedor: "Floristería X", documento: "X103", monto: 10, saldo: 0, especial: true, tipo: "extraordinario" },
    ];
    setData({ ...data, ordinarios: ord, extraordinarios: ext });
    // eslint-disable-next-line
  }, []);

  const handleAdd = (tipo: "ordinario" | "extraordinario") => {
    const newItem: GastoItem = {
      id: Date.now(),
      concepto: "Nuevo gasto",
      proveedor: "Proveedor X",
      documento: "000X",
      monto: 0,
      saldo: 0,
      especial: false,
      tipo,
    };
    setData((prev) => ({
      ...prev,
      [tipo === "ordinario" ? "ordinarios" : "extraordinarios"]: [
        ...(tipo === "ordinario" ? prev.ordinarios : prev.extraordinarios),
        newItem,
      ],
    }));
  };

  const handleDelete = (id: number, tipo: "ordinario" | "extraordinario") => {
    setRowToDelete({ id, tipo });
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (!rowToDelete) return;
    setData((prev) => ({
      ...prev,
      [rowToDelete.tipo === "ordinario" ? "ordinarios" : "extraordinarios"]: (
        rowToDelete.tipo === "ordinario" ? prev.ordinarios : prev.extraordinarios
      ).filter((item) => item.id !== rowToDelete.id),
    }));
    setModalOpen(false);
    setRowToDelete(null);
  };

  const totalOrdinarios = data.ordinarios.reduce((a, b) => a + b.monto, 0);
  const totalExtraordinarios = data.extraordinarios.reduce((a, b) => a + b.monto, 0);
  const totalGeneral = totalOrdinarios + totalExtraordinarios;
  const cuota = data.nroInmuebles > 0 ? totalGeneral / data.nroInmuebles : 0;

  return (
    <Box sx={{ bgcolor: "#121212", color: "#e0e0e0", minHeight: "100vh", p: 3 }}>
      <NavigationMenu />
    <Paper
  sx={{
    bgcolor: "#1e1e1e",
    p: 3,
    borderRadius: 3,
    maxWidth: 900,
    mx: "auto",
    mt: 6, // 👈 añade espacio arriba para bajar todo el bloque
  }}
  elevation={4}
>

        {/* Header principal */}
        <Box display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #333" pb={1}>
          <Typography variant="h5" fontWeight="bold">GASTOS</Typography>
          <Typography color="#90caf9" fontWeight="bold">
            {new Date().toLocaleDateString("es-ES", { month: "short", year: "numeric" }).toUpperCase()}
          </Typography>
        </Box>

        {/* Totales */}
        <Box display="flex" justifyContent="center" alignItems="center" gap={4} mt={2} mb={3}>
          <Typography fontWeight="bold" fontSize="1.1rem">
            Total: <span style={{ color: "#4caf50" }}>{formatCurrency(totalGeneral)}</span>
          </Typography>
          <Typography fontWeight="bold" fontSize="1.1rem">
            Cuota: <span style={{ color: "#64b5f6" }}>{formatCurrency(cuota)}</span>
          </Typography>
        </Box>

        {["ordinario", "extraordinario"].map((tipo) => {
          const items = tipo === "ordinario" ? data.ordinarios : data.extraordinarios;
          const total = tipo === "ordinario" ? totalOrdinarios : totalExtraordinarios;
          const color = tipo === "ordinario" ? "#4caf50" : "#ef5350";

          return (
            <Box key={tipo} mb={4}>
              {/* Título sección */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {tipo === "ordinario" ? "GASTOS ORDINARIOS" : "GASTOS EXTRAORDINARIOS"}
                </Typography>
                <Button
                  startIcon={<Add />}
                  size="small"
                  sx={{ color, textTransform: "none", fontWeight: "bold" }}
                  onClick={() => handleAdd(tipo as any)}
                >
                  Añadir
                </Button>
              </Box>

              {/* Encabezado */}
              <Box
                display="grid"
                gridTemplateColumns="40px 1.4fr 1.4fr 60px 100px 90px 70px 50px"
                bgcolor="#2a2a2a"
                p={1}
                borderRadius={1}
              >
                {["Lin.", "Concepto", "Proveedor", "Espec.", "Nro.Doc.", "Monto", "Saldo", "Acc."].map((h) => (
                  <Typography
                    key={h}
                    fontSize="0.75rem"
                    fontWeight="bold"
                    textAlign={["Monto", "Saldo", "Acc."].includes(h) ? "right" : "left"}
                  >
                    {h}
                  </Typography>
                ))}
              </Box>

              {/* Filas */}
              {items.map((g, i) => (
                <Box
                  key={g.id}
                  display="grid"
                  gridTemplateColumns="40px 1.4fr 1.4fr 60px 100px 90px 70px 50px"
                  alignItems="center"
                  p={1}
                  borderBottom="1px solid #2f2f2f"
                  sx={{ "&:hover": { bgcolor: "#1b1b1b" } }}
                >
                  <Typography fontSize="0.8rem">{i + 1}.</Typography>
                  <Typography fontSize="0.8rem">{g.concepto}</Typography>
                  <Typography fontSize="0.8rem">{g.proveedor}</Typography>
                  <Box display="flex" justifyContent="center">
                    <Checkbox checked={g.especial} size="small" sx={{ color: "#aaa" }} disabled />
                  </Box>
                  <Typography fontSize="0.8rem">{g.documento}</Typography>
                  <Typography fontSize="0.8rem" textAlign="right">{formatCurrency(g.monto)}</Typography>
                  <Typography fontSize="0.8rem" textAlign="right">{formatCurrency(g.saldo)}</Typography>
                  <Box display="flex" justifyContent="flex-end">
                    <IconButton size="small" color="error" onClick={() => handleDelete(g.id, tipo as any)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}

              {/* Total de sección */}
              <Box display="flex" justifyContent="flex-end" bgcolor="#222" p={1.5} borderRadius={1} mt={1}>
                <Typography fontWeight="bold" fontSize="0.9rem" color={color}>
                  Total {tipo === "ordinario" ? "Ordinarios" : "Extraordinarios"}: {formatCurrency(total)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Paper>

      {/* Modal confirmación */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} closeAfterTransition>
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "#1e1e1e",
              p: 3,
              borderRadius: 2,
              boxShadow: 24,
              minWidth: 320,
              color: "#fff",
            }}
          >
            <Typography variant="h6" mb={2}>
              Confirmar eliminación
            </Typography>
            <Typography mb={3}>¿Deseas eliminar este gasto?</Typography>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={() => setModalOpen(false)} variant="outlined" color="inherit" size="small">
                Cancelar
              </Button>
              <Button onClick={confirmDelete} variant="contained" color="error" size="small">
                Eliminar
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
