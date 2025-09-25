// frontend/src/pages/admin/ExternalProductRequests.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Inventory } from '@mui/icons-material';

const ExternalProductRequests = () => {
  const [requests, setRequests] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerContact: '',
    budget: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // Aquí implementarías la llamada a la API
      console.log('Cargando solicitudes externas...');
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Implementar envío a la API
      console.log('Enviando solicitud externa:', formData);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving request:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      CANCELLED: 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1">
                Solicitudes Externas de Productos
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Gestiona productos solicitados fuera de la plataforma
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Nueva Solicitud
          </Button>
        </Box>
      </Paper>

      {/* Tabla de solicitudes */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Presupuesto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Límite</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} hover>
                <TableCell>
                  <Typography fontWeight="bold">{request.productName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {request.description?.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>{request.customerName}</TableCell>
                <TableCell>
                  <Typography>{request.customerPhone}</Typography>
                  {request.customerEmail && (
                    <Typography variant="body2" color="textSecondary">
                      {request.customerEmail}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {request.budget ? `$${request.budget}` : 'Por definir'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={request.status} 
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {request.dueDate ? new Date(request.dueDate).toLocaleDateString('es-VE') : 'Sin fecha'}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton size="small" color="info">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <Edit />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para nueva solicitud */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nueva Solicitud Externa de Producto</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Información del Producto</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del Producto"
                  value={formData.productName}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción del Producto"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Información del Cliente</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre del Cliente"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contacto preferido (WhatsApp, Instagram, etc.)"
                  value={formData.customerContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerContact: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Presupuesto estimado ($)"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha límite"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notas adicionales"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar Solicitud</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ExternalProductRequests;