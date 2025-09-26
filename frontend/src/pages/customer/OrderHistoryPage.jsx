import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
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
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton, // ✅ AGREGAR ESTA IMPORTACIÓN
  Divider, // ✅ AGREGAR ESTA IMPORTACIÓN
} from "@mui/material";
import {
  Visibility,
  Receipt,
  ShoppingBag,
  Payment,
  CalendarToday,
  AttachMoney,
  Close, // ✅ AGREGAR ESTA IMPORTACIÓN
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/my-orders",
          message: "Necesitas iniciar sesión para ver tus órdenes",
        },
      });
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/transactions/my-transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.transactions || []);
      } else {
        throw new Error("Error loading orders");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
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

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: "Pendiente de pago",
      VERIFYING: "Verificando pago",
      COMPLETED: "Completada",
      CANCELLED: "Cancelada",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando tus órdenes...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Receipt sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">
              Mis Órdenes
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Historial de tus compras en Creaciones Roxo
            </Typography>
          </Box>
        </Box>
      </Paper>

      {orders.length === 0 ? (
        <Box textAlign="center" py={8}>
          <ShoppingBag sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Aún no tienes órdenes
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            ¡Descubre nuestros productos y realiza tu primera compra!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/tienda")}
            size="large"
          >
            Ir a la Tienda
          </Button>
        </Box>
      ) : (
        <>
          {/* Estadísticas rápidas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <ShoppingBag sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Total Órdenes
                  </Typography>
                  <Typography variant="h4">{orders.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Payment sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Completadas
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {orders.filter((o) => o.status === "COMPLETED").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <AttachMoney sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Total Gastado
                  </Typography>
                  <Typography variant="h4">
                    ${orders.filter((o) => o.status === "COMPLETED").reduce((sum, o) => sum + (o.amountUSD || 0), 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <CalendarToday sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Pendientes
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {orders.filter((o) => o.status === "PENDING" || o.status === "VERIFYING").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de órdenes */}
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Método de Pago</TableCell>
                  <TableCell>Monto USD</TableCell>
                  <TableCell>Monto BS</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("es-VE")}
                      <Typography variant="body2" color="textSecondary">
                        {new Date(order.createdAt).toLocaleTimeString("es-VE")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={order.paymentMethod} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        ${order.amountUSD.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {order.amountBS ? (
                        <Typography variant="body2">
                          Bs. {order.amountBS.toFixed(2)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewOrder(order)}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Diálogo de detalles de orden - VERSIÓN CORREGIDA */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={window.innerWidth < 768}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Detalles de la Orden #{selectedOrder?.id}
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      📋 Información de la Orden
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Fecha:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {new Date(selectedOrder.createdAt).toLocaleDateString("es-VE")}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Hora:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {new Date(selectedOrder.createdAt).toLocaleTimeString("es-VE")}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Método:</Typography>
                        <Chip label={selectedOrder.paymentMethod} size="small" color="primary" sx={{ mt: 0.5 }} />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Estado:</Typography>
                        <Chip
                          label={getStatusText(selectedOrder.status)}
                          color={getStatusColor(selectedOrder.status)}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      💰 Información de Pago
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2">
                      <strong>Monto USD:</strong> ${selectedOrder.amountUSD?.toFixed(2)}
                    </Typography>
                    {selectedOrder.amountBS && (
                      <Typography variant="body2">
                        <strong>Monto BS:</strong> Bs. {selectedOrder.amountBS.toFixed(2)}
                      </Typography>
                    )}
                    {selectedOrder.exchangeRate && (
                      <Typography variant="body2">
                        <strong>Tasa:</strong> {selectedOrder.exchangeRate} BS/USD
                      </Typography>
                    )}
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
                🎀 Productos en tu Orden
              </Typography>

              {selectedOrder.orders && selectedOrder.orders.length > 0 ? (
                selectedOrder.orders.map((order, orderIndex) => (
                  <Box key={orderIndex} sx={{ mb: 3 }}>
                    {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                      <Grid container spacing={2}>
                        {order.items.map((item, itemIndex) => {
                          const productImages = item.productImages && Array.isArray(item.productImages) 
                            ? item.productImages 
                            : [];

                          return (
                            <Grid item xs={12} key={itemIndex}>
                              <Card sx={{ p: { xs: 1, md: 2 }, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                                <Grid container spacing={2} alignItems="center" sx={{ flexDirection: { xs: "column", md: "row" } }}>
                                  {/* Galería de imágenes */}
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ display: "flex", gap: 1, overflowX: "auto", justifyContent: { xs: "flex-start", md: "center" }, py: 1 }}>
                                      {productImages.length > 0 ? (
                                        productImages.map((img, imgIndex) => {
                                          const imageUrl = img.startsWith("http") 
                                            ? img 
                                            : `http://localhost:5000${img}`;
                                          
                                          return (
                                            <Box 
                                              key={imgIndex}
                                              sx={{ 
                                                width: 80, 
                                                height: 80,
                                                flexShrink: 0,
                                                cursor: "pointer",
                                                borderRadius: 1,
                                                overflow: "hidden",
                                                border: "2px solid #e0e0e0",
                                                "&:hover": { borderColor: "primary.main" }
                                              }}
                                              onClick={() => window.open(imageUrl, "_blank")}
                                              title="Haz clic para ver la imagen en tamaño completo"
                                            >
                                              <img
                                                src={imageUrl}
                                                alt={`${item.productName} ${imgIndex + 1}`}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                onError={(e) => e.target.src = "/images/placeholder-bracelet.jpg"}
                                              />
                                            </Box>
                                          );
                                        })
                                      ) : (
                                        <Box sx={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.100", borderRadius: 1 }}>
                                          <img src="/images/placeholder-bracelet.jpg" alt="Placeholder" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        </Box>
                                      )}
                                    </Box>
                                    {productImages.length > 1 && (
                                      <Typography variant="caption" color="textSecondary" sx={{ display: "block", textAlign: "center", mt: 1 }}>
                                        {productImages.length} imágenes - Clic para ampliar
                                      </Typography>
                                    )}
                                  </Grid>

                                  {/* Información del producto */}
                                  <Grid item xs={12} md={9}>
                                    <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                                      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ wordBreak: "break-word" }}>
                                        {item.productName || "Producto no disponible"}
                                      </Typography>
                                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1, justifyContent: { xs: "center", md: "flex-start" } }}>
                                        <Chip label={`Cantidad: ${item.quantity}`} size="small" color="primary" variant="outlined" />
                                        <Chip label={`Precio: $${item.price?.toFixed(2) || "0.00"}`} size="small" color="secondary" variant="outlined" />
                                        <Chip label={`Subtotal: $${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`} size="small" color="success" />
                                      </Box>
                                      {item.customization && (
                                        <Box sx={{ mb: 1 }}>
                                          <Typography variant="body2" color="textSecondary">
                                            <strong>Personalización:</strong>
                                            {item.customization.material && ` Material: ${item.customization.material}`}
                                            {item.customization.color && `, Color: ${item.customization.color}`}
                                            {item.customization.charm && `, Dije: ${item.customization.charm}`}
                                          </Typography>
                                        </Box>
                                      )}
                                      {item.productDescription && (
                                        <Typography variant="body2" sx={{ mt: 1, display: { xs: "none", md: "block" } }} color="textSecondary">
                                          {item.productDescription}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : (
                      <Alert severity="info">No hay información detallada de productos disponibles</Alert>
                    )}
                  </Box>
                ))
              ) : (
                <Alert severity="info">No se encontró información de productos para esta orden</Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ flexDirection: { xs: "column", md: "row" }, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" fullWidth={window.innerWidth < 768}>
            Cerrar
          </Button>
          {(selectedOrder?.status === "PENDING" || selectedOrder?.status === "VERIFYING") && (
            <Button variant="contained" fullWidth={window.innerWidth < 768}>
              Subir Comprobante
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderHistoryPage;