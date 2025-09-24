import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import { ShoppingCart, Build, Close, NavigateBefore, NavigateNext, Info, Savings } from "@mui/icons-material";
import BraceletCustomizer from "./BraceletCustomizer";
import ImageWithFallback from "../common/ImageWithFallback";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, calculatePriceInfo, exchangeRates } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Calcular información de precios
  const priceInfo = calculatePriceInfo(product.basePrice);

  const getProductImages = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(img => {
        if (img.startsWith('http')) {
          return img;
        }
        if (img.startsWith('/uploads/')) {
          return `http://localhost:5000${img}`;
        }
        return `http://localhost:5000/uploads/${img}`;
      });
    }
    
    const sampleImages = {
      pulsera: "/images/products/Gemini_Generated_Image_hn9gvzhn9gvzhn9g.png",
      dije: "/images/products/Gemini_Generated_Image_j3wtxcj3wtxcj3wt.png",
      material: "/images/products/Gemini_Generated_Image_s1maars1maars1ma.png",
      combo: "/images/products/Gemini_Generated_Image_2rj99a2rj99a2rj9.png",
    };

    return [sampleImages[product.type] || "/images/placeholder-bracelet.jpg"];
  };

  const images = getProductImages();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/tienda', message: 'Necesitas iniciar sesión para agregar productos al carrito' } });
      return;
    }

    if (product.customizable) {
      setCustomizerOpen(true);
    } else {
      addToCart(product);
    }
  };

  const openImageDialog = (index) => {
    setCurrentImageIndex(index);
    setImageDialogOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 32px rgba(233, 30, 99, 0.15)",
          },
        }}
      >
        {/* Imagen principal */}
        <Box 
          sx={{ 
            position: 'relative', 
            height: 200, 
            overflow: 'hidden',
            cursor: images.length > 1 ? 'pointer' : 'default'
          }}
          onClick={() => images.length > 1 && openImageDialog(0)}
        >
          <ImageWithFallback
            src={images[0]}
            alt={product.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
            fallbackSrc="/images/placeholder-bracelet.jpg"
          />
          
          {images.length > 1 && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: 8, 
              right: 8,
              display: 'flex',
              gap: 0.5
            }}>
              <Chip 
                label={`${images.length} imágenes`}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              {product.name}
            </Typography>

            <Typography 
              variant="body2" 
              color="textSecondary" 
              paragraph 
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: 60
              }}
            >
              {product.description}
            </Typography>

            <Box sx={{ mb: 2 }}>
              {product.customizable && (
                <Chip
                  label="✨ Personalizable"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1, mr: 1 }}
                />
              )}

              {product.tags && Array.isArray(product.tags) && product.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    mr: 0.5,
                    mb: 0.5,
                    fontSize: "0.7rem",
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: "auto", pt: 1 }}>
            {/* PRECIO PRINCIPAL EN BS */}
            <Typography
              variant="h5"
              color="primary"
              gutterBottom
              fontWeight="600"
            >
              {priceInfo.priceBS.toFixed(2)} BS
            </Typography>

            {/* PRECIO EN USD CON DESCUENTO */}
            <Box sx={{ 
              bgcolor: 'success.light', 
              p: 1, 
              borderRadius: 1, 
              mb: 1,
              border: '1px solid',
              borderColor: 'success.main'
            }}>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <Savings color="success" fontSize="small" />
                <Typography variant="subtitle2" color="success.dark" fontWeight="bold">
                  Paga en USD y ahorra {priceInfo.savings.percentage}%
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="success.dark">
                  Solo ${priceInfo.priceUSD.toFixed(2)} USD
                </Typography>
                <Tooltip title={`Precio regular: ${priceInfo.savings.priceBSParallel.toFixed(2)} BS (tasa paralela)`}>
                  <Chip 
                    label={`-${priceInfo.savings.percentage}%`}
                    size="small"
                    color="success"
                    variant="filled"
                  />
                </Tooltip>
              </Box>
            </Box>

            {/* INFORMACIÓN DE TASAS */}
            <Typography variant="caption" color="textSecondary" display="block">
              💱 Tasa oficial: {priceInfo.rates.official} BS/USD
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              📊 Tasa paralela: {priceInfo.rates.parallel} BS/USD
            </Typography>

            <Button
              variant="contained"
              fullWidth
              startIcon={product.customizable ? <Build /> : <ShoppingCart />}
              onClick={handleAddToCart}
              size="medium"
              sx={{
                background: "linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #c2185b 0%, #7b1fa2 100%)",
                },
                mt: 1
              }}
            >
              {product.customizable ? "Personalizar" : "Agregar al Carrito"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ... (resto del código igual) ... */}
    </>
  );
};

export default ProductCard;