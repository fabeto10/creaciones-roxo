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
  ListItemIcon,
} from "@mui/material";
import {
  CheckCircle,
  ShoppingBag,
  Download,
  Email,
  Home,
} from "@mui/icons-material";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de orden (en una implementación real, harías una llamada API)
    const timer = setTimeout(() => {
      setOrder({
        id: orderId,
        status: "PENDING",
        totalUSD: 45.99,
        totalBS: 7821.83,
        paymentMethod: "PAGO_MOVIL",
        createdAt: new Date().toISOString(),
        items: [
          { product: { name: "Pulsera Elegante" }, quantity: 1, price: 25.99 },
          { product: { name: "Dije Corazón" }, quantity: 2, price: 10.0 },
        ],
        transaction: {
          reference: "1234567890",
          senderName: "Juan Pérez",
        },
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [orderId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6">Cargando confirmación...</Typography>
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
            <strong>Próximos pasos:</strong> Realiza el pago según las
            instrucciones y sube el comprobante. Tu pedido será enviado una vez
            confirmemos el pago.
          </Typography>
        </Alert>

        <Grid container spacing={4}>
          {/* Detalles de la orden */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📦 Detalles de la Orden
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
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
                      label={order.status}
                      color={
                        order.status === "COMPLETED" ? "success" : "warning"
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
                <Typography variant="subtitle1" gutterBottom>
                  📋 Resumen de Pago:
                </Typography>
                <Typography>
                  <strong>Método:</strong> {order.paymentMethod}
                </Typography>
                <Typography>
                  <strong>Total USD:</strong> ${order.totalUSD.toFixed(2)}
                </Typography>
                {order.totalBS && (
                  <Typography>
                    <strong>Total BS:</strong> {order.totalBS.toFixed(2)}
                  </Typography>
                )}
                {order.transaction?.reference && (
                  <Typography>
                    <strong>Referencia:</strong> {order.transaction.reference}
                  </Typography>
                )}
                {order.transaction?.senderName && (
                  <Typography>
                    <strong>Remitente:</strong> {order.transaction.senderName}
                  </Typography>
                )}
                {order.exchangeRate && (
                  <Typography>
                    <strong>Tasa de cambio:</strong> {order.exchangeRate} BS/USD
                  </Typography>
                )}
                // En los detalles de pago
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

          {/* Productos */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎀 Productos en tu Orden
                </Typography>
                <Divider sx={{ my: 2 }} />

                <List>
                  {order.items.map((item, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={item.product.name}
                        secondary={
                          <Typography variant="body2">
                            Cantidad: {item.quantity} × ${item.price} = $
                            {(item.quantity * item.price).toFixed(2)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6" align="right">
                    Total: ${order.totalUSD.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Instrucciones de pago */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💳 Instrucciones para Completar el Pago
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box component="ol" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body1" gutterBottom>
                  <strong>Realiza el pago</strong> usando el método seleccionado
                  ({order.paymentMethod})
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
                  <strong>Espera la confirmación</strong> por correo electrónico
                  (1-2 horas)
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
            startIcon={<Home />}
            onClick={() => navigate("/")}
          >
            Ir al Inicio
          </Button>
          <Button
            variant="outlined"
            startIcon={<Email />}
            onClick={() => window.print()}
          >
            Imprimir Comprobante
          </Button>
        </Box>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            ¿Tienes preguntas? <Link to="/contact">Contáctanos</Link> o escribe
            a support@creacionesroxo.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmationPage;
