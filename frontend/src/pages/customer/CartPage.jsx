import React, { useEffect } from "react"; // ← AGREGAR useEffect
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Savings,
  NavigateBefore,
  ShoppingBag,
} from "@mui/icons-material";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ImageWithFallback from "../../components/common/ImageWithFallback";

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    calculateCartPriceInfo,
    clearCart,
    syncCartWithServerStock, // ← AGREGAR esta función
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const cartPriceInfo = calculateCartPriceInfo();

  // ✅ EFECTO PARA SINCRONIZAR Y ELIMINAR PRODUCTOS AGOTADOS
  useEffect(() => {
    // Sincronizar con el servidor al cargar la página
    if (syncCartWithServerStock) {
      syncCartWithServerStock();
    }

    // Eliminar productos agotados automáticamente
    const outOfStockItems = cartItems.filter((item) => item.product.stock <= 0);
    if (outOfStockItems.length > 0) {
      outOfStockItems.forEach((item) => {
        removeFromCart(item.id);
      });
      
      if (outOfStockItems.length > 0) {
        alert(
          `Se removieron ${outOfStockItems.length} productos agotados del carrito`
        );
      }
    }
  }, [cartItems, removeFromCart, syncCartWithServerStock]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  // ✅ FUNCIÓN CORREGIDA: Obtener estado del item
  const getItemStatus = (item) => {
    if (item.product.stock <= 0) {
      return { status: "out-of-stock", message: "AGOTADO - Será removido automáticamente" };
    }
    if (item.quantity > item.product.stock) {
      return {
        status: "insufficient",
        message: `Stock insuficiente - Máximo disponible: ${item.product.stock}`,
      };
    }
    return { status: "available", message: "Disponible" };
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/checkout",
          message: "Necesitas iniciar sesión para realizar el pago",
        },
      });
      return;
    }

    // Validar stock final
    const stockIssues = cartItems.filter(
      (item) => item.product.stock < item.quantity || item.product.stock <= 0
    );

    if (stockIssues.length > 0) {
      alert(
        "Algunos productos en tu carrito tienen problemas de stock. Por favor revisa antes de proceder al pago."
      );
      return;
    }

    navigate("/checkout");
  };

  // ✅ FUNCIÓN ELIMINADA: getStockStatus es redundante, usar getItemStatus

  const canProceedToCheckout = cartItems.every(
    (item) => item.product.stock >= item.quantity && item.product.stock > 0
  );

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
          <ShoppingCart sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Tu carrito está vacío
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            ¡Descubre nuestros productos y agrega algunos a tu carrito!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/tienda")}
            startIcon={<ShoppingBag />}
          >
            Ir a la Tienda
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <ShoppingCart sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">
              Tu Carrito de Compras
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Revisa y gestiona los productos en tu carrito
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          onClick={() => navigate("/tienda")}
          sx={{ mb: 3 }}
        >
          Seguir Comprando
        </Button>

        <Grid container spacing={4}>
          {/* Lista de productos */}
          <Grid item xs={12} lg={8}>
            {cartItems.map((item) => {
              const itemStatus = getItemStatus(item); // ← CORREGIDO: usar itemStatus

              return (
                <Card
                  key={item.id}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    border:
                      itemStatus.status !== "available"
                        ? "2px solid #ff4444"
                        : "none",
                  }}
                >
                  {/* ✅ MOSTRAR ALERTA SOLO SI HAY PROBLEMAS */}
                  {itemStatus.status !== "available" && (
                    <Alert 
                      severity={
                        itemStatus.status === "out-of-stock" ? "error" : "warning"
                      } 
                      sx={{ mb: 2 }}
                    >
                      {itemStatus.message}
                    </Alert>
                  )}
                  
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Imagen del producto */}
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ position: "relative" }}>
                          <ImageWithFallback
                            src={item.image}
                            alt={item.product.name}
                            fallbackSrc="/images/placeholder-bracelet.jpg"
                            style={{
                              width: "100%",
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                          {item.customization && (
                            <Chip
                              label="Personalizado"
                              size="small"
                              color="primary"
                              sx={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                              }}
                            />
                          )}
                          
                          {/* ✅ CHIP DE ESTADO EN LA IMAGEN */}
                          {itemStatus.status !== "available" && (
                            <Chip
                              label={
                                itemStatus.status === "out-of-stock" 
                                  ? "AGOTADO" 
                                  : "STOCK INSUFICIENTE"
                              }
                              size="small"
                              color={
                                itemStatus.status === "out-of-stock" 
                                  ? "error" 
                                  : "warning"
                              }
                              sx={{
                                position: "absolute",
                                bottom: 8,
                                left: 8,
                                fontSize: "0.6rem",
                              }}
                            />
                          )}
                        </Box>
                      </Grid>

                      {/* Información del producto */}
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ wordBreak: "break-word" }}
                        >
                          {item.product.name}
                        </Typography>

                        {item.customization && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Personalización:</strong>{" "}
                              {item.customization.material},{" "}
                              {item.customization.color}
                              {item.customization.charm &&
                                `, Dije: ${item.customization.charm}`}
                            </Typography>
                          </Box>
                        )}

                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight="bold"
                        >
                          ${item.price?.toFixed(2)} USD c/u
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {item.priceInfo?.priceBS?.toFixed(2) || "0.00"} BS c/u
                        </Typography>
                        
                        {/* ✅ INFO DE STOCK ACTUALIZADA */}
                        <Typography 
                          variant="caption" 
                          color={
                            itemStatus.status === "out-of-stock" 
                              ? "error" 
                              : itemStatus.status === "insufficient" 
                                ? "warning" 
                                : "success"
                          }
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          📦 Stock actual: {item.product.stock} unidades
                          {itemStatus.status === "insufficient" && 
                            ` (Solicitadas: ${item.quantity})`
                          }
                        </Typography>
                      </Grid>

                      {/* Controles de cantidad y precio */}
                      <Grid item xs={12} sm={3}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={1}
                        >
                          <Box display="flex" alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || itemStatus.status === "out-of-stock"}
                            >
                              <Remove />
                            </IconButton>
                            <Typography
                              sx={{ 
                                mx: 2, 
                                minWidth: 30, 
                                textAlign: "center",
                                color: itemStatus.status !== "available" ? "text.disabled" : "text.primary"
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              disabled={itemStatus.status !== "available"}
                            >
                              <Add />
                            </IconButton>
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>

                        <Box textAlign="right">
                          <Typography 
                            variant="h6" 
                            color={
                              itemStatus.status !== "available" 
                                ? "text.disabled" 
                                : "primary"
                            }
                          >
                            ${(item.price * item.quantity).toFixed(2)} USD
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color={
                              itemStatus.status !== "available" 
                                ? "text.disabled" 
                                : "textSecondary"
                            }
                          >
                            {(item.priceInfo?.priceBS * item.quantity).toFixed(2) || "0.00"} BS
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Grid>

          {/* Resumen del pedido */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={2} sx={{ p: 3, position: "sticky", top: 100 }}>
              <Typography variant="h6" gutterBottom>
                Resumen del Pedido
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* ✅ ALERTA DE ESTADO DEL CARRITO */}
              {!canProceedToCheckout && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Algunos productos tienen problemas de stock. Revisa tu carrito antes de proceder al pago.
                </Alert>
              )}

              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Precio original:
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through" }}
                  >
                    ${cartPriceInfo.originalPriceUSD.toFixed(2)} USD
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    Descuento ({cartPriceInfo.discount.percentage}%):
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    -${cartPriceInfo.discount.amountUSD.toFixed(2)} USD
                  </Typography>
                </Box>

                <Alert severity="success" sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Savings />
                    <Typography variant="body2" fontWeight="bold">
                      Ahorras ${cartPriceInfo.discount.amountUSD.toFixed(2)} USD
                      pagando en USD
                    </Typography>
                  </Box>
                </Alert>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">
                    ${cartPriceInfo.discountedPriceUSD.toFixed(2)} USD
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Envío:</Typography>
                  <Typography variant="body2" color="success.main">
                    Gratis
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">Total:</Typography>
                  <Box textAlign="right">
                    <Typography
                      variant="h5"
                      color="success.main"
                      fontWeight="bold"
                    >
                      ${cartPriceInfo.discountedPriceUSD.toFixed(2)} USD
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      o {cartPriceInfo.priceBS.toFixed(2)} BS
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                disabled={!canProceedToCheckout || cartItems.length === 0}
                sx={{ mb: 1 }}
              >
                {canProceedToCheckout
                  ? "Proceder al Pago"
                  : "Revisar Stock del Carrito"}
              </Button>

              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/tienda")}
                >
                  Seguir Comprando
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={clearCart}
                  color="error"
                >
                  Vaciar
                </Button>
              </Box>

              {/* ✅ INFORMACIÓN ADICIONAL */}
              <Box sx={{ mt: 2, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  💡 <strong>Nota:</strong> Los productos agotados se eliminan automáticamente del carrito.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CartPage;