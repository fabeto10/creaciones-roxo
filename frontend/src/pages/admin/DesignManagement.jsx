import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { DesignServices } from '@mui/icons-material';

const DesignManagement = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <DesignServices sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Gestión de Diseños
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Administra los diseños personalizados creados por los clientes
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1">
          Módulo en desarrollo. Próximamente podrás ver y gestionar todos los diseños creados por los clientes.
        </Typography>
      </Paper>
    </Container>
  );
};

export default DesignManagement;