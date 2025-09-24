import React from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
} from "@mui/material";
import { Favorite, ShoppingCart, Star } from "@mui/icons-material";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box className="roxo-gradient-bg" sx={{ color: "white", py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" gutterBottom>
                ROXO | Bisutería
              </Typography>
              <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Accesorios Únicos y Personalizados
              </Typography>
              <Typography variant="h6" sx={{ mb: 4 }}>
                ¿Buscas algo especial? ¡Contáctame para crear tú accesorio
                ideal!✨
              </Typography>
              <Button
                component={Link}
                to="/tienda"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <ShoppingCart sx={{ mr: 1 }} />
                Explorar Productos
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/api/placeholder/500/400"
                alt="Pulseras personalizadas"
                sx={{
                  width: "100%",
                  borderRadius: 4,
                  boxShadow: 6,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          className="roxo-text-gradient"
        >
          ¿Por Qué Elegirnos?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: "center", p: 3 }}>
              <Favorite color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Hecho con Amor
              </Typography>
              <Typography>
                Cada pieza es creada artesanalmente con atención a los detalles
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: "center", p: 3 }}>
              <Star color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Totalmente Personalizable
              </Typography>
              <Typography>
                Elige diseños, colores y materiales según tu estilo único
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: "center", p: 3 }}>
              <ShoppingCart color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Múltiples Métodos de Pago
              </Typography>
              <Typography>
                Pago Móvil, Zelle, Criptomonedas y Efectivo
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
