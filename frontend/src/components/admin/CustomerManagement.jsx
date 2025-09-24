import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { People } from '@mui/icons-material';

const CustomerManagement = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <People sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Gestión de Clientes
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Administra los usuarios y clientes de Creaciones Roxo
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1">
          Módulo en desarrollo. Próximamente podrás gestionar todos los clientes registrados.
        </Typography>
      </Paper>
    </Container>
  );
};

export default CustomerManagement;