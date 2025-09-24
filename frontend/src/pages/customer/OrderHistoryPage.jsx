import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  Receipt, 
  ShoppingBag,
  Payment,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: '/my-orders',
          message: 'Necesitas iniciar sesión para ver tus órdenes' 
        } 
      });
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/transactions/my-transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const transactions = await response.json();
        setOrders(transactions);
      } else {
        throw new Error('Error loading orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'VERIFYING': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Pendiente de pago',
      'VERIFYING': 'Verificando pago',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'VES'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Cargando tus órdenes...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Receipt sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Mis Órdenes
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Historial de tus compras en Creaciones Roxo
            </Typography>
          </Box>
        </Box>
      </Paper>

      {orders.length === 0 ? (
        <Box textAlign="center" py={8}>
          <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Aún no tienes órdenes
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            ¡Descubre nuestros productos y realiza tu primera compra!
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/tienda')}
            size="large"
          >
            Ir a la Tienda
          </Button>
        </Box>
      ) : (
        <>
          {/* Estadísticas rápidas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ShoppingBag sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Total Órdenes
                  </Typography>
                  <Typography variant="h4">{orders.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Payment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Completadas
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {orders.filter(o => o.status === 'COMPLETED').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AttachMoney sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Total Gastado
                  </Typography>
                  <Typography variant="h4">
                    ${orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.amountUSD, 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CalendarToday sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Pendientes
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {orders.filter(o => o.status === 'PENDING' || o.status === 'VERIFYING').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de órdenes */}
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Método de Pago</TableCell>
                  <TableCell>Monto USD</TableCell>
                  <TableCell>Monto BS</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('es-VE')}
                      <Typography variant="body2" color="textSecondary">
                        {new Date(order.createdAt).toLocaleTimeString('es-VE')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={order.paymentMethod} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        ${order.amountUSD.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {order.amountBS ? (
                        <Typography variant="body2">
                          Bs. {order.amountBS.toFixed(2)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(order.status)} 
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewOrder(order)}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Diálogo de detalles de orden */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalles de la Orden #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Información de la Orden</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography><strong>Fecha:</strong> {new Date(selectedOrder.createdAt).toLocaleString('es-VE')}</Typography>
                  <Typography><strong>Método de Pago:</strong> {selectedOrder.paymentMethod}</Typography>
                  <Typography><strong>Estado:</strong> 
                    <Chip 
                      label={getStatusText(selectedOrder.status)} 
                      color={getStatusColor(selectedOrder.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography><strong>Monto USD:</strong> ${selectedOrder.amountUSD.toFixed(2)}</Typography>
                  {selectedOrder.amountBS && (
                    <Typography><strong>Monto BS:</strong> Bs. {selectedOrder.amountBS.toFixed(2)}</Typography>
                  )}
                  {selectedOrder.exchangeRate && (
                    <Typography><strong>Tasa de cambio:</strong> {selectedOrder.exchangeRate} BS/USD</Typography>
                  )}
                </Box>

                {selectedOrder.reference && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Información de Transacción</Typography>
                    <Typography><strong>Referencia:</strong> {selectedOrder.reference}</Typography>
                    {selectedOrder.senderName && (
                      <Typography><strong>Remitente:</strong> {selectedOrder.senderName}</Typography>
                    )}
                    {selectedOrder.senderPhone && (
                      <Typography><strong>Teléfono:</strong> {selectedOrder.senderPhone}</Typography>
                    )}
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Productos</Typography>
                {selectedOrder.orders && selectedOrder.orders.length > 0 ? (
                  selectedOrder.orders.map((order, index) => (
                    <Card key={index} sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2"><strong>{order.items?.length || 0} productos</strong></Typography>
                        <Typography variant="body2">Total: ${order.totalUSD?.toFixed(2) || '0.00'}</Typography>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No hay información detallada de productos
                  </Typography>
                )}

                {selectedOrder.screenshot && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>Comprobante de Pago</Typography>
                    <img 
                      src={`http://localhost:5000${selectedOrder.screenshot}`}
                      alt="Comprobante de pago"
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: 200, 
                        border: '1px solid #ddd',
                        borderRadius: 8
                      }}
                    />
                  </Box>
                )}

                {selectedOrder.adminNotes && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>Notas del Administrador</Typography>
                    <Typography variant="body2">{selectedOrder.adminNotes}</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
          {(selectedOrder?.status === 'PENDING' || selectedOrder?.status === 'VERIFYING') && (
            <Button variant="contained">
              Subir Comprobante
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderHistoryPage;