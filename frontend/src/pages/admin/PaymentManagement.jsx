import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Payment } from '@mui/icons-material';

const PaymentManagement = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Payment sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Gestión de Pagos
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Controla y gestiona todos los pagos y transacciones
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1">
          Módulo en desarrollo. Próximamente podrás gestionar Pago Móvil, Zelle, Criptomonedas y más.
        </Typography>
      </Paper>
    </Container>
  );
};

export default PaymentManagement;