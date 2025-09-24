import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge
} from '@mui/material';
import { ShoppingCart, AccountCircle, Login, Logout, AdminPanelSettings } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import CartDrawer from '../cart/CartDrawer';

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link}
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold',
              fontSize: '1.3rem'
            }}
          >
            🎀 ROXO | Bisutería
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Hola, {user?.firstName}
                </Typography>
                
                {isAdmin && (
                  <Button 
                    color="inherit" 
                    startIcon={<AdminPanelSettings />}
                    onClick={() => navigate('/admin')}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  >
                    Panel Admin
                  </Button>
                )}
                
                <IconButton color="inherit" onClick={() => setIsCartOpen(true)}>
                  <Badge badgeContent={cartCount} color="secondary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
                
                <IconButton color="inherit" onClick={handleLogout}>
                  <Logout />
                </IconButton>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  startIcon={<Login />}
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  color="inherit" 
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  Registrarse
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <CartDrawer />
    </>
  );
};

export default Header;