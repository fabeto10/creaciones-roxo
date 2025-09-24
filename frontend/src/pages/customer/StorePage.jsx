import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Pagination,
  Drawer,
  Button,
  CircularProgress
} from '@mui/material';
import { FilterList, Search, Tune } from '@mui/icons-material';
import { productsAPI } from '../../services/products';
import ProductCard from '../../components/products/ProductCard';

const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const productsPerPage = 9;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts();
      setProducts(response.data.filter(p => p.isActive));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => 
    [...new Set(products.map(product => product.category).filter(Boolean))], 
    [products]
  );

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por categoría
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Filtro por precio
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => 
        product.basePrice >= min && product.basePrice <= max
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.basePrice - b.basePrice;
        case 'price-high':
          return b.basePrice - a.basePrice;
        case 'name':
        default:
          return a.name?.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, priceRange, sortBy]);

  // Paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header de la tienda */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" className="roxo-text-gradient" fontWeight="bold">
          🎀 Tienda Creaciones Roxo
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Descubre nuestras pulseras personalizables únicas
        </Typography>
      </Box>

      {/* Filtros y búsqueda */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar pulseras, dijes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 200, flexGrow: 1 }}
        />
        
        <Button 
          variant="outlined" 
          startIcon={<Tune />}
          onClick={() => setFilterOpen(true)}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          Filtros
        </Button>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, flexWrap: 'wrap' }}>
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

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Precio</InputLabel>
            <Select
              value={priceRange}
              label="Precio"
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="0-20">Hasta $20</MenuItem>
              <MenuItem value="20-50">$20 - $50</MenuItem>
              <MenuItem value="50-100">$50 - $100</MenuItem>
              <MenuItem value="100-999">Más de $100</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              label="Ordenar por"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="name">Nombre</MenuItem>
              <MenuItem value="price-low">Precio: Menor a Mayor</MenuItem>
              <MenuItem value="price-high">Precio: Mayor a Menor</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Información de resultados */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="body2" color="textSecondary">
          {filteredProducts.length} productos encontrados
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categoryFilter && (
            <Chip 
              label={`Categoría: ${categoryFilter}`} 
              onDelete={() => setCategoryFilter('')}
              size="small"
            />
          )}
          {priceRange && (
            <Chip 
              label={`Precio: ${priceRange}`} 
              onDelete={() => setPriceRange('')}
              size="small"
            />
          )}
          {(categoryFilter || priceRange) && (
            <Button 
              size="small" 
              onClick={() => {
                setCategoryFilter('');
                setPriceRange('');
              }}
            >
              Limpiar
            </Button>
          )}
        </Box>
      </Box>

      {/* Grid de productos */}
      <Grid container spacing={3}>
        {currentProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      {/* Paginación */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Mensaje sin resultados */}
      {filteredProducts.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" gutterBottom>
            No se encontraron productos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Intenta con otros filtros o términos de búsqueda
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setPriceRange('');
            }}
          >
            Limpiar filtros
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default StorePage;