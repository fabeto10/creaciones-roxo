import React, { useState, useEffect } from "react";
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
  const [images, setImages] = useState([]);
  const { addToCart, calculatePriceInfo } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const priceInfo = calculatePriceInfo(product.basePrice);

  // Procesar imágenes una vez cuando el componente se monta o el producto cambia
  useEffect(() => {
    const getProductImages = () => {
      console.log(
        "🔍 Procesando imágenes para:",
        product.name,
        "Raw images:",
        product.images
      );

      // Verificación robusta de imágenes
      if (product.images && Array.isArray(product.images)) {
        const validImages = product.images.filter(
          (img) =>
            img &&
            img !== "null" &&
            img !== "undefined" &&
            img !== "" &&
            !img.includes("undefined")
        );

        if (validImages.length > 0) {
          const processedImages = validImages.map((img) => {
            if (typeof img !== "string")
              return "/images/placeholder-bracelet.jpg";
            if (img.startsWith("http")) return img;
            if (img.startsWith("/uploads/"))
              return `http://localhost:5000${img}`;
            if (img.startsWith("/")) return `http://localhost:5000${img}`;
            return `http://localhost:5000/uploads/${img}`;
          });

          console.log("✅ Imágenes procesadas:", processedImages);
          return processedImages;
        }
      }

      // Fallback
      console.log("⚠️ Usando imagen de fallback");
      const sampleImages = {
        pulsera: "/images/products/Gemini_Generated_Image_hn9gvzhn9gvzhn9g.png",
        dije: "/images/products/Gemini_Image_j3wtxcj3wtxcj3wt.png",
        material: "/images/products/Gemini_Image_s1maars1maars1ma.png",
        combo: "/images/products/Gemini_Image_2rj99a2rj99a2rj9.png",
      };

      const imageKey = product.type || product.category || "pulsera";
      return [sampleImages[imageKey] || sampleImages.pulsera];
    };

    setImages(getProductImages());
    setCurrentImageIndex(0); // Resetear índice cuando cambia el producto
  }, [product]);

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
    if (images.length <= 1) return;

    setCurrentImageIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % images.length;
      console.log("➡️ Navegando a imagen:", newIndex, "URL:", images[newIndex]);
      return newIndex;
    });
  };

  const prevImage = () => {
    if (images.length <= 1) return;

    setCurrentImageIndex((prevIndex) => {
      const newIndex = (prevIndex - 1 + images.length) % images.length;
      console.log("⬅️ Navegando a imagen:", newIndex, "URL:", images[newIndex]);
      return newIndex;
    });
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
            height: 250,
            cursor: "pointer",
            overflow: "hidden",
            backgroundColor: "grey.100",
          }}
          onClick={() => openImageDialog(0)}
        >
          <img
            src={images[0]} // Usar imágenes[0] directamente
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={(e) => {
              console.error("Error cargando imagen principal:", images[0]);
              e.target.src = "/images/placeholder-bracelet.jpg"; // Verifica que esta ruta sea correcta
            }}
          />
          {/* <ImageWithFallback
            src={images[0]}
            alt={product.name}
            fallbackSrc="/images/placeholder-bracelet.jpg"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          /> */}
          {images.length > 1 && (
            <Chip
              label={`${images.length} imágenes`}
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(0,0,0,0.7)",
                color: "white",
                fontSize: "0.7rem",
              }}
            />
          )}
        </Box>

        <CardContent
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}
        >
          {/* ... (el resto del contenido de la tarjeta permanece igual) */}
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
            {/* PRECIO PRINCIPAL EN BS */}
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

      {/* Diálogo del carrusel - VERSIÓN CORREGIDA */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: "90vh",
          },
        }}
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
            minHeight={400}
            sx={{ py: 2 }}
          >
            {images.length > 1 && (
              <IconButton
                onClick={prevImage}
                sx={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1,
                  bgcolor: "rgba(255,255,255,0.9)",
                  "&:hover": { bgcolor: "white" },
                  boxShadow: 2,
                }}
              >
                <NavigateBefore />
              </IconButton>
            )}

            {/* IMAGEN PRINCIPAL - FORZAR RE-RENDER CON KEY ÚNICO */}
            <Box
              key={`image-${currentImageIndex}`}
              sx={{ width: "100%", textAlign: "center" }}
            >
              <img
                src={images[currentImageIndex]}
                alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                  display: "block",
                  margin: "0 auto",
                }}
                onError={(e) => {
                  console.error(
                    "❌ Error cargando imagen:",
                    images[currentImageIndex]
                  );
                  e.target.src = "/images/placeholder-bracelet.jpg";
                }}
              />
            </Box>

            {images.length > 1 && (
              <IconButton
                onClick={nextImage}
                sx={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1,
                  bgcolor: "rgba(255,255,255,0.9)",
                  "&:hover": { bgcolor: "white" },
                  boxShadow: 2,
                }}
              >
                <NavigateNext />
              </IconButton>
            )}
          </Box>

          {/* Indicador de posición y miniaturas */}
          {images.length > 1 && (
            <Box textAlign="center" mt={2}>
              <Chip
                label={`${currentImageIndex + 1} / ${images.length}`}
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />

              {/* Miniaturas */}
              <Box
                display="flex"
                justifyContent="center"
                gap={1}
                flexWrap="wrap"
              >
                {images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 60,
                      height: 60,
                      cursor: "pointer",
                      border:
                        index === currentImageIndex
                          ? "2px solid #e91e63"
                          : "1px solid #ddd",
                      borderRadius: 1,
                      overflow: "hidden",
                      opacity: index === currentImageIndex ? 1 : 0.7,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        opacity: 1,
                        borderColor: "#e91e63",
                      },
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
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
