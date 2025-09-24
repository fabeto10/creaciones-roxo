import React, { useState } from 'react';
import { Box } from '@mui/material';

const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackSrc = '/images/placeholder-product.jpg',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setImgSrc(fallbackSrc);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <Box position="relative" {...props}>
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
        >
          Cargando...
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
          transition: 'opacity 0.3s'
        }}
      />
    </Box>
  );
};

export default ImageWithFallback;