import React from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Savings,
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
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
  };

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 400 },
          p: 2,
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" component="h2">
          <ShoppingCart sx={{ mr: 1, verticalAlign: "bottom" }} />
          Tu Carrito
        </Typography>
        <IconButton onClick={() => setIsCartOpen(false)}>
          <Close />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {cartItems.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Tu carrito está vacío
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setIsCartOpen(false)}
          >
            Seguir Comprando
          </Button>
        </Box>
      ) : (
        <>
          <List sx={{ flexGrow: 1, overflow: "auto" }}>
            {cartItems.map((item) => (
              <ListItem key={item.id} divider sx={{ py: 2 }}>
                <Box sx={{ width: "100%" }}>
                  <Box display="flex" alignItems="flex-start" mb={1}>
                    <Box sx={{ mr: 2, minWidth: 60 }}>
                      {/* ✅ IMAGEN CORREGIDA */}
                      <ImageWithFallback
                        src={item.image}
                        alt={item.product.name}
                        fallbackSrc="/images/placeholder-bracelet.jpg"
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      {/* ✅ CORREGIR ANIDACIÓN HTML */}
                      <Typography
                        variant="subtitle1"
                        component="div"
                        gutterBottom
                      >
                        {item.product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="div"
                        color="textSecondary"
                      >
                        {item.priceInfo?.priceBS?.toFixed(2) || "0.00"} BS
                      </Typography>
                      <Typography
                        variant="body2"
                        component="div"
                        color="success.main"
                      >
                        ${item.price?.toFixed(2) || "0.00"} USD c/u
                      </Typography>
                    </Box>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box display="flex" alignItems="center">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                      >
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" color="primary">
                        {(item.priceInfo.priceBS * item.quantity).toFixed(2)} BS
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        (${(item.price * item.quantity).toFixed(2)} USD)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>

          <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
            {/* PRECIO TOTAL ORIGINAL */}
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                Precio total original:
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                ${cartPriceInfo.originalPriceUSD.toFixed(2)} USD
              </Typography>
            </Box>

            {/* DESCUENTO APLICADO */}
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">
                Descuento ({cartPriceInfo.discount.percentage}%):
              </Typography>
              <Typography variant="body2" color="success.main">
                -${cartPriceInfo.discount.amountUSD.toFixed(2)} USD
              </Typography>
            </Box>

            {/* PRECIO FINAL CON DESCUENTO */}
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
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <Savings color="success" fontSize="small" />
                <Typography
                  variant="subtitle2"
                  color="success.dark"
                  fontWeight="bold"
                >
                  Precio final pagando en USD
                </Typography>
              </Box>

              <Typography
                variant="h5"
                color="success.dark"
                textAlign="center"
                fontWeight="bold"
              >
                ${cartPriceInfo.discountedPriceUSD.toFixed(2)} USD
              </Typography>
            </Box>

            {/* PRECIO EN BS (SIN DESCUENTO) */}
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Si pagas en BS:</Typography>
              <Typography variant="body2">
                {cartPriceInfo.priceBS.toFixed(2)} BS
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2" color="textSecondary">
                Envío:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Gratis
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* TOTAL FINAL */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Total a pagar:</Typography>
              <Box textAlign="right">
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  ${cartPriceInfo.discountedPriceUSD.toFixed(2)} USD
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  o {cartPriceInfo.priceBS.toFixed(2)} BS
                </Typography>
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
              onClick={handleContinueShopping}
            >
              Seguir Comprando
            </Button>

            <Button
              color="error"
              size="small"
              fullWidth
              onClick={clearCart}
              sx={{ mt: 1 }}
            >
              Vaciar Carrito
            </Button>
          </Paper>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;
