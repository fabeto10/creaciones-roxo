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
} from "@mui/material";
import {
  Payment,
  Check,
  Close,
  Visibility,
  Refresh,
  Upload,
  Edit,
  TrendingUp,
  AttachMoney,
  People,
} from "@mui/icons-material";

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

      {/* Diálogo de detalles */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles de Transacción #{selectedTransaction?.id}
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Información del Cliente
                </Typography>
                <Typography>
                  <strong>Nombre:</strong> {selectedTransaction.user?.firstName}{" "}
                  {selectedTransaction.user?.lastName}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {selectedTransaction.user?.email}
                </Typography>
                <Typography>
                  <strong>Teléfono:</strong>{" "}
                  {selectedTransaction.user?.phone || "No proporcionado"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Información de Pago
                </Typography>
                <Typography>
                  <strong>Método:</strong>
                  <Chip
                    label={selectedTransaction.paymentMethod}
                    color={getPaymentMethodColor(
                      selectedTransaction.paymentMethod
                    )}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography>
                  <strong>Monto USD:</strong> $
                  {selectedTransaction.amountUSD.toFixed(2)}
                </Typography>
                {selectedTransaction.amountBS && (
                  <Typography>
                    <strong>Monto BS:</strong> Bs.{" "}
                    {selectedTransaction.amountBS.toFixed(2)}
                  </Typography>
                )}
                {selectedTransaction.exchangeRate && (
                  <Typography>
                    <strong>Tasa:</strong> {selectedTransaction.exchangeRate}{" "}
                    BS/USD
                  </Typography>
                )}
                <Typography>
                  <strong>Estado:</strong>
                  <Chip
                    label={selectedTransaction.status}
                    color={getStatusColor(selectedTransaction.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>

              {selectedTransaction.orders &&
                selectedTransaction.orders.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Productos Comprados
                    </Typography>
                    {selectedTransaction.orders.map((order, orderIndex) => (
                      <Box key={orderIndex}>
                        {order.items &&
                          Array.isArray(order.items) &&
                          order.items.map((item, itemIndex) => {
                            // Obtener la primera imagen del producto o usar placeholder
                            const productImage =
                              item.productImages &&
                              item.productImages.length > 0
                                ? item.productImages[0].startsWith("http")
                                  ? item.productImages[0]
                                  : `http://localhost:5000${item.productImages[0]}`
                                : "/images/placeholder-bracelet.jpg";

                            return (
                              <Box
                                key={itemIndex}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  py: 1,
                                  borderBottom: "1px solid #eee",
                                  mb: 1,
                                }}
                              >
                                <img
                                  src={productImage}
                                  alt={item.productName || "Producto"}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    objectFit: "cover",
                                    borderRadius: 4,
                                  }}
                                  onError={(e) => {
                                    e.target.src =
                                      "/images/placeholder-bracelet.jpg";
                                  }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1" fontWeight="bold">
                                    {item.productName ||
                                      "Producto no disponible"}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Cantidad: {item.quantity} | Precio: $
                                    {item.price?.toFixed(2) || "0.00"}
                                  </Typography>
                                  {item.customization && (
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                    >
                                      Personalización:{" "}
                                      {item.customization.material},{" "}
                                      {item.customization.color}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            );
                          })}
                      </Box>
                    ))}
                  </Grid>
                )}

              {selectedTransaction.reference && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Información de Transacción
                  </Typography>
                  <Typography>
                    <strong>Referencia:</strong> {selectedTransaction.reference}
                  </Typography>
                  {selectedTransaction.senderName && (
                    <Typography>
                      <strong>Remitente:</strong>{" "}
                      {selectedTransaction.senderName}
                    </Typography>
                  )}
                  {selectedTransaction.senderPhone && (
                    <Typography>
                      <strong>Teléfono Remitente:</strong>{" "}
                      {selectedTransaction.senderPhone}
                    </Typography>
                  )}
                </Grid>
              )}

              {selectedTransaction.screenshot && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Comprobante de Pago
                  </Typography>
                  <img
                    src={`http://localhost:5000${selectedTransaction.screenshot}`}
                    alt="Comprobante de pago"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 400,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                    }}
                  />
                </Grid>
              )}

              {selectedTransaction.adminNotes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Notas del Administrador
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                    <Typography>{selectedTransaction.adminNotes}</Typography>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Creación:</strong>{" "}
                  {new Date(selectedTransaction.createdAt).toLocaleString(
                    "es-VE"
                  )}
                  {selectedTransaction.verifiedAt && (
                    <>
                      {" "}
                      | <strong>Verificación:</strong>{" "}
                      {new Date(selectedTransaction.verifiedAt).toLocaleString(
                        "es-VE"
                      )}
                    </>
                  )}
                </Typography>
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
