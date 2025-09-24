import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import { ShoppingCart, Build, Favorite } from "@mui/icons-material"; // Icono corregido
import BraceletCustomizer from "./BraceletCustomizer";
import ImageWithFallback from "../common/ImageWithFallback";

const ProductCard = ({ product }) => {
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Agrega esta función para obtener imágenes de muestra
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return `http://localhost:5000${product.images[0]}`;
    }

    // Imágenes de muestra basadas en el tipo de producto
    const sampleImages = {
      pulsera: "/images/products/Gemini_Generated_Image_hn9gvzhn9gvzhn9g.png",
      dije: "/images/products/Gemini_Generated_Image_j3wtxcj3wtxcj3wt.png",
      material: "/images/products/Gemini_Generated_Image_s1maars1maars1ma.png",
      combo: "/images/products/Gemini_Generated_Image_2rj99a2rj99a2rj9.png",
    };

    return sampleImages[product.type] || "/images/placeholder-bracelet.jpg";
  };

  const handleAddToCart = () => {
    if (product.customizable) {
      setCustomizerOpen(true);
    } else {
      // Agregar producto simple al carrito
      // addToCart(product);
    }
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
        <ImageWithFallback
          src={
            product.images && product.images.length > 0
              ? `http://localhost:5000${product.images[0]}`
              : "/images/placeholder-bracelet.jpg"
          }
          alt={product.name}
          height={200}
          fallbackSrc="/images/placeholder-bracelet.jpg"
          sx={{
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        />

        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            p: 2,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              {product.name}
            </Typography>

            <Typography variant="body2" color="textSecondary" paragraph>
              {product.description}
            </Typography>

            {product.customizable && (
              <Chip
                label="✨ Personalizable"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            )}

            {product.tags &&
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

          <Box sx={{ mt: "auto", pt: 1 }}>
            <Typography
              variant="h5"
              color="primary"
              gutterBottom
              fontWeight="600"
            >
              ${product.basePrice}
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
