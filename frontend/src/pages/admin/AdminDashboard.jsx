import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory2,
  People,
  Payment,
  DesignServices,
  Add,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: "Gestión de Productos",
      description: "Administra dijes, materiales y colores",
      icon: <Inventory2 sx={{ fontSize: 40 }} />,
      path: "/admin/products",
      color: "#e91e63",
    },
    {
      title: "Diseños Realizados",
      description: "Gestiona los diseños creados",
      icon: <DesignServices sx={{ fontSize: 40 }} />,
      path: "/admin/designs",
      color: "#9c27b0",
    },
    {
      title: "Gestión de Clientes",
      description: "Administra usuarios y clientes",
      icon: <People sx={{ fontSize: 40 }} />,
      path: "/admin/customers",
      color: "#2196f3",
    },
    {
      title: "Gestión de Pagos",
      description: "Administra transacciones y pagos",
      icon: <Payment sx={{ fontSize: 40 }} />,
      path: "/admin/payments",
      color: "#4caf50",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              className="roxo-text-gradient"
            >
              <DashboardIcon sx={{ mr: 2, verticalAlign: "bottom" }} />
              Panel de Administración
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Bienvenido al centro de control de Creaciones Roxo
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />}>
            Nuevo Producto
          </Button>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={4}>
        {adminCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={3}
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
                borderRadius: 3,
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ color: card.color, mb: 2 }}>{card.icon}</Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 4, mt: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          Acciones Rápidas
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item>
            <Button variant="outlined" startIcon={<Add />}>
              Agregar Dije
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" startIcon={<Add />}>
              Agregar Material
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" startIcon={<Add />}>
              Agregar Color
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" startIcon={<Add />}>
              Agregar Diseño
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
