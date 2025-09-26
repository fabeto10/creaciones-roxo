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
  Alert,
  Stepper,
  Step,
  StepLabel,
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
import ImageWithFallback from "../../components/common/ImageWithFallback";

const CheckoutPage = () => {
  const {
    cartItems,
    getCartTotalUSD,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateCartPriceInfo,
    calculateDiscountPercentage,
  } = useCart();

  const cartPriceInfo = calculateCartPriceInfo();
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
      return;
    }

    // ✅ VALIDAR STOCK AL CARGAR LA PÁGINA
    const stockErrors = cartItems.filter(
      (item) => item.product.stock < item.quantity
    );
    if (stockErrors.length > 0) {
      const errorMessage = `Algunos productos no tienen suficiente stock:\n${stockErrors
        .map(
          (error) =>
            `- ${error.product.name}: Solicitados ${error.quantity}, Disponibles ${error.product.stock}`
        )
        .join("\n")}`;

      alert(errorMessage);
      navigate("/cart");
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
            amountUSD: getCartTotalUSD(),
            method: paymentMethod,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error calculando tasa de cambio");
      }

      const data = await response.json();
      setExchangeInfo(data);
    } catch (error) {
      console.error("❌ Error calculating exchange:", error);
      setError("Error al calcular la tasa de cambio: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentMethod) {
      calculateExchange();
    }
  }, [paymentMethod, getCartTotalUSD()]);

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
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen");
        return;
      }

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
    // ✅ VALIDAR STOCK ANTES DE ENVIAR
    const stockErrors = cartItems.filter(
      (item) => item.product.stock < item.quantity
    );
    if (stockErrors.length > 0) {
      const errorMessage = `No se puede procesar el pedido. Stock insuficiente:\n${stockErrors
        .map(
          (error) =>
            `- ${error.product.name}: Solicitados ${error.quantity}, Disponibles ${error.product.stock}`
        )
        .join("\n")}`;

      setError(errorMessage);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Validaciones básicas
      if (!paymentDetails.senderName) {
        throw new Error("El nombre del remitente es requerido");
      }

      if (paymentMethod === "PAGO_MOVIL" && !paymentDetails.reference) {
        throw new Error("La referencia de pago móvil es requerida");
      }

      // Crear items con información completa del producto
      const itemsWithProductInfo = cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productDescription: item.product.description,
        productImages: item.product.images || [],
        productType: item.product.type,
        price: item.price,
        quantity: item.quantity,
        customization: item.customization,
        basePrice: item.product.basePrice,
      }));

      console.log("📦 Items con información completa:", itemsWithProductInfo);

      // Crear FormData para la transacción
      const formData = new FormData();
      formData.append("items", JSON.stringify(itemsWithProductInfo));
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
        },
        body: formData,
      });

      // ✅ VERIFICACIÓN MÁS ROBUSTA DE LA RESPUESTA
      const result = await response.json();
      console.log(
        "🔍 ESTRUCTURA COMPLETA DE LA RESPUESTA:",
        JSON.stringify(result, null, 2)
      );

      if (!response.ok) {
        console.error("❌ Error del servidor:", response.status, result);
        throw new Error(
          result.message || `Error del servidor: ${response.status}`
        );
      }

      // ✅ VERIFICAR ESTRUCTURA DE LA RESPUESTA
      if (!result || !result.transaction) {
        console.error("❌ Respuesta inesperada:", result);
        throw new Error("La respuesta del servidor no es válida");
      }

      // ✅ OBTENER EL ID CORRECTAMENTE
      const transactionId = result.transaction.id;

      if (!transactionId) {
        throw new Error("No se pudo obtener el ID de la transacción");
      }

      console.log("✅ ID de transacción encontrado:", transactionId);
      console.log("🎯 Redirigiendo a orden:", transactionId);

      // ✅ LIMPIAR CARRITO Y REDIRIGIR
      clearCart();

      // ✅ AGREGAR TIMEOUT PARA ASEGURAR LA NAVEGACIÓN
      setTimeout(() => {
        navigate(`/order-confirmation/${transactionId}`);
      }, 100);
    } catch (error) {
      console.error("❌ Error submitting order:", error);
      setError(error.message || "Error al procesar la orden");
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

  // Calcular precio final según método de pago
  const getFinalPrice = () => {
    const totalUSD = getCartTotalUSD();

    if (["ZELLE", "CRYPTO", "ZINLI", "CASH_USD"].includes(paymentMethod)) {
      const discountPercentage = calculateDiscountPercentage();
      return totalUSD * (1 - discountPercentage / 100);
    }

    return totalUSD;
  };

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
        component="div"
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
                      <Box sx={{ width: 60, height: 60, position: "relative" }}>
                        <ImageWithFallback
                          src={item.image}
                          alt={item.product.name}
                          fallbackSrc="/images/placeholder-bracelet.jpg"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.product.name}
                      secondary={
                        <Box component="div">
                          <Typography
                            variant="body2"
                            component="span"
                            display="block"
                          >
                            Precio: ${item.price} x {item.quantity} = $
                            {(item.price * item.quantity).toFixed(2)}
                          </Typography>
                          {item.customization && (
                            <Typography
                              variant="body2"
                              component="span"
                              display="block"
                              color="textSecondary"
                            >
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

              <Box sx={{ mb: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Total Original:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ${cartPriceInfo?.originalPriceUSD?.toFixed(2) || "0.00"} USD
                  </Typography>
                </Box>

                <Typography variant="body2" color="textSecondary">
                  💰 Equivale a {cartPriceInfo?.priceBS?.toFixed(2) || "0.00"}{" "}
                  BS (tasa oficial)
                </Typography>

                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  📊 Tasa oficial:{" "}
                  {cartPriceInfo?.rates?.official?.toFixed(2) || "0.00"} BS/USD
                </Typography>
                <Typography variant="caption" display="block">
                  💸 Tasa paralela:{" "}
                  {cartPriceInfo?.rates?.parallel?.toFixed(2) || "0.00"} BS/USD
                </Typography>
              </Box>

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
      {/* Los pasos 2 y 3 continúan... */}
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

                  {/* Para métodos USD */}
                  {["ZELLE", "CRYPTO", "ZINLI", "CASH_USD"].includes(
                    paymentMethod
                  ) &&
                    exchangeInfo.savings && (
                      <Box>
                        <Typography variant="body2">
                          <strong>Precio regular (BS paralelo):</strong>{" "}
                          {exchangeInfo.savings.amountBSParallel.toFixed(2)} BS
                        </Typography>
                        <Typography variant="body2">
                          <strong>Tu precio en USD:</strong> $
                          {getFinalPrice().toFixed(2)} USD
                        </Typography>
                        <Typography variant="body2">
                          <strong>Equivalente en BS (oficial):</strong>{" "}
                          {exchangeInfo.savings.amountBSOfficial.toFixed(2)} BS
                        </Typography>
                        <Typography
                          variant="h6"
                          color="success.main"
                          sx={{ mt: 1 }}
                        >
                          ✅ Ahorras {exchangeInfo.savings.savingsPercentage}%
                        </Typography>
                      </Box>
                    )}

                  {/* Para métodos BS */}
                  {(paymentMethod === "PAGO_MOVIL" ||
                    paymentMethod === "CASH_BS") &&
                    exchangeInfo.amountBS && (
                      <Box>
                        <Typography variant="body2">
                          <strong>Total a pagar:</strong>{" "}
                          {exchangeInfo.amountBS.toFixed(2)} BS
                        </Typography>
                        <Typography variant="body2">
                          <strong>Tasa oficial:</strong> {exchangeInfo.rate}{" "}
                          BS/USD
                        </Typography>
                      </Box>
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
                  Total: ${getFinalPrice().toFixed(2)} USD
                </Typography>

                {exchangeInfo?.amountBS && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Equivale a: {exchangeInfo.amountBS.toFixed(2)} BS
                  </Typography>
                )}

                {exchangeInfo?.savings && (
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    ✅ Ahorras {exchangeInfo.savings.savingsPercentage}% vs tasa
                    paralela
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
                <Typography variant="subtitle1" gutterBottom component="div">
                  Detalles del Pago:
                </Typography>
                <Box component="div">
                  <Typography variant="body2" component="p">
                    <strong>Método:</strong> {paymentInfo.name}
                  </Typography>
                  <Typography variant="body2" component="p">
                    <strong>Remitente:</strong> {paymentDetails.senderName}
                  </Typography>
                  {paymentDetails.senderPhone && (
                    <Typography variant="body2" component="p">
                      <strong>Teléfono:</strong> {paymentDetails.senderPhone}
                    </Typography>
                  )}
                  {paymentDetails.reference && (
                    <Typography variant="body2" component="p">
                      <strong>Referencia:</strong> {paymentDetails.reference}
                    </Typography>
                  )}
                  <Typography variant="body2" component="p">
                    <strong>Total Original:</strong> $
                    {getCartTotalUSD().toFixed(2)} USD
                  </Typography>
                  <Typography variant="body2" component="p">
                    <strong>Total a Pagar:</strong> $
                    {getFinalPrice().toFixed(2)} USD
                  </Typography>
                  {exchangeInfo?.amountBS && (
                    <Typography variant="body2" component="p">
                      <strong>Equivalente en BS:</strong>{" "}
                      {exchangeInfo.amountBS.toFixed(2)} BS
                    </Typography>
                  )}
                  {exchangeInfo?.savings && (
                    <Typography
                      variant="body2"
                      component="p"
                      color="success.main"
                    >
                      ✅ Ahorras {exchangeInfo.savings.savingsPercentage}% ($
                      {(getCartTotalUSD() - getFinalPrice()).toFixed(2)} USD)
                    </Typography>
                  )}
                </Box>
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
