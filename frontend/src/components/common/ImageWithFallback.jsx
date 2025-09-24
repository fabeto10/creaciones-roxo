import React, { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackSrc = '/images/placeholder-bracelet.jpg',
  style = {},
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setImgSrc(fallbackSrc);
      setError(true);
    }
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  return (
    <Box 
      position="relative" 
      width="100%" 
      height="100%"
      {...props}
    >
      {loading && (
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          bgcolor="grey.100"
          zIndex={1}
        >
          <Box textAlign="center">
            <CircularProgress size={24} />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Cargando...
            </Typography>
          </Box>
        </Box>
      )}
      
      <img
        src={imgSrc || fallbackSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          ...style
        }}
      />
      
      {error && (
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          bgcolor="grey.50"
          zIndex={0}
        >
          <Typography variant="body2" color="textSecondary">
            Imagen no disponible
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ImageWithFallback;