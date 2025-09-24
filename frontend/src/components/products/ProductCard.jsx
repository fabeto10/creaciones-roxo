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
} from "@mui/material";
import {
  ShoppingCart,
  Build,
  Close,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import BraceletCustomizer from "./BraceletCustomizer";
import ImageWithFallback from "../common/ImageWithFallback";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { exchangeRates, calculateSavings } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const savingsInfo = calculateSavings(product.basePrice);

  // Función CORREGIDA para obtener imágenes
  const getProductImages = () => {
    console.log("🔍 Product images raw:", product.images);

    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      // Procesar cada imagen para asegurar que tenga la URL completa
      const processedImages = product.images.map((img) => {
        // Si la imagen ya tiene URL completa, dejarla así
        if (img.startsWith("http")) {
          return img;
        }
        // Si empieza con /uploads/, agregar el dominio
        if (img.startsWith("/uploads/")) {
          return `http://localhost:5000${img}`;
        }
        // Si es solo el nombre del archivo, construir la ruta completa
        return `http://localhost:5000/uploads/${img}`;
      });

      console.log("🖼️ Processed images:", processedImages);
      return processedImages;
    }

    console.log("📁 Using fallback image");
    // Imágenes de muestra como fallback
    const sampleImages = {
      pulsera: "/images/products/Gemini_Generated_Image_hn9gvzhn9gvzhn9g.png",
      dije: "/images/products/Gemini_Generated_Image_j3wtxcj3wtxcj3wt.png",
      material: "/images/products/Gemini_Generated_Image_s1maars1maars1ma.png",
      combo: "/images/products/Gemini_Generated_Image_2rj99a2rj99a2rj9.png",
    };

    return [sampleImages[product.type] || "/images/placeholder-bracelet.jpg"];
  };

  const images = getProductImages();
  console.log("Processed images:", images); // DEBUG

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/tienda",
          message: "Necesitas iniciar sesión para agregar productos al carrito",
        },
      });
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
            position: "relative",
            height: 200,
            overflow: "hidden",
            cursor: images.length > 1 ? "pointer" : "default",
          }}
          onClick={() => images.length > 1 && openImageDialog(0)}
        >
          <ImageWithFallback
            src={images[0]}
            alt={product.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
            fallbackSrc="/images/placeholder-bracelet.jpg"
          />

          {/* Indicador de múltiples imágenes */}
          {images.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                display: "flex",
                gap: 0.5,
              }}
            >
              <Chip
                label={`${images.length} imágenes`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.9)",
                  fontWeight: "bold",
                }}
              />
            </Box>
          )}
        </Box>

        <CardContent
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              {product.name}
            </Typography>

            <Typography
              variant="body2"
              color="textSecondary"
              paragraph
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: 60,
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

              {product.tags &&
                Array.isArray(product.tags) &&
                product.tags.map((tag, index) => (
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
            <Typography
              variant="h5"
              color="primary"
              gutterBottom
              fontWeight="600"
            >
              ${parseFloat(product.basePrice || 0).toFixed(2)}
            </Typography>

            {/* Información de ahorro */}
            <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
              💰 Ahorras {savingsInfo.savingsPercentage}% pagando en USD
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Equivale a {savingsInfo.amountBSOfficial.toFixed(2)} BS (oficial)
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
                  background:
                    "linear-gradient(135deg, #c2185b 0%, #7b1fa2 100%)",
                },
              }}
            >
              {product.customizable ? "Personalizar" : "Agregar al Carrito"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog para galería de imágenes */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            maxWidth: "90vw",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6">
            {product.name} - Imagen {currentImageIndex + 1} de {images.length}
          </Typography>
          <IconButton onClick={() => setImageDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            position: "relative",
            p: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <ImageWithFallback
            src={images[currentImageIndex]}
            alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
            sx={{
              width: "100%",
              height: "auto",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
            fallbackSrc="/images/placeholder-bracelet.jpg"
          />

          {images.length > 1 && (
            <>
              <IconButton
                onClick={prevImage}
                sx={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.7)",
                    color: "white",
                  },
                }}
              >
                <NavigateBefore />
              </IconButton>

              <IconButton
                onClick={nextImage}
                sx={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.7)",
                    color: "white",
                  },
                }}
              >
                <NavigateNext />
              </IconButton>

              {/* Indicadores de posición */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 1,
                  bgcolor: "rgba(0,0,0,0.5)",
                  borderRadius: 2,
                  p: 1,
                }}
              >
                {images.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor:
                        index === currentImageIndex
                          ? "primary.main"
                          : "grey.400",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </Box>

              {/* Miniaturas en la parte inferior */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 60,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 1,
                  maxWidth: "90%",
                  overflowX: "auto",
                  pb: 1,
                }}
              >
                {images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 60,
                      height: 60,
                      border:
                        index === currentImageIndex ? "2px solid" : "1px solid",
                      borderColor:
                        index === currentImageIndex
                          ? "primary.main"
                          : "grey.300",
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      opacity: index === currentImageIndex ? 1 : 0.7,
                      "&:hover": { opacity: 1 },
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Miniatura ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {product.customizable && (
        <BraceletCustomizer
          product={product}
          open={customizerOpen}
          onClose={() => setCustomizerOpen(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
