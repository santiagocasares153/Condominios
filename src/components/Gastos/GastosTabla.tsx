import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Typography, IconButton,  Box, Chip, Stack, useTheme 
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface Gasto {
  id: number;
  concepto: string;
  proveedor: string;
  documento: string;
  monto: number;
  saldo: number;
  especial: boolean;
}

const formatCurrency = (val: number) => 
  val.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function GastosTabla({ tipo }: { tipo: "ordinario" | "extraordinario" }) {
  const theme = useTheme();
  
  const rows: Gasto[] = [
    { id: 1, concepto: "Vigilancia Privada", proveedor: "Vigilaca", documento: "V-102", monto: 1200, saldo: 0, especial: true },
    { id: 2, concepto: "Reparación Ascensor", proveedor: "Otis", documento: "F-500", monto: 450, saldo: 450, especial: false },
  ];

  return (
    <TableContainer sx={{ maxHeight: 600 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {["ID", "Concepto / Proveedor", "Documento", "Monto", "Saldo", "Tipo", "Acciones"].map((h) => (
              <TableCell 
                key={h} 
                sx={{ 
                  bgcolor: "#004d40", // Se mantiene oscuro en ambos temas por diseño
                  color: "white", 
                  fontWeight: "bold", 
                  fontSize: "11px", 
                  borderBottom: "none",
                  py: 1.5
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow 
              key={row.id}
              sx={{
                transition: "all 0.2s",
                bgcolor: "background.paper",
                "&:hover": { 
                  backgroundColor: "#80cbc4 !important",
                  "& .MuiTypography-root, & .MuiTableCell-root": { 
                    color: "#002420 !important",
                    fontWeight: 500
                  }
                }
              }}
            >
              <TableCell sx={{ color: theme.palette.text.secondary }}>{row.id}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold" color="text.primary">{row.concepto}</Typography>
                <Typography variant="caption" color="text.secondary">{row.proveedor}</Typography>
              </TableCell>
              <TableCell sx={{ color: "text.primary" }}>{row.documento}</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>{formatCurrency(row.monto)}</TableCell>
              <TableCell sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
                {row.saldo > 0 ? formatCurrency(row.saldo) : "-"}
              </TableCell>
              <TableCell>
                <Chip 
                  label={row.especial ? "ESPECIAL" : "COMÚN"} 
                  size="small" 
                  sx={{ 
                    fontSize: "9px", fontWeight: "bold",
                    bgcolor: row.especial ? "#00695c" : theme.palette.divider,
                    color: row.especial ? "white" : theme.palette.text.primary
                  }} 
                />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" sx={{ bgcolor: "#00897b", color: "white", "&:hover": { bgcolor: "#00695c" } }}>
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton size="small" sx={{ bgcolor: "#d32f2f", color: "white", "&:hover": { bgcolor: "#b71c1c" } }}>
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Footer adaptativo */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'flex-end', 
        bgcolor: theme.palette.mode === 'dark' ? "rgba(0,0,0,0.2)" : "#f9f9f9",
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#00897b" }}>
          TOTAL {tipo.toUpperCase()}S: <Box component="span" sx={{ color: "text.primary", ml: 1 }}>{formatCurrency(1650)}</Box>
        </Typography>
      </Box>
    </TableContainer>
  );
}

{/*

DATOS PAR A GASTOS
clase campo oculto o key, enviar valor fijo ETO
fecha de emision 
concepto
monto
tasa
documento
campo de busqueda proveedor, enviar id del proveedor
campo comentarios
tipo de gasto lista desplegable: factura(FAC), nota de entrega(NE)
referencia

tipo (especial o comun)
*/}