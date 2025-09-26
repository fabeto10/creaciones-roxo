import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ShoppingCart,
  AccountCircle,
  Login,
  Logout,
  AdminPanelSettings,
  Receipt,
  PersonAdd,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";
import CartDrawer from "../cart/CartDrawer";

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const handleMyOrders = () => {
    navigate("/my-orders");
    handleMenuClose();
  };

  const handleAdminPanel = () => {
    navigate("/admin");
    handleMenuClose();
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "primary.main" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontWeight: "bold",
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
            }}
          >
            🎀 ROXO | Bisutería
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ 
                    display: { xs: "none", sm: "block" }, 
                    mr: 1,
                  }}
                >
                  Hola, {user?.firstName}
                </Typography>
                
                {/* Panel Admin - MEJORADO PARA RESPONSIVE */}
                {isAdmin && (
                  <>
                    {/* Versión desktop - texto completo */}
                    <Button
                      color="inherit"
                      startIcon={<AdminPanelSettings />}
                      onClick={handleAdminPanel}
                      sx={{ 
                        display: { xs: "none", md: "flex" },
                        minWidth: 'auto'
                      }}
                    >
                      Panel Admin
                    </Button>
                    
                    {/* Versión móvil - solo ícono */}
                    <IconButton
                      color="inherit"
                      onClick={handleAdminPanel}
                      sx={{ 
                        display: { xs: "flex", md: "none" },
                      }}
                      title="Panel de Administración"
                    >
                      <AdminPanelSettings />
                    </IconButton>
                  </>
                )}

                {/* Icono del carrito */}
                <IconButton 
                  color="inherit" 
                  onClick={() => setIsCartOpen(true)}
                  title="Ver carrito"
                >
                  <Badge badgeContent={cartCount} color="secondary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                {/* Menú de usuario */}
                <IconButton color="inherit" onClick={handleMenuOpen}>
                  <AccountCircle />
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1,
                      },
                    },
                  }}
                >
                  {isAdmin && (
                    <MenuItem onClick={handleAdminPanel}>
                      <ListItemIcon>
                        <AdminPanelSettings fontSize="small" />
                      </ListItemIcon>
                      Panel Admin
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleMyOrders}>
                    <ListItemIcon>
                      <Receipt fontSize="small" />
                    </ListItemIcon>
                    Mis Órdenes
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  startIcon={<Login />}
                  onClick={() => navigate("/login")}
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  {isMobile ? "Login" : "Iniciar Sesión"}
                </Button>
                <Button
                  color="inherit"
                  variant="outlined"
                  startIcon={<PersonAdd />}
                  onClick={() => navigate("/register")}
                  sx={{ 
                    display: { xs: "none", sm: "flex" },
                    fontSize: { xs: "0.8rem", sm: "0.9rem" }
                  }}
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