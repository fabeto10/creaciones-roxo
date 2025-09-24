import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
} from "@mui/material";
import {
  ShoppingCart,
  Payment,
  Check,
  CloudUpload,
  Delete as DeleteIcon,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const { cartItems, getCartTotal, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    senderName: "",
    senderPhone: "",
    reference: "",
    screenshot: null,
  });
  const [exchangeInfo, setExchangeInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = ["Revisar Carrito", "Método de Pago", "Confirmar Pedido"];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/checkout",
          message: "Necesitas iniciar sesión para realizar una compra",
        },
      });
      return;
    }

    if (cartItems.length === 0) {
      navigate("/tienda");
    }
  }, [isAuthenticated, cartItems, navigate]);

  // Calcular información de cambio
  const calculateExchange = async () => {
    if (!paymentMethod) return;

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/transactions/payments/calculate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amountUSD: getCartTotal(),
            method: paymentMethod,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExchangeInfo(data);
      } else {
        throw new Error("Error calculando tasa de cambio");
      }
    } catch (error) {
      console.error("Error calculating exchange:", error);
      setError("Error al calcular la tasa de cambio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentMethod) {
      calculateExchange();
    }
  }, [paymentMethod, getCartTotal()]);

  const handlePaymentMethodChange = (event) => {
    const method = event.target.value;
    setPaymentMethod(method);
    setPaymentDetails({
      senderName: user ? `${user.firstName} ${user.lastName}` : "",
      senderPhone: user?.phone || "",
      reference: "",
      screenshot: null,
    });
  };

  const handleScreenshotChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen");
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen debe ser menor a 5MB");
        return;
      }

      setPaymentDetails((prev) => ({ ...prev, screenshot: file }));
      setError("");
    }
  };

  const removeScreenshot = () => {
    setPaymentDetails((prev) => ({ ...prev, screenshot: null }));
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    setError("");

    try {
      // Validaciones
      if (!paymentDetails.senderName) {
        throw new Error("El nombre del remitente es requerido");
      }

      if (paymentMethod === "PAGO_MOVIL" && !paymentDetails.reference) {
        throw new Error("La referencia de pago móvil es requerida");
      }

      // Crear FormData para la transacción
      const formData = new FormData();
      formData.append("items", JSON.stringify(cartItems));
      formData.append("paymentMethod", paymentMethod);
      formData.append("paymentDetails", JSON.stringify(paymentDetails));

      // Agregar screenshot si existe
      if (paymentDetails.screenshot) {
        formData.append("screenshot", paymentDetails.screenshot);
      }

      console.log("📤 Enviando transacción...");

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // NO incluir 'Content-Type' cuando usas FormData - el navegador lo establece automáticamente
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creando la transacción");
      }

      const transaction = await response.json();
      console.log("✅ Transacción creada:", transaction);

      clearCart();
      navigate(`/order-confirmation/${transaction.transaction.id}`);
    } catch (error) {
      console.error("❌ Error submitting order:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodInfo = (method) => {
    const info = {
      ZELLE: {
        name: "Zelle",
        instructions: "Transfiera el monto en USD directamente",
        fields: ["senderName", "senderPhone", "screenshot"],
        advantage: "Pago directo en USD - Mejor tasa",
      },
      PAGO_MOVIL: {
        name: "Pago Móvil",
        instructions: "Realice el pago en Bolívares usando la referencia",
        fields: ["senderName", "senderPhone", "reference", "screenshot"],
        advantage: "Pago en BS a tasa oficial",
      },
      CRYPTO: {
        name: "Criptomonedas",
        instructions: "Transfiera criptomonedas (USDT, BTC, etc)",
        fields: ["senderName", "screenshot"],
        advantage: "Pago en USD - Sin intermediarios",
      },
      ZINLI: {
        name: "Zinli",
        instructions: "Pague con su tarjeta Zinli",
        fields: ["senderName", "screenshot"],
        advantage: "Pago en USD - Conveniente",
      },
      CASH_USD: {
        name: "Efectivo (USD)",
        instructions: "Pague en efectivo en dólares al momento de la entrega",
        fields: ["senderName", "senderPhone"],
        advantage: "Pago en persona - Sin comisiones",
      },
      CASH_BS: {
        name: "Efectivo (BS)",
        instructions: "Pague en efectivo en bolívares al momento de la entrega",
        fields: ["senderName", "senderPhone"],
        advantage: "Pago en persona - Moneda local",
      },
    };

    return info[method] || {};
  };

  const paymentInfo = getPaymentMethodInfo(paymentMethod);

  if (!isAuthenticated || cartItems.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        className="roxo-text-gradient"
        fontWeight="bold"
      >
        Finalizar Compra
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Paso 1: Revisar Carrito */}
      {activeStep === 0 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <ShoppingCart sx={{ mr: 1, verticalAlign: "bottom" }} />
                Tu Carrito ({cartItems.length} productos)
              </Typography>

              <List>
                {cartItems.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemIcon>
                      <img
                        src={item.image}
                        alt={item.product.name}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.product.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Precio: ${item.price} x {item.quantity} = $
                            {(item.price * item.quantity).toFixed(2)}
                          </Typography>
                          {item.customization && (
                            <Typography variant="body2" color="textSecondary">
                              Personalización: {item.customization.material},{" "}
                              {item.customization.color}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </IconButton>
                      <Typography component="span" sx={{ mx: 2 }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumen del Pedido
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* En el resumen del carrito */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Subtotal: ${getCartTotal().toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Envío: Gratis
                </Typography>

                {/* Mostrar equivalente en BS */}
                {paymentMethod &&
                  (paymentMethod === "PAGO_MOVIL" ||
                    paymentMethod === "CASH_BS") &&
                  exchangeInfo?.amountBS && (
                    <Typography variant="body2" color="textSecondary">
                      Equivalente: {exchangeInfo.amountBS.toFixed(2)} BS
                    </Typography>
                  )}

                {/* Mostrar ahorro si paga en USD */}
                {paymentMethod &&
                  ["ZELLE", "CRYPTO", "ZINLI", "CASH_USD"].includes(
                    paymentMethod
                  ) &&
                  exchangeInfo?.savings && (
                    <Typography variant="body2" color="success.main">
                      ✅ Ahorras {exchangeInfo.savings.savingsPercentage}%
                    </Typography>
                  )}

                <Typography variant="h6" sx={{ mt: 1 }}>
                  Total: ${getCartTotal().toFixed(2)} USD
                </Typography>
              </Box>

              {/* En el alert de información de pago */}
              {paymentMethod && exchangeInfo && (
                <Alert severity="info" sx={{ mb: 3 }} icon={false}>
                  <Typography variant="subtitle2" gutterBottom>
                    💡 {paymentInfo.advantage}
                  </Typography>
                  <Typography variant="body2">
                    {exchangeInfo.message}
                  </Typography>
                  {exchangeInfo.amountBS && (
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Total a pagar:{" "}
                      <strong>{exchangeInfo.amountBS.toFixed(2)} BS</strong>
                    </Typography>
                  )}
                  {exchangeInfo.savings && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ mt: 1 }}
                      >
                        ✅ Ahorras aproximadamente{" "}
                        {exchangeInfo.savings.savingsPercentage}% vs tasa
                        paralela
                      </Typography>
                      <Typography variant="caption" display="block">
                        Pagas ${getCartTotal().toFixed(2)} USD en lugar de{" "}
                        {exchangeInfo.savings.amountBSParallel.toFixed(2)} BS
                      </Typography>
                    </Box>
                  )}
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={() => setActiveStep(1)}
                startIcon={<Payment />}
              >
                Continuar al Pago
              </Button>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => navigate("/tienda")}
              >
                Seguir Comprando
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Paso 2: Método de Pago */}
      {activeStep === 1 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Selecciona tu Método de Pago
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Método de Pago</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Método de Pago"
                  onChange={handlePaymentMethodChange}
                >
                  <MenuItem value="ZELLE">Zelle (USD)</MenuItem>
                  <MenuItem value="PAGO_MOVIL">Pago Móvil (BS)</MenuItem>
                  <MenuItem value="CRYPTO">Criptomonedas (USD)</MenuItem>
                  <MenuItem value="ZINLI">Zinli (USD)</MenuItem>
                  <MenuItem value="CASH_USD">Efectivo (USD)</MenuItem>
                  <MenuItem value="CASH_BS">Efectivo (BS)</MenuItem>
                </Select>
              </FormControl>

              {paymentMethod && exchangeInfo && (
                <Alert severity="info" sx={{ mb: 3 }} icon={false}>
                  <Typography variant="subtitle2" gutterBottom>
                    💡 {paymentInfo.advantage}
                  </Typography>
                  <Typography variant="body2">
                    {exchangeInfo.message}
                  </Typography>
                  {exchangeInfo.amountBS && (
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Total a pagar:{" "}
                      <strong>{exchangeInfo.amountBS.toFixed(2)} BS</strong>
                    </Typography>
                  )}
                  {exchangeInfo.savings && (
                    <Typography variant="body2" color="success.main">
                      ✅ Ahorras aproximadamente{" "}
                      {exchangeInfo.savings.savingsPercentage}% vs tasa paralela
                    </Typography>
                  )}
                </Alert>
              )}

              {paymentMethod && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Información de Pago
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nombre del remitente"
                        value={paymentDetails.senderName}
                        onChange={(e) =>
                          setPaymentDetails((prev) => ({
                            ...prev,
                            senderName: e.target.value,
                          }))
                        }
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Teléfono de contacto"
                        value={paymentDetails.senderPhone}
                        onChange={(e) =>
                          setPaymentDetails((prev) => ({
                            ...prev,
                            senderPhone: e.target.value,
                          }))
                        }
                      />
                    </Grid>

                    {paymentMethod === "PAGO_MOVIL" && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Referencia de Pago Móvil"
                          value={paymentDetails.reference}
                          onChange={(e) =>
                            setPaymentDetails((prev) => ({
                              ...prev,
                              reference: e.target.value,
                            }))
                          }
                          required
                          helperText="Ingrese la referencia de 10 dígitos"
                        />
                      </Grid>
                    )}

                    {paymentInfo.fields?.includes("screenshot") && (
                      <Grid item xs={12}>
                        <Typography variant="body2" gutterBottom>
                          Comprobante de pago:
                        </Typography>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          style={{ display: "none" }}
                          id="screenshot-upload"
                        />
                        <label htmlFor="screenshot-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUpload />}
                          >
                            Subir Comprobante
                          </Button>
                        </label>

                        {paymentDetails.screenshot && (
                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2">
                              📎 {paymentDetails.screenshot.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={removeScreenshot}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Grid>
                    )}
                  </Grid>

                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      <strong>Instrucciones:</strong> {paymentInfo.instructions}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumen Final
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Chip
                  label={
                    paymentMethod
                      ? `Pago con ${paymentInfo.name}`
                      : "Selecciona método"
                  }
                  color={paymentMethod ? "primary" : "default"}
                  sx={{ mb: 2 }}
                />

                <Typography variant="h6" color="primary.main">
                  Total: ${getCartTotal().toFixed(2)} USD
                </Typography>

                {exchangeInfo?.amountBS && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Equivale a: {exchangeInfo.amountBS.toFixed(2)} BS
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setActiveStep(0)}
                  startIcon={<NavigateBefore />}
                >
                  Atrás
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setActiveStep(2)}
                  disabled={!paymentMethod || loading}
                  startIcon={<NavigateNext />}
                >
                  Continuar
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Paso 3: Confirmar Pedido */}
      {activeStep === 2 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Confirma tu Pedido
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  📦{" "}
                  <strong>
                    Tu pedido será procesado inmediatamente después del pago.
                  </strong>
                  <br />
                  Recibirás una confirmación por correo electrónico.
                </Typography>
              </Alert>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Detalles del Pago:
                </Typography>
                <Typography>
                  <strong>Método:</strong> {paymentInfo.name}
                </Typography>
                <Typography>
                  <strong>Remitente:</strong> {paymentDetails.senderName}
                </Typography>
                {paymentDetails.senderPhone && (
                  <Typography>
                    <strong>Teléfono:</strong> {paymentDetails.senderPhone}
                  </Typography>
                )}
                {paymentDetails.reference && (
                  <Typography>
                    <strong>Referencia:</strong> {paymentDetails.reference}
                  </Typography>
                )}
                <Typography>
                  <strong>Total:</strong> ${getCartTotal().toFixed(2)} USD
                </Typography>
                {exchangeInfo?.amountBS && (
                  <Typography>
                    <strong>Equivalente:</strong>{" "}
                    {exchangeInfo.amountBS.toFixed(2)} BS
                  </Typography>
                )}
              </Box>

              <Box sx={{ p: 2, bgcolor: "success.light", borderRadius: 1 }}>
                <Typography variant="body2" color="success.dark">
                  ✅ <strong>¡Último paso!</strong> Confirma tu pedido y procede
                  con el pago según las instrucciones.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Confirmación Final
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSubmitOrder}
                disabled={loading}
                startIcon={<Check />}
                sx={{ mb: 2 }}
              >
                {loading ? "Procesando..." : "Confirmar y Pagar"}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setActiveStep(1)}
              >
                Volver Atrás
              </Button>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Al confirmar, aceptas nuestros términos y condiciones.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CheckoutPage;
