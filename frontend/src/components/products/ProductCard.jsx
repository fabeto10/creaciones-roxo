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
  Savings,
  PriceCheck,
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
  const { addToCart, calculatePriceInfo } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const priceInfo = calculatePriceInfo(product.basePrice);
  const getProductImages = () => {
    console.log("🔍 Procesando imágenes para:", product.name, product.images);

    // Si el producto tiene imágenes definidas
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const processedImages = product.images.map((img) => {
        if (!img || img === "null" || img === "undefined") {
          return "/images/placeholder-bracelet.jpg";
        }
        if (img.startsWith("http")) return img;
        if (img.startsWith("/")) return `http://localhost:5000${img}`;
        return `http://localhost:5000/uploads/${img}`;
      });
      console.log("✅ Imágenes procesadas:", processedImages);
      return processedImages;
    }

    console.log("⚠️ Usando imagen de fallback para:", product.name);

    // Imágenes de fallback
    const sampleImages = {
      pulsera: "/images/products/Gemini_Generated_Image_hn9gvzhn9gvzhn9g.png",
      dije: "/images/products/Gemini_Generated_Image_j3wtxcj3wtxcj3wt.png",
      material: "/images/products/Gemini_Generated_Image_s1maars1maars1ma.png",
      combo: "/images/products/Gemini_Generated_Image_2rj99a2rj99a2rj9.png",
    };

    const imageKey = product.type || product.category || "pulsera";
    return [sampleImages[imageKey] || sampleImages.pulsera];
  };

  const images = getProductImages();

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
        {/* Imagen del producto */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 250, // ALTURA FIJA en lugar de paddingTop
            cursor: "pointer",
            overflow: "hidden",
            backgroundColor: "grey.100", // Fondo temporal para debug
          }}
          onClick={() => openImageDialog(0)}
        >
          <ImageWithFallback
            src={images[0]}
            alt={product.name}
            fallbackSrc="/images/placeholder-bracelet.jpg"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
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

            {/* Tags */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
              {product.tags?.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: "auto", pt: 1 }}>
            {/* PRECIO PRINCIPAL EN BS (PRECIO NORMAL) */}
            <Typography
              variant="h5"
              color="primary"
              gutterBottom
              fontWeight="600"
            >
              {priceInfo.priceBS.toFixed(2)} BS
            </Typography>

            {/* PRECIO ORIGINAL EN USD */}
            <Typography variant="body2" color="text.secondary">
              Precio original: ${priceInfo.originalPriceUSD.toFixed(2)} USD
            </Typography>

            {/* PRECIO CON DESCUENTO EN USD */}
            <Box
              sx={{
                bgcolor: "success.light",
                p: 1,
                borderRadius: 1,
                mb: 1,
                border: "1px solid",
                borderColor: "success.main",
              }}
            >
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <Savings color="success" fontSize="small" />
                <Typography
                  variant="subtitle2"
                  color="success.dark"
                  fontWeight="bold"
                >
                  ¡Paga en USD y ahorra {priceInfo.discount.percentage}%!
                </Typography>
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box display="flex" alignItems="baseline" gap={0.5}>
                  <PriceCheck color="success" fontSize="small" />
                  <Typography
                    variant="h6"
                    color="success.dark"
                    fontWeight="bold"
                  >
                    ${priceInfo.discountedPriceUSD.toFixed(2)} USD
                  </Typography>
                </Box>
                <Chip
                  label={`-${priceInfo.discount.percentage}%`}
                  size="small"
                  color="success"
                  variant="filled"
                />
              </Box>
            </Box>

            {/* INFORMACIÓN ADICIONAL */}
            <Typography variant="caption" color="textSecondary" display="block">
              💰 Tasa oficial: {priceInfo.rates.official.toFixed(2)} BS/USD
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              📊 Tasa paralela: {priceInfo.rates.parallel.toFixed(2)} BS/USD
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
                mt: 1,
              }}
            >
              {product.customizable ? "Personalizar" : "Agregar al Carrito"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Diálogo para personalizar */}
      <BraceletCustomizer
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        product={product}
        onAddToCart={(customization) => {
          addToCart(product, customization);
          setCustomizerOpen(false);
        }}
      />

      {/* Diálogo para ver imagen en grande */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">{product.name}</Typography>
            <IconButton onClick={() => setImageDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {images.length > 1 && (
              <IconButton
                onClick={prevImage}
                sx={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1,
                }}
              >
                <NavigateBefore />
              </IconButton>
            )}

            <ImageWithFallback
              src={images[currentImageIndex]}
              alt={product.name}
              fallbackSrc="/images/placeholder-bracelet.jpg"
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />

            {images.length > 1 && (
              <IconButton
                onClick={nextImage}
                sx={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1,
                }}
              >
                <NavigateNext />
              </IconButton>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
