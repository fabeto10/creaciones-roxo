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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

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

  const handleViewDetails = (product) => {
    setViewingProduct(product);
    setDetailDialogOpen(true);
  };

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
        isActive: product.isActive, // ← AGREGAR ESTO
        tags: product.tags ? JSON.stringify(product.tags) : "",
        availableColors: product.availableColors
          ? JSON.stringify(product.availableColors)
          : "",
        availableMaterials: product.availableMaterials
          ? JSON.stringify(product.availableMaterials)
          : "",
      });

      // Cargar imágenes existentes
      if (product.images && product.images.length > 0) {
        const existingImageUrls = product.images.map(
          (img) => `http://localhost:5000${img}`
        );
        setImagePreviews(existingImageUrls);
      } else {
        setImagePreviews([]);
      }
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
      setImagePreviews([]);
    }
    setSelectedImages([]);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + imagePreviews.length > 5) {
      alert("Máximo 5 imágenes permitidas");
      return;
    }

    setSelectedImages((prev) => [...prev, ...files]);

    // Crear previews de imágenes nuevas
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    const isExistingImage =
      index < imagePreviews.length - selectedImages.length;

    if (isExistingImage) {
      // Para imágenes existentes - corregir la URL duplicada
      const existingImageUrl = imagePreviews[index];
      // Limpiar la URL duplicada
      const cleanUrl = existingImageUrl.replace(
        "http://localhost:5000http://localhost:5000",
        "http://localhost:5000"
      );
      console.log("Eliminar imagen existente:", cleanUrl);

      // Remover de las previews
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImagePreviews(newPreviews);

      // Aquí necesitas enviar al backend qué imagen eliminar
      // Esto requiere modificar el backend para manejar eliminación de imágenes específicas
    } else {
      // Para imágenes nuevas
      const newIndex = index - (imagePreviews.length - selectedImages.length);
      const newImages = selectedImages.filter((_, i) => i !== newIndex);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);

      setSelectedImages(newImages);
      setImagePreviews(newPreviews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();

      // Validar campos requeridos
      if (
        !formData.name ||
        !formData.description ||
        !formData.type ||
        !formData.basePrice ||
        !formData.category ||
        !formData.stock
      ) {
        alert("Por favor completa todos los campos requeridos");
        return;
      }

      // Agregar campos del formulario
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("type", formData.type);
      submitData.append("basePrice", parseFloat(formData.basePrice) || 0);
      submitData.append("category", formData.category);
      submitData.append(
        "customizable",
        formData.customizable === true || formData.customizable === "true"
      );
      submitData.append("stock", parseInt(formData.stock) || 0);
      submitData.append(
        "isActive",
        formData.isActive === true || formData.isActive === "true"
      );

      // Campos JSON - validar y parsear
      try {
        if (formData.tags) {
          const tagsValue =
            typeof formData.tags === "string"
              ? JSON.parse(formData.tags)
              : formData.tags;
          submitData.append("tags", JSON.stringify(tagsValue));
        }
        if (formData.availableColors) {
          const colorsValue =
            typeof formData.availableColors === "string"
              ? JSON.parse(formData.availableColors)
              : formData.availableColors;
          submitData.append("availableColors", JSON.stringify(colorsValue));
        }
        if (formData.availableMaterials) {
          const materialsValue =
            typeof formData.availableMaterials === "string"
              ? JSON.parse(formData.availableMaterials)
              : formData.availableMaterials;
          submitData.append(
            "availableMaterials",
            JSON.stringify(materialsValue)
          );
        }
      } catch (parseError) {
        console.error("❌ Error parsing JSON fields:", parseError);
        alert("Error en el formato de los campos JSON. Verifica la sintaxis.");
        return;
      }

      // Agregar imágenes seleccionadas
      selectedImages.forEach((image) => {
        submitData.append("images", image);
      });

      console.log("🔄 Enviando datos del producto...", {
        formData,
        selectedImagesCount: selectedImages.length,
      });

      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, submitData);
      } else {
        await productsAPI.createProduct(submitData);
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("❌ Error saving product:", error);
      alert(
        "Error guardando producto: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDelete = async (productId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      try {
        // Usar deleteProduct en lugar de updateProduct para soft delete
        await productsAPI.deleteProduct(productId);
        loadData();
      } catch (error) {
        console.error("❌ Error deleting product:", error);
        alert("Error eliminando producto: " + error.message);
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
              <TableCell sx={{ width: 80 }}>Imagen</TableCell>
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
                  <Box sx={{ width: 60, height: 60, position: "relative" }}>
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? product.images[0].startsWith("http")
                            ? product.images[0]
                            : `http://localhost:5000${product.images[0]}`
                          : "/images/placeholder-bracelet.jpg"
                      }
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                      onError={(e) => {
                        e.target.src = "/images/placeholder-bracelet.jpg";
                      }}
                    />
                    {product.images && product.images.length > 1 && (
                      <Chip
                        label={`+${product.images.length - 1}`}
                        size="small"
                        sx={{
                          position: "absolute",
                          bottom: -8,
                          right: -8,
                          bgcolor: "primary.main",
                          color: "white",
                          fontSize: "0.6rem",
                          height: 20,
                          minWidth: 20,
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">{product.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {product.description?.substring(0, 50)}...
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
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleViewDetails(product)}
                      title="Ver detalles del producto"
                    >
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
              {/* Sección de imágenes */}
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
                      Vista previa ({imagePreviews.length} imágenes)
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {imagePreviews.map((preview, index) => {
                        const isExisting =
                          index < imagePreviews.length - selectedImages.length;
                        return (
                          <Box key={index} sx={{ position: "relative" }}>
                            <img
                              src={preview}
                              alt={`Preview ${index}`}
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 8,
                                border: isExisting
                                  ? "2px solid #4caf50"
                                  : "2px solid #2196f3",
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
                            <Chip
                              label={isExisting ? "Existente" : "Nueva"}
                              size="small"
                              sx={{
                                position: "absolute",
                                bottom: 4,
                                left: 4,
                                bgcolor: isExisting ? "#4caf50" : "#2196f3",
                                color: "white",
                                fontSize: "0.6rem",
                                height: 16,
                              }}
                            />
                          </Box>
                        );
                      })}
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
                      basePrice: e.target.value,
                    }))
                  }
                  inputProps={{ step: "0.01", min: "0" }}
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
                  inputProps={{ min: "0" }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Estado Activo</InputLabel>
                  <Select
                    value={formData.isActive}
                    label="Estado Activo"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.value === "true",
                      }))
                    }
                  >
                    <MenuItem value={true}>Activo</MenuItem>
                    <MenuItem value={false}>Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Personalizable</InputLabel>
                  <Select
                    value={formData.customizable}
                    label="Personalizable"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customizable: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value={false}>No</MenuItem>
                    <MenuItem value={true}>Sí</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
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

      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles del Producto - {viewingProduct?.name}
        </DialogTitle>
        <DialogContent>
          {viewingProduct && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Información Básica
                </Typography>
                <Typography>
                  <strong>Nombre:</strong> {viewingProduct.name}
                </Typography>
                <Typography>
                  <strong>Descripción:</strong> {viewingProduct.description}
                </Typography>
                <Typography>
                  <strong>Tipo:</strong> {viewingProduct.type}
                </Typography>
                <Typography>
                  <strong>Categoría:</strong> {viewingProduct.category}
                </Typography>
                <Typography>
                  <strong>Precio Base:</strong> ${viewingProduct.basePrice}
                </Typography>
                <Typography>
                  <strong>Stock:</strong> {viewingProduct.stock}
                </Typography>
                <Typography>
                  <strong>Personalizable:</strong>{" "}
                  {viewingProduct.customizable ? "Sí" : "No"}
                </Typography>

                <Typography>
                  <strong>Estado:</strong>{" "}
                  {viewingProduct.isActive ? "Activo" : "Inactivo"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Imágenes del Producto
                </Typography>
                {viewingProduct.images && viewingProduct.images.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {viewingProduct.images.map((img, index) => (
                      <img
                        key={index}
                        src={
                          img.startsWith("http")
                            ? img
                            : `http://localhost:5000${img}`
                        }
                        alt={`${viewingProduct.name} ${index + 1}`}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No hay imágenes disponibles
                  </Typography>
                )}
              </Grid>

              {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Etiquetas
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {viewingProduct.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setDetailDialogOpen(false);
              // Opcional: redirigir a la tienda donde está el producto
              // navigate(`/tienda?product=${viewingProduct.id}`);
            }}
          >
            Ver en Tienda
          </Button>
          <Button onClick={() => setDetailDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductManagement;
