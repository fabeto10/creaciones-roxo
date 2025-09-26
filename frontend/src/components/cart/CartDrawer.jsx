import React from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  Divider,
  Chip,
  Paper,
  Badge,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Savings,
  Visibility,
  ShoppingBag,
} from "@mui/icons-material";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import ImageWithFallback from "../common/ImageWithFallback";

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    calculateCartPriceInfo,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const cartPriceInfo = calculateCartPriceInfo();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
  };

  const handleViewCartPage = () => {
    setIsCartOpen(false);
    navigate("/cart");
  };

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 420 },
          p: 2,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <ShoppingCart sx={{ color: "primary.main" }} />
          <Typography variant="h6" component="h2" fontWeight="bold">
            Tu Carrito
          </Typography>
          <Badge 
            badgeContent={cartItems.length} 
            color="primary" 
            sx={{ ml: 1 }}
          />
        </Box>
        <IconButton 
          onClick={() => setIsCartOpen(false)}
          size="small"
        >
          <Close />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {cartItems.length === 0 ? (
        <Box textAlign="center" py={4} flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
          <ShoppingBag sx={{ fontSize: 60, color: "text.secondary", mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Tu carrito está vacío
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            ¡Agrega algunos productos!
          </Typography>
          <Button
            variant="contained"
            onClick={() => setIsCartOpen(false)}
          >
            Seguir Comprando
          </Button>
        </Box>
      ) : (
        <>
          {/* Botón para ver carrito detallado */}
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={handleViewCartPage}
              sx={{ fontSize: "0.75rem" }}
            >
              Ver carrito completo
            </Button>
          </Box>

          {/* Lista de productos - MEJORADA */}
          <Box sx={{ flexGrow: 1, overflow: "auto", mb: 2 }}>
            <List sx={{ py: 0 }}>
              {cartItems.map((item) => (
                <ListItem 
                  key={item.id} 
                  divider 
                  sx={{ 
                    py: 1.5,
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
                    {/* Imagen */}
                    <Box sx={{ minWidth: 70 }}>
                      <ImageWithFallback
                        src={item.image}
                        alt={item.product.name}
                        fallbackSrc="/images/placeholder-bracelet.jpg"
                        style={{
                          width: 70,
                          height: 70,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </Box>

                    {/* Información */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ 
                          wordBreak: "break-word",
                          lineHeight: 1.2,
                          mb: 0.5
                        }}
                      >
                        {item.product.name}
                      </Typography>

                      {/* Personalización */}
                      {item.customization && (
                        <Box sx={{ mb: 1 }}>
                          <Chip
                            label="Personalizado"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                          <Typography 
                            variant="caption" 
                            color="textSecondary"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {item.customization.material}, {item.customization.color}
                            {item.customization.charm && `, ${item.customization.charm}`}
                          </Typography>
                        </Box>
                      )}

                      {/* Precios */}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          ${item.price?.toFixed(2)} USD
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.priceInfo?.priceBS?.toFixed(2) || "0.00"} BS
                        </Typography>
                      </Box>

                      {/* Controles de cantidad */}
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            sx={{ 
                              width: 28, 
                              height: 28,
                              border: "1px solid #e0e0e0"
                            }}
                          >
                            <Remove sx={{ fontSize: 16 }} />
                          </IconButton>
                          <Typography 
                            sx={{ 
                              mx: 1.5, 
                              minWidth: 20, 
                              textAlign: "center",
                              fontWeight: "bold"
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            sx={{ 
                              width: 28, 
                              height: 28,
                              border: "1px solid #e0e0e0"
                            }}
                          >
                            <Add sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>

                        <Box textAlign="right">
                          <Typography variant="subtitle2" fontWeight="bold" color="primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeFromCart(item.id)}
                            sx={{ ml: 1 }}
                          >
                            <Delete sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Resumen del pedido - MEJORADO */}
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Resumen del Pedido
            </Typography>

            {/* Ahorro destacado */}
            <Box
              sx={{
                bgcolor: "success.light",
                p: 1,
                borderRadius: 1,
                mb: 2,
                border: "1px solid",
                borderColor: "success.main",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Savings color="success" sx={{ fontSize: 18 }} />
                <Typography variant="body2" fontWeight="bold" color="success.dark">
                  Ahorras ${cartPriceInfo.discount.amountUSD.toFixed(2)} USD
                </Typography>
              </Box>
              <Typography variant="caption" color="success.dark">
                Pagando directamente en USD ({cartPriceInfo.discount.percentage}% de descuento)
              </Typography>
            </Box>

            {/* Desglose de precios */}
            <Box sx={{ '& > *': { mb: 1 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Subtotal:
                </Typography>
                <Box textAlign="right">
                  <Typography 
                    variant="body2" 
                    sx={{ textDecoration: "line-through" }}
                    color="text.secondary"
                  >
                    ${cartPriceInfo.originalPriceUSD.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    ${cartPriceInfo.discountedPriceUSD.toFixed(2)} USD
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Envío:</Typography>
                <Typography variant="body2" color="success.main">
                  Gratis
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Total:
                </Typography>
                <Box textAlign="right">
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    ${cartPriceInfo.discountedPriceUSD.toFixed(2)} USD
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {cartPriceInfo.priceBS.toFixed(2)} BS
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Botones de acción */}
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                size="medium"
                onClick={handleCheckout}
                sx={{ 
                  py: 1,
                  fontWeight: "bold"
                }}
              >
                Proceder al Pago
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="medium"
                onClick={handleContinueShopping}
              >
                Seguir Comprando
              </Button>

              <Button
                color="error"
                size="small"
                fullWidth
                onClick={clearCart}
                sx={{ mt: 0.5 }}
              >
                Vaciar Carrito
              </Button>
            </Box>
          </Paper>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;