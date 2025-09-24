import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Box,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Favorite, ShoppingCart, Star, Search } from '@mui/icons-material';
import { productsAPI } from '../../services/products';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/products/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getProducts();
      setProducts(response.data);
    } catch (err) {
      setError('Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const categories = [...new Set(products.map(product => product.category))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box className="roxo-gradient-bg" sx={{ color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                ROXO | Bisutería
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, opacity: 0.9 }}>
                Accesorios Únicos y Personalizados
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
                ¿Buscas algo especial? ¡Contáctame para crear tú accesorio ideal!✨
              </Typography>
              <Button 
                
                variant="contained" 
                size="large" 
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  fontSize: '1.1rem',
                  px: 4,
                  '&:hover': { 
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <ShoppingCart sx={{ mr: 1 }} />
                Comenzar a Personalizar
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="/api/placeholder/500/400"
                alt="Pulseras personalizadas"
                sx={{ 
                  width: '100%', 
                  borderRadius: 4,
                  boxShadow: 6
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Products Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom className="roxo-text-gradient" fontWeight="bold">
          Nuestros Productos
        </Typography>
        
        <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 4 }}>
          Descubre nuestra colección de pulseras personalizables
        </Typography>

        {/* Filtros */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ minWidth: 200, flexGrow: 1 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoryFilter}
              label="Categoría"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        <Grid container spacing={4}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>

        {filteredProducts.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="textSecondary">
              No se encontraron productos
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Intenta con otros términos de búsqueda
            </Typography>
          </Box>
        )}
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom className="roxo-text-gradient" fontWeight="bold">
            ¿Por Qué Elegirnos?
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Favorite color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">Hecho con Amor</Typography>
                <Typography variant="body1">
                  Cada pieza es creada artesanalmente con atención a los detalles y mucho cariño
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Star color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">Totalmente Personalizable</Typography>
                <Typography variant="body1">
                  Elige diseños, colores, materiales y dijes según tu estilo único
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <ShoppingCart color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">Múltiples Métodos de Pago</Typography>
                <Typography variant="body1">
                  Pago Móvil, Zelle, Criptomonedas y Efectivo para tu comodidad
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;