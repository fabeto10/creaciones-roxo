import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Add, Edit, Delete, Visibility, Inventory2 } from "@mui/icons-material";
import { productsAPI } from "../../services/products";
import { charmsAPI } from "../../services/charms";

const ProductManagement = () => {
  // Agrega estos estados al componente ProductManagement
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [charms, setCharms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "pulsera",
    basePrice: "",
    category: "",
    customizable: false,
    stock: "",
    tags: "",
    availableColors: "",
    availableMaterials: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsResponse, charmsResponse] = await Promise.all([
        productsAPI.getProducts(),
        charmsAPI.getCharms(),
      ]);
      setProducts(productsResponse.data);
      setCharms(charmsResponse.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar selección de imágenes
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);

    // Crear previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        type: product.type,
        basePrice: product.basePrice,
        category: product.category,
        customizable: product.customizable,
        stock: product.stock,
        tags: JSON.stringify(product.tags || []),
        availableColors: JSON.stringify(product.availableColors || []),
        availableMaterials: JSON.stringify(product.availableMaterials || []),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        type: "pulsera",
        basePrice: "",
        category: "",
        customizable: false,
        stock: "",
        tags: "",
        availableColors: "",
        availableMaterials: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  // Actualiza handleSubmit para usar FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Agregar campos normales
      Object.keys(formData).forEach((key) => {
        if (
          key === "tags" ||
          key === "availableColors" ||
          key === "availableMaterials"
        ) {
          formData.append(
            key,
            JSON.stringify(formData[key] ? JSON.parse(formData[key]) : [])
          );
        } else {
          formData.append(key, formData[key]);
        }
      });

      // Agregar imágenes
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, formData);
      } else {
        await productsAPI.createProduct(formData);
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (productId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      try {
        // Aquí iría productsAPI.deleteProduct(productId) cuando lo implementes
        await productsAPI.updateProduct(productId, { isActive: false });
        loadData();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Inventory2 sx={{ fontSize: 40, color: "primary.main" }} />
            <Box>
              <Typography variant="h4" component="h1">
                Gestión de Productos
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Administra todos los productos y dijes de Creaciones Roxo
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Paper>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Productos
              </Typography>
              <Typography variant="h4">{products.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Productos Activos
              </Typography>
              <Typography variant="h4">
                {products.filter((p) => p.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Dijes
              </Typography>
              <Typography variant="h4">{charms.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Personalizables
              </Typography>
              <Typography variant="h4">
                {products.filter((p) => p.customizable).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de productos */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Typography fontWeight="bold">{product.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {product.description.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={product.type} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.basePrice}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Chip
                    label={product.isActive ? "Activo" : "Inactivo"}
                    color={product.isActive ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton size="small" color="info">
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para crear/editar producto */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "Editar Producto" : "Nuevo Producto"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre del producto"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={formData.type}
                    label="Tipo"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, type: e.target.value }))
                    }
                  >
                    <MenuItem value="pulsera">Pulsera</MenuItem>
                    <MenuItem value="dije">Dije</MenuItem>
                    <MenuItem value="material">Material</MenuItem>
                    <MenuItem value="combo">Combo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Precio base"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      basePrice: e.target.value,
                    }))
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stock: e.target.value }))
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Categoría"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Etiquetas (JSON array)"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder='["popular", "nuevo"]'
                  helperText="Ingresa las etiquetas como array JSON"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Colores disponibles (JSON array)"
                  value={formData.availableColors}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      availableColors: e.target.value,
                    }))
                  }
                  placeholder='["rojo", "azul", "verde"]'
                  helperText="Ingresa los colores como array JSON"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Materiales disponibles (JSON array)"
                  value={formData.availableMaterials}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      availableMaterials: e.target.value,
                    }))
                  }
                  placeholder='[{"name": "cuero", "priceAdjustment": 0}]'
                  helperText="Ingresa los materiales como array JSON de objetos"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingProduct ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ProductManagement;
