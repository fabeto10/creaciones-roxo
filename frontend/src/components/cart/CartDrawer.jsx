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

  const canProceedToCheckout = cartItems.every(
    (item) => item.product.stock >= item.quantity && item.product.stock > 0
  );

  const cartPriceInfo = calculateCartPriceInfo();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    // Validar stock antes de ir al checkout
    const stockIssues = cartItems.filter(
      (item) => item.product.stock < item.quantity || item.product.stock <= 0
    );

    if (stockIssues.length > 0) {
      alert(
        "⚠️ Algunos productos en tu carrito tienen problemas de stock. Serán removidos automáticamente."
      );
      // Remover productos con problemas de stock
      setCartItems((prev) =>
        prev.filter(
          (item) =>
            item.product.stock >= item.quantity && item.product.stock > 0
        )
      );
      return;
    }

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
          width: { xs: "100vw", sm: 420, md: 450 },
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {/* Header compacto */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <ShoppingCart sx={{ color: "primary.main", fontSize: 24 }} />
          <Typography variant="h6" component="h2" fontWeight="bold">
            Carrito
          </Typography>
          <Badge
            badgeContent={cartItems.length}
            color="primary"
            sx={{ ml: 1 }}
          />
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {/* Botón ver carrito completo - COMPACTO */}
          {cartItems.length > 0 && (
            <IconButton
              size="small"
              onClick={handleViewCartPage}
              title="Ver carrito completo"
              sx={{
                border: "1px solid",
                borderColor: "primary.main",
                width: 32,
                height: 32,
              }}
            >
              <Visibility sx={{ fontSize: 18 }} />
            </IconButton>
          )}

          <IconButton onClick={() => setIsCartOpen(false)} size="small">
            <Close />
          </IconButton>
        </Box>
      </Box>

      {cartItems.length === 0 ? (
        <Box
          textAlign="center"
          py={4}
          flexGrow={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <ShoppingBag
            sx={{ fontSize: 60, color: "text.secondary", mb: 2, opacity: 0.5 }}
          />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Carrito vacío
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            ¡Agrega algunos productos!
          </Typography>
          <Button
            variant="contained"
            onClick={() => setIsCartOpen(false)}
            size="small"
          >
            Seguir Comprando
          </Button>
        </Box>
      ) : (
        <>
          {/* Contenedor principal con scroll */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Lista de productos - MEJORADA con altura flexible */}
            <Box
              sx={{
                flexGrow: 1,
                overflow: "auto",
                px: 2,
                py: 1,
              }}
            >
              <List sx={{ py: 0 }}>
                {cartItems.map((item) => {
                  const isOutOfStock = item.product.stock <= 0;
                  const hasInsufficientStock =
                    item.quantity > item.product.stock;

                  return (
                    <ListItem
                      key={item.id}
                      divider
                      sx={{
                        py: 1.5,
                        px: 0,
                        flexDirection: "column",
                        alignItems: "flex-start",
                        backgroundColor: isOutOfStock
                          ? "rgba(255,0,0,0.05)"
                          : "transparent",
                      }}
                    >
                      {/* Indicador de problema de stock */}
                      {(isOutOfStock || hasInsufficientStock) && (
                        <Chip
                          label={
                            isOutOfStock
                              ? "AGOTADO"
                              : `Stock: ${item.product.stock}`
                          }
                          color="error"
                          size="small"
                          sx={{ mb: 1, fontSize: "0.6rem" }}
                        />
                      )}
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          gap: 1.5,
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Imagen más compacta */}
                        <Box sx={{ minWidth: 60, flexShrink: 0 }}>
                          <ImageWithFallback
                            src={item.image}
                            alt={item.product.name}
                            fallbackSrc="/images/placeholder-bracelet.jpg"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        </Box>

                        {/* Información compacta */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            sx={{
                              wordBreak: "break-word",
                              lineHeight: 1.2,
                              mb: 0.5,
                              fontSize: "0.875rem",
                            }}
                          >
                            {item.product.name}
                          </Typography>

                          {/* Personalización más compacta */}
                          {item.customization && (
                            <Box sx={{ mb: 1 }}>
                              <Chip
                                label="Personalizado"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  mb: 0.5,
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{
                                  display: "block",
                                  lineHeight: 1.1,
                                }}
                              >
                                {item.customization.material},{" "}
                                {item.customization.color}
                                {item.customization.charm &&
                                  `, ${item.customization.charm}`}
                              </Typography>
                            </Box>
                          )}

                          {/* Precios compactos */}
                          <Box sx={{ mb: 1 }}>
                            <Typography
                              variant="body2"
                              color="success.main"
                              fontWeight="bold"
                            >
                              ${item.price?.toFixed(2)} USD
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.priceInfo?.priceBS?.toFixed(2) || "0.00"} BS
                            </Typography>
                          </Box>

                          {/* Controles de cantidad más compactos */}
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                                sx={{
                                  width: 26,
                                  height: 26,
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                <Remove sx={{ fontSize: 14 }} />
                              </IconButton>
                              <Typography
                                sx={{
                                  mx: 1,
                                  minWidth: 20,
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                sx={{
                                  width: 26,
                                  height: 26,
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                <Add sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>

                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                color="primary"
                              >
                                ${(item.price * item.quantity).toFixed(2)}
                              </Typography>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeFromCart(item.id)}
                                sx={{ ml: 0.5 }}
                              >
                                <Delete sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </Box>

            {/* Resumen del pedido - FIJADO EN LA PARTE INFERIOR */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 2,
                mx: 2,
                mb: 2,
                flexShrink: 0,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Resumen
              </Typography>

              {/* Ahorro destacado más compacto */}
              <Box
                sx={{
                  bgcolor: "success.light",
                  p: 1,
                  borderRadius: 1,
                  mb: 1.5,
                  border: "1px solid",
                  borderColor: "success.main",
                }}
              >
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <Savings color="success" sx={{ fontSize: 16 }} />
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="success.dark"
                  >
                    Ahorras ${cartPriceInfo.discount.amountUSD.toFixed(2)} USD
                  </Typography>
                </Box>
                <Typography variant="caption" color="success.dark">
                  Pagando en USD ({cartPriceInfo.discount.percentage}% desc.)
                </Typography>
              </Box>

              {/* Desglose de precios compacto */}
              <Box sx={{ "& > *": { mb: 0.5 } }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
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
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="success.main"
                    >
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

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" fontWeight="bold">
                    Total:
                  </Typography>
                  <Box textAlign="right">
                    <Typography
                      variant="h6"
                      color="success.main"
                      fontWeight="bold"
                    >
                      ${cartPriceInfo.discountedPriceUSD.toFixed(2)} USD
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {cartPriceInfo.priceBS.toFixed(2)} BS
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Botones de acción compactos */}
              <Box
                sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  onClick={handleCheckout}
                  disabled={!canProceedToCheckout || cartItems.length === 0}
                  sx={{
                    py: 0.75,
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  {canProceedToCheckout ? "Proceder al Pago" : "Revisar Stock"}
                </Button>

                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleContinueShopping}
                    sx={{ flex: 1, fontSize: "0.75rem" }}
                  >
                    Seguir Comprando
                  </Button>

                  <Button
                    color="error"
                    size="small"
                    onClick={clearCart}
                    sx={{ fontSize: "0.75rem" }}
                  >
                    Vaciar
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;
