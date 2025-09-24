import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // Breakpoints para responsividad
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  // Paleta de colores femenina original
  // Paleta de colores más elegante y oscura
  palette: {
    primary: {
      main: "#7b1fa2", // Morado más oscuro y elegante
      light: "#ae52d4",
      dark: "#4a0072",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ab47bc", // Morado secundario
      light: "#df78ef",
      dark: "#790e8b",
      contrastText: "#ffffff",
    },
    background: {
      default: "#fafafa", // Fondo más neutro
      paper: "#ffffff",
    },
    text: {
      primary: "#2c2c2c", // Texto más oscuro
      secondary: "#666666",
    },
  },

  // Tipografía elegante
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: "2.5rem",
      "@media (max-width: 600px)": {
        fontSize: "2rem",
      },
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: "2.2rem",
      "@media (max-width: 600px)": {
        fontSize: "1.8rem",
      },
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: "2rem",
      "@media (max-width: 600px)": {
        fontSize: "1.6rem",
      },
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: "1.8rem",
      "@media (max-width: 600px)": {
        fontSize: "1.4rem",
      },
    },
    h5: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
      fontSize: "1.5rem",
      "@media (max-width: 600px)": {
        fontSize: "1.3rem",
      },
    },
    h6: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
      fontSize: "1.3rem",
      "@media (max-width: 600px)": {
        fontSize: "1.1rem",
      },
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
      fontSize: "1rem",
      "@media (max-width: 600px)": {
        fontSize: "0.9rem",
      },
    },
    body1: {
      fontSize: "1rem",
      "@media (max-width: 600px)": {
        fontSize: "0.9rem",
      },
    },
    body2: {
      fontSize: "0.875rem",
      "@media (max-width: 600px)": {
        fontSize: "0.8rem",
      },
    },
  },

  // Bordes redondeados suaves
  shape: {
    borderRadius: 12,
  },

  // Componentes personalizados
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(123, 31, 162, 0.15)",
          background: "linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)",
          borderRadius: "0px", // Eliminar bordes redondeados
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Reducir bordes redondeados
          padding: "8px 20px",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(123, 31, 162, 0.3)",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          },
          "@media (max-width: 599px)": {
            margin: "4px",
            borderRadius: 12,
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)",
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            "&:hover fieldset": {
              borderColor: "#e91e63",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#e91e63",
            },
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          "@media (max-width: 600px)": {
            borderRadius: 12,
          },
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
        elevation2: {
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        },
        elevation3: {
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        outlined: {
          borderColor: "#e91e63",
          color: "#e91e63",
          "&:hover": {
            backgroundColor: "rgba(233, 30, 99, 0.04)",
          },
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: "16px 0 0 16px",
          "@media (max-width: 600px)": {
            borderRadius: "12px 0 0 12px",
          },
        },
      },
    },
  },
});

export default theme;
