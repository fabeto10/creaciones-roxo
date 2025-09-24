import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  TextField,
  Divider,
  IconButton
} from '@mui/material';
import { Add, Remove, Close, Check } from '@mui/icons-material';
import { charmsAPI } from '../../services/charms';
import { useCart } from '../../contexts/CartContext';

const BraceletCustomizer = ({ product, open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [charms, setCharms] = useState([]);
  const [customization, setCustomization] = useState({
    material: product.availableMaterials?.[0]?.name || 'standard',
    color: product.availableColors?.[0] || 'standard',
    charms: [],
    notes: ''
  });
  const [selectedCharm, setSelectedCharm] = useState(null);

  const { addToCart } = useCart();

  useEffect(() => {
    if (open) {
      loadCharms();
    }
  }, [open]);

  const loadCharms = async () => {
    try {
      const response = await charmsAPI.getCharms();
      setCharms(response.data);
    } catch (error) {
      console.error('Error loading charms:', error);
    }
  };

  const steps = [
    'Seleccionar Material',
    'Elegir Color',
    'Agregar Dijes',
    'Revisar y Confirmar'
  ];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddCharm = (charm) => {
    setCustomization(prev => ({
      ...prev,
      charms: [...prev.charms, { ...charm, customId: Date.now() }]
    }));
    setSelectedCharm(null);
  };

  const handleRemoveCharm = (charmId) => {
    setCustomization(prev => ({
      ...prev,
      charms: prev.charms.filter(charm => charm.customId !== charmId)
    }));
  };

  const calculateTotalPrice = () => {
    let total = parseFloat(product.basePrice);
    
    // Material adjustment
    const selectedMaterial = product.availableMaterials?.find(m => m.name === customization.material);
    if (selectedMaterial?.priceAdjustment) {
      total += parseFloat(selectedMaterial.priceAdjustment);
    }
    
    // Charms price
    customization.charms.forEach(charm => {
      total += parseFloat(charm.basePrice);
    });
    
    return total;
  };

  const handleAddToCart = () => {
    addToCart(product, customization);
    onClose();
    setActiveStep(0);
    setCustomization({
      material: product.availableMaterials?.[0]?.name || 'standard',
      color: product.availableColors?.[0] || 'standard',
      charms: [],
      notes: ''
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth>
            <InputLabel>Material de la pulsera</InputLabel>
            <Select
              value={customization.material}
              label="Material de la pulsera"
              onChange={(e) => setCustomization(prev => ({ ...prev, material: e.target.value }))}
            >
              {product.availableMaterials?.map((material, index) => (
                <MenuItem key={index} value={material.name}>
                  {material.name} {material.priceAdjustment && `(+$${material.priceAdjustment})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 1:
        return (
          <FormControl fullWidth>
            <InputLabel>Color de la pulsera</InputLabel>
            <Select
              value={customization.color}
              label="Color de la pulsera"
              onChange={(e) => setCustomization(prev => ({ ...prev, color: e.target.value }))}
            >
              {product.availableColors?.map((color, index) => (
                <MenuItem key={index} value={color}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: color.toLowerCase(),
                        border: '1px solid #ccc',
                        borderRadius: '50%'
                      }}
                    />
                    {color}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selecciona los dijes para tu pulsera
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {charms.map((charm) => (
                <Grid item xs={6} sm={4} key={charm.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedCharm?.id === charm.id ? '2px solid' : '1px solid',
                      borderColor: selectedCharm?.id === charm.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => setSelectedCharm(charm)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {charm.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ${charm.basePrice}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {selectedCharm && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => handleAddCharm(selectedCharm)}
                fullWidth
              >
                Agregar "{selectedCharm.name}"
              </Button>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Dijes seleccionados ({customization.charms.length})
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {customization.charms.map((charm) => (
                <Chip
                  key={charm.customId}
                  label={charm.name}
                  onDelete={() => handleRemoveCharm(charm.customId)}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resumen de tu pulsera personalizada
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Material:</Typography>
                <Typography variant="body1">{customization.material}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Color:</Typography>
                <Typography variant="body1">{customization.color}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Dijes:</Typography>
                <Typography variant="body1">
                  {customization.charms.length > 0 
                    ? customization.charms.map(charm => charm.name).join(', ')
                    : 'Ninguno'
                  }
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Precio base:</Typography>
                <Typography variant="body1">${product.basePrice}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" color="primary">
                  Precio total: ${calculateTotalPrice().toFixed(2)}
                </Typography>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notas adicionales (opcional)"
              value={customization.notes}
              onChange={(e) => setCustomization(prev => ({ ...prev, notes: e.target.value }))}
              sx={{ mt: 2 }}
            />
          </Box>
        );
      
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            Personalizar: {product.name}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleBack} disabled={activeStep === 0}>
          Atrás
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleAddToCart}
            startIcon={<Check />}
          >
            Agregar al Carrito
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Siguiente
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BraceletCustomizer;