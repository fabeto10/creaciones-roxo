import React from 'react';
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
  Tooltip
} from '@mui/material';
import { Close, Add, Remove, Delete, ShoppingCart, Savings } from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, calculateCartPriceInfo, clearCart } = useCart();
  const navigate = useNavigate();

  const cartPriceInfo = calculateCartPriceInfo();

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
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
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          p: 2
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          <ShoppingCart sx={{ mr: 1, verticalAlign: 'bottom' }} />
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
          <List sx={{ flexGrow: 1, overflow: 'auto' }}>
            {cartItems.map((item) => (
              <ListItem key={item.id} divider sx={{ py: 2 }}>
                <Box sx={{ width: '100%' }}>
                  <Box display="flex" alignItems="flex-start" mb={1}>
                    <Box sx={{ mr: 2, minWidth: 60 }}>
                      <img 
                        src={item.image} 
                        alt={item.product.name}
                        style={{ 
                          width: 60, 
                          height: 60, 
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="div">
                            {item.product.name}
                          </Typography>
                        }
                        secondary={
                          <Box component="div">
                            <Typography variant="body2" component="span">
                              {item.priceInfo.priceBS.toFixed(2)} BS
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span" color="success.main">
                              ${item.price.toFixed(2)} USD c/u
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                    
                    <ListItemSecondaryAction>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
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
            {/* PRECIO TOTAL EN BS */}
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {cartPriceInfo.priceBS.toFixed(2)} BS
              </Typography>
            </Box>

            {/* DESCUENTO POR PAGO EN USD */}
            <Box sx={{ 
              bgcolor: 'success.light', 
              p: 1, 
              borderRadius: 1, 
              mb: 2,
              border: '1px solid',
              borderColor: 'success.main'
            }}>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <Savings color="success" fontSize="small" />
                <Typography variant="subtitle2" color="success.dark" fontWeight="bold">
                  Paga en USD y ahorra {cartPriceInfo.savings.percentage}%
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" color="success.dark" fontWeight="bold">
                  ${cartPriceInfo.priceUSD.toFixed(2)} USD
                </Typography>
                <Chip 
                  label={`Ahorras ${cartPriceInfo.savings.amount.toFixed(2)} BS`}
                  size="small"
                  color="success"
                  variant="filled"
                />
              </Box>
              
              <Typography variant="caption" color="success.dark" display="block">
                Precio regular: {cartPriceInfo.savings.priceBSParallel.toFixed(2)} BS
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
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Total a pagar:</Typography>
              <Box textAlign="right">
                <Typography variant="h6" color="primary">
                  {cartPriceInfo.priceBS.toFixed(2)} BS
                </Typography>
                <Typography variant="body2" color="success.main">
                  (${cartPriceInfo.priceUSD.toFixed(2)} USD)
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