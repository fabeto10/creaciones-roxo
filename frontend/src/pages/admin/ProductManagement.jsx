import React, { useState, useEffect, useRef } from "react";
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
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Inventory2,
  CloudUpload,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { productsAPI } from "../../services/products";
import { charmsAPI } from "../../services/charms";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [charms, setCharms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

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
      setLoading(true);
      const [productsResponse, charmsResponse] = await Promise.all([
        productsAPI.getProducts(),
        charmsAPI.getCharms(),
      ]);
      setProducts(productsResponse.data);
      setCharms(charmsResponse.data);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error cargando datos: " + error.message);
    } finally {
      setLoading(false);
    }
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
    setSelectedImages([]);
    setImagePreviews([]);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setSelectedImages([]);
    setImagePreviews([]);
  };

  // Manejar selección de imágenes
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);

    // Crear previews de imágenes
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...selectedImages];
    const newPreviews = [...imagePreviews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();

      // Agregar campos del formulario CORREGIDO
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (
            key === "tags" ||
            key === "availableColors" ||
            key === "availableMaterials"
          ) {
            // Para campos JSON, parsear solo si no está vacío
            const value = formData[key] ? JSON.parse(formData[key]) : [];
            submitData.append(key, JSON.stringify(value));
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      // Agregar imágenes seleccionadas
      selectedImages.forEach((image) => {
        submitData.append("images", image);
      });

      console.log("Enviando datos...", Object.fromEntries(submitData));

      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, submitData);
      } else {
        await productsAPI.createProduct(submitData);
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar producto: " + error.message);
    }
  };

  const handleDelete = async (productId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      try {
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
              {/* Sección de subida de imágenes */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Imágenes del Producto
                </Typography>
                <Box
                  sx={{
                    border: "2px dashed #e91e63",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                    ref={fileInputRef}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => fileInputRef.current.click()}
                  >
                    Seleccionar Imágenes
                  </Button>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                  >
                    Puedes seleccionar múltiples imágenes (máximo 5)
                  </Typography>
                </Box>

                {/* Previews de imágenes */}
                {imagePreviews.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Vista previa ({imagePreviews.length} imágenes
                      seleccionadas)
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {imagePreviews.map((preview, index) => (
                        <Box key={index} sx={{ position: "relative" }}>
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              bgcolor: "error.main",
                              color: "white",
                              "&:hover": { bgcolor: "error.dark" },
                            }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>

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
                      basePrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                  inputProps={{ min: 0, step: "0.01" }}
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
                    setFormData((prev) => ({
                      ...prev,
                      stock: parseInt(e.target.value) || 0,
                    }))
                  }
                  inputProps={{ min: 0 }}
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
