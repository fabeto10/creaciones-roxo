import React from "react";
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
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const cartPriceInfo = calculateCartPriceInfo();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: "/checkout", message: "Necesitas iniciar sesión para realizar el pago" }
      });
      return;
    }
    navigate("/checkout");
  };

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
            {cartItems.map((item) => (
              <Card key={item.id} sx={{ mb: 2, borderRadius: 2 }}>
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
                      </Box>
                    </Grid>

                    {/* Información del producto */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" gutterBottom sx={{ wordBreak: "break-word" }}>
                        {item.product.name}
                      </Typography>
                      
                      {item.customization && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Personalización:</strong> {item.customization.material}, {item.customization.color}
                            {item.customization.charm && `, Dije: ${item.customization.charm}`}
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        ${item.price?.toFixed(2)} USD c/u
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.priceInfo?.priceBS?.toFixed(2) || "0.00"} BS c/u
                      </Typography>
                    </Grid>

                    {/* Controles de cantidad y precio */}
                    <Grid item xs={12} sm={3}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Box display="flex" alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Remove />
                          </IconButton>
                          <Typography sx={{ mx: 2, minWidth: 30, textAlign: "center" }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
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
                        <Typography variant="h6" color="primary">
                          ${(item.price * item.quantity).toFixed(2)} USD
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {(item.priceInfo.priceBS * item.quantity).toFixed(2)} BS
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>

          {/* Resumen del pedido */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={2} sx={{ p: 3, position: "sticky", top: 100 }}>
              <Typography variant="h6" gutterBottom>
                Resumen del Pedido
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Precio original:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>
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
                      Ahorras ${cartPriceInfo.discount.amountUSD.toFixed(2)} USD pagando en USD
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

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Total:</Typography>
                  <Box textAlign="right">
                    <Typography variant="h5" color="success.main" fontWeight="bold">
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
                sx={{ mb: 1 }}
              >
                Proceder al Pago
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={clearCart}
                color="error"
              >
                Vaciar Carrito
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CartPage;