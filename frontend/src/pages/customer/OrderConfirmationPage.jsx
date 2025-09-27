import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle,
  ShoppingBag,
  Home,
  Receipt,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);
  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Cargando orden ID:", orderId);

      const token = localStorage.getItem("token");

      // ✅ USAR EL SERVICIO transactionsAPI EN LUGAR DE fetch DIRECTAMENTE
      const response = await fetch(
        `http://localhost:5000/api/transactions/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📊 Status de respuesta:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Datos recibidos:", data);

      // ✅ VERIFICAR DIFERENTES ESTRUCTURAS POSIBLES
      if (data.transaction) {
        setOrder(data.transaction);
      } else if (data.data) {
        setOrder(data.data);
      } else if (data.id) {
        setOrder(data);
      } else {
        throw new Error("Estructura de respuesta no reconocida");
      }
    } catch (error) {
      console.error("❌ Error cargando orden:", error);
      setError("No se pudo cargar la orden: " + error.message);
    } finally {
      setLoading(false);
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

  const getPaymentMethodInfo = (method) => {
    const methods = {
      ZELLE: "Zelle Transfer",
      PAGO_MOVIL: "Pago Móvil",
      CRYPTO: "Criptomonedas",
      ZINLI: "Zinli",
      CASH_USD: "Efectivo USD",
      CASH_BS: "Efectivo BS",
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando detalles de tu orden...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <ErrorIcon />
          <Typography variant="h6">Error al cargar la orden</Typography>
          <Typography>{error}</Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/my-orders")}
          startIcon={<Receipt />}
        >
          Ver Mis Órdenes
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          <Typography variant="h6">Orden no encontrada</Typography>
          <Typography>
            La orden #{orderId} no existe o no tienes permisos para verla.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
          <Typography variant="h3" gutterBottom className="roxo-text-gradient">
            ¡Gracias por tu compra!
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Tu orden ha sido confirmada y está siendo procesada
          </Typography>
          <Chip
            label={`Orden #${order.id}`}
            color="primary"
            sx={{ mt: 2, fontSize: "1.1rem", px: 2 }}
          />
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>Próximos pasos:</strong>{" "}
            {order.status === "PENDING"
              ? "Realiza el pago según las instrucciones y sube el comprobante."
              : order.status === "VERIFYING"
              ? "Tu pago está siendo verificado. Te notificaremos por correo electrónico."
              : "Tu orden ha sido procesada exitosamente."}
          </Typography>
        </Alert>

        <Grid container spacing={4}>
          {/* Información del Cliente */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👤 Información del Cliente
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography>
                    <strong>Nombre:</strong> {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {user?.email}
                  </Typography>
                  {user?.phone && (
                    <Typography>
                      <strong>Teléfono:</strong> {user.phone}
                    </Typography>
                  )}
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  📋 Detalles de la Transacción
                </Typography>
                <Typography>
                  <strong>Fecha:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString("es-VE")}
                </Typography>
                <Typography>
                  <strong>Hora:</strong>{" "}
                  {new Date(order.createdAt).toLocaleTimeString("es-VE")}
                </Typography>
                <Typography>
                  <strong>Estado:</strong>
                  <Chip
                    label={getStatusText(order.status)}
                    color={getStatusColor(order.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Detalles de Pago */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💳 Información de Pago
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography>
                    <strong>Método de pago:</strong>{" "}
                    {getPaymentMethodInfo(order.paymentMethod)}
                  </Typography>
                  <Typography>
                    <strong>Monto USD:</strong> ${order.amountUSD?.toFixed(2)}
                  </Typography>
                  {order.amountBS && (
                    <Typography>
                      <strong>Monto BS:</strong> Bs. {order.amountBS.toFixed(2)}
                    </Typography>
                  )}
                  {order.exchangeRate && (
                    <Typography>
                      <strong>Tasa de cambio:</strong> {order.exchangeRate}{" "}
                      BS/USD
                    </Typography>
                  )}
                  {order.reference && (
                    <Typography>
                      <strong>Referencia:</strong> {order.reference}
                    </Typography>
                  )}
                  {order.senderName && (
                    <Typography>
                      <strong>Remitente:</strong> {order.senderName}
                    </Typography>
                  )}
                </Box>

                {/* Mensaje de ahorro para métodos USD */}
                {order.paymentMethod &&
                  ["ZELLE", "CRYPTO", "ZINLI", "CASH_USD"].includes(
                    order.paymentMethod
                  ) && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1,
                        bgcolor: "success.light",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" color="success.dark">
                        ✅ <strong>¡Excelente elección!</strong> Ahorraste
                        pagando directamente en USD.
                      </Typography>
                    </Box>
                  )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Productos Comprados */}
        {order.orders && order.orders.length > 0 && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎀 Productos en tu Orden
              </Typography>
              <Divider sx={{ my: 2 }} />

              {order.orders.map((orderItem, index) => (
                <Box key={index}>
                  {orderItem.items &&
                  Array.isArray(orderItem.items) &&
                  orderItem.items.length > 0 ? (
                    <List>
                      {orderItem.items.map((item, itemIndex) => (
                        <ListItem key={itemIndex} divider>
                          <ListItemText
                            primary={item.productName || "Producto"}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Cantidad: {item.quantity} × $
                                  {item.price?.toFixed(2)} = $
                                  {(item.quantity * item.price).toFixed(2)}
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
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No hay información detallada de productos disponible.
                    </Typography>
                  )}

                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h6" align="right">
                      Total: ${orderItem.totalUSD?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Instrucciones de Pago (solo para órdenes pendientes) */}
        {order.status === "PENDING" && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📝 Instrucciones para Completar el Pago
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box component="ol" sx={{ pl: 3 }}>
                <li>
                  <Typography variant="body1" gutterBottom>
                    <strong>Realiza el pago</strong> usando{" "}
                    {getPaymentMethodInfo(order.paymentMethod)}
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" gutterBottom>
                    <strong>Guarda el comprobante</strong> de pago (captura de
                    pantalla o foto)
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" gutterBottom>
                    <strong>Sube el comprobante</strong> en la sección "Mis
                    Órdenes" de tu perfil
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Espera la confirmación</strong> por correo
                    electrónico (1-2 horas)
                  </Typography>
                </li>
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Importante:</strong> Tu pedido será procesado solo
                  después de confirmar el pago.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            startIcon={<ShoppingBag />}
            onClick={() => navigate("/tienda")}
            size="large"
          >
            Seguir Comprando
          </Button>

          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={() => navigate("/my-orders")}
          >
            Ver Mis Órdenes
          </Button>

          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={() => navigate("/")}
          >
            Ir al Inicio
          </Button>
        </Box>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            ¿Tienes preguntas? Contáctanos en support@creacionesroxo.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmationPage;
