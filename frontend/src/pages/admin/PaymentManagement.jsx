import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  Select,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Divider // ← AGREGAR ESTO
} from "@mui/material";
import {
  Payment,
  Check,
  Visibility,
  Refresh,
  Upload,
  Edit,
  TrendingUp,
  AttachMoney,
  People,
  Close // ← AGREGAR ESTO
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

const PaymentManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    verifying: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error loading transactions");

      const data = await response.json();
      setTransactions(data.transactions || []);
      calculateStats(data.transactions || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
      alert("Error cargando transacciones: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions) => {
    const stats = {
      total: transactions.length,
      pending: transactions.filter((t) => t.status === "PENDING").length,
      completed: transactions.filter((t) => t.status === "COMPLETED").length,
      cancelled: transactions.filter((t) => t.status === "CANCELLED").length,
      verifying: transactions.filter((t) => t.status === "VERIFYING").length,
      totalAmount: transactions
        .filter((t) => t.status === "COMPLETED")
        .reduce((sum, t) => sum + t.amountUSD, 0),
    };
    setStats(stats);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  const handleUpdateStatus = (transaction) => {
    setSelectedTransaction(transaction);
    setStatus(transaction.status);
    setAdminNotes(transaction.adminNotes || "");
    setStatusDialogOpen(true);
  };

  const submitStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/transactions/${selectedTransaction.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, adminNotes }),
        }
      );

      if (response.ok) {
        await loadTransactions();
        setStatusDialogOpen(false);
        setSelectedTransaction(null);
        alert("Estado actualizado exitosamente");
      } else {
        throw new Error("Error updating status");
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
      alert("Error actualizando estado: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "PENDING":
        return "warning";
      case "VERIFYING":
        return "info";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      ZELLE: "primary",
      PAGO_MOVIL: "secondary",
      CRYPTO: "warning",
      CASH_USD: "success",
      CASH_BS: "info",
      ZINLI: "error",
    };
    return colors[method] || "default";
  };

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "VES",
    }).format(amount);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    switch (tabValue) {
      case 1:
        return transaction.status === "PENDING";
      case 2:
        return transaction.status === "VERIFYING";
      case 3:
        return transaction.status === "COMPLETED";
      case 4:
        return transaction.status === "CANCELLED";
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography>Cargando transacciones...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Payment sx={{ fontSize: 40, color: "primary.main" }} />
            <Box>
              <Typography variant="h4" component="h1">
                Gestión de Pagos y Transacciones
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Administra todos los pagos y transacciones de Creaciones Roxo
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadTransactions}
          >
            Actualizar
          </Button>
        </Box>
      </Paper>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <AttachMoney
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography color="textSecondary" gutterBottom>
                Total Recaudado
              </Typography>
              <Typography variant="h5" color="primary.main">
                ${stats.totalAmount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <TrendingUp sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Completadas
              </Typography>
              <Typography variant="h5" color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Payment sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Pendientes
              </Typography>
              <Typography variant="h5" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <People sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                En Verificación
              </Typography>
              <Typography variant="h5" color="info.main">
                {stats.verifying}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Close sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Canceladas
              </Typography>
              <Typography variant="h5" color="error.main">
                {stats.cancelled}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography color="textSecondary" gutterBottom>
                Total
              </Typography>
              <Typography variant="h5">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs de filtrado */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Todas" />
          <Tab label="Pendientes" />
          <Tab label="En Verificación" />
          <Tab label="Completadas" />
          <Tab label="Canceladas" />
        </Tabs>
      </Paper>

      {/* Tabla de transacciones */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Monto USD</TableCell>
              <TableCell>Monto BS</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id} hover>
                <TableCell>#{transaction.id}</TableCell>
                <TableCell>
                  <Typography fontWeight="bold">
                    {transaction.user?.firstName} {transaction.user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {transaction.user?.email}
                  </Typography>
                  {transaction.user?.phone && (
                    <Typography variant="body2" color="textSecondary">
                      {transaction.user.phone}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.paymentMethod}
                    color={getPaymentMethodColor(transaction.paymentMethod)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">
                    ${transaction.amountUSD.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {transaction.amountBS ? (
                    <Typography variant="body2">
                      Bs. {transaction.amountBS.toFixed(2)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      N/A
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.status}
                    color={getStatusColor(transaction.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(transaction.createdAt).toLocaleDateString("es-VE")}
                  <Typography variant="body2" color="textSecondary">
                    {new Date(transaction.createdAt).toLocaleTimeString(
                      "es-VE"
                    )}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleViewDetails(transaction)}
                      title="Ver detalles"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleUpdateStatus(transaction)}
                      title="Editar estado"
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredTransactions.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No hay transacciones para mostrar
          </Typography>
        </Box>
      )}

      {/* Diálogo de detalles CORREGIDO */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">
              Detalles de la Transacción #{selectedTransaction?.id}
            </Typography>
            <IconButton onClick={() => setDetailDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Información de la transacción */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    📋 Información de la Transacción
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        ID:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        #{selectedTransaction.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Estado:
                      </Typography>
                      <Chip
                        label={selectedTransaction.status}
                        color={getStatusColor(selectedTransaction.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Método de Pago:
                      </Typography>
                      <Chip
                        label={selectedTransaction.paymentMethod}
                        color={getPaymentMethodColor(
                          selectedTransaction.paymentMethod
                        )}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Monto USD:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="success.main"
                      >
                        ${selectedTransaction.amountUSD.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Monto BS:
                      </Typography>
                      <Typography variant="body2">
                        {selectedTransaction.amountBS
                          ? `Bs. ${selectedTransaction.amountBS.toFixed(2)}`
                          : "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Fecha:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(
                          selectedTransaction.createdAt
                        ).toLocaleDateString("es-VE")}
                      </Typography>
                    </Grid>
                  </Grid>

                  {selectedTransaction.adminNotes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Notas del Administrador:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          p: 1,
                          bgcolor: "grey.100",
                          borderRadius: 1,
                        }}
                      >
                        {selectedTransaction.adminNotes}
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>

              {/* Información del cliente */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    👤 Información del Cliente
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Nombre:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedTransaction.user?.firstName}{" "}
                        {selectedTransaction.user?.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Email:
                      </Typography>
                      <Typography variant="body2">
                        {selectedTransaction.user?.email}
                      </Typography>
                    </Grid>
                    {selectedTransaction.user?.phone && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          Teléfono:
                        </Typography>
                        <Typography variant="body2">
                          {selectedTransaction.user.phone}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Card>
              </Grid>

              {/* Información de productos (si está disponible) */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    🛍️ Productos Incluidos
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    Información de productos disponible en el sistema de
                    órdenes.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para actualizar estado */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Actualizar Estado - Transacción #{selectedTransaction?.id}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={status}
              label="Estado"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="PENDING">Pendiente</MenuItem>
              <MenuItem value="VERIFYING">En Verificación</MenuItem>
              <MenuItem value="COMPLETED">Completada</MenuItem>
              <MenuItem value="CANCELLED">Cancelada</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notas del Administrador"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Agregar notas sobre esta transacción..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancelar</Button>
          <Button onClick={submitStatusUpdate} variant="contained">
            Actualizar Estado
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentManagement;
