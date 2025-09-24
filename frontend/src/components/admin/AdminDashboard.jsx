import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory2,
  People,
  Payment,
  DesignServices,
  Add,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Datos de ejemplo para estadísticas
  const stats = [
    { label: 'Productos Activos', value: '12', icon: <Inventory2 />, color: 'primary' },
    { label: 'Pedidos Hoy', value: '5', icon: <Payment />, color: 'success' },
    { label: 'Clientes Registrados', value: '48', icon: <People />, color: 'info' },
    { label: 'Diseños Creados', value: '23', icon: <DesignServices />, color: 'warning' },
  ];

  const recentOrders = [
    { id: 1, customer: 'María González', amount: 45.99, status: 'Completado' },
    { id: 2, customer: 'Carlos Rodríguez', amount: 32.50, status: 'Pendiente' },
    { id: 3, customer: 'Ana Martínez', amount: 67.25, status: 'En proceso' },
  ];

  const adminCards = [
    {
      title: 'Gestión de Productos',
      description: 'Administra dijes, materiales y productos',
      icon: <Inventory2 sx={{ fontSize: 40 }} />,
      path: '/admin/products',
      color: '#e91e63'
    },
    {
      title: 'Diseños Realizados',
      description: 'Gestiona los diseños creados por clientes',
      icon: <DesignServices sx={{ fontSize: 40 }} />,
      path: '/admin/designs',
      color: '#9c27b0'
    },
    {
      title: 'Gestión de Clientes',
      description: 'Administra usuarios y clientes',
      icon: <People sx={{ fontSize: 40 }} />,
      path: '/admin/customers',
      color: '#2196f3'
    },
    {
      title: 'Gestión de Pagos',
      description: 'Controla pagos y transacciones',
      icon: <Payment sx={{ fontSize: 40 }} />,
      path: '/admin/payments',
      color: '#4caf50'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado': return 'success';
      case 'Pendiente': return 'warning';
      case 'En proceso': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom className="roxo-text-gradient">
              <DashboardIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              Panel de Administración
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Bienvenido de vuelta, {user?.firstName} 👋
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/admin/products/new')}>
            Nuevo Producto
          </Button>
        </Box>
      </Paper>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Módulos principales */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {adminCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                },
                borderRadius: 3
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: card.color, mb: 2 }}>
                  {card.icon}
                </Box>
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

      {/* Pedidos recientes */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pedidos Recientes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>${order.amount}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status} 
                          color={getStatusColor(order.status)}
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" startIcon={<Add />} fullWidth>
                Agregar Dije
              </Button>
              <Button variant="outlined" startIcon={<Add />} fullWidth>
                Agregar Material
              </Button>
              <Button variant="outlined" startIcon={<Add />} fullWidth>
                Agregar Color
              </Button>
              <Button variant="outlined" startIcon={<TrendingUp />} fullWidth>
                Ver Reportes
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;