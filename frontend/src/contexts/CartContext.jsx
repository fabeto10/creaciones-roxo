import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({
    official: 170,
    parallel: 280,
    lastUpdated: null
  });

  useEffect(() => {
    loadExchangeRates();
    const interval = setInterval(loadExchangeRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadExchangeRates = async () => {
    try {
      console.log('🔄 Cargando tasas de cambio...');
      const [officialRes, parallelRes] = await Promise.all([
        fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
        fetch('https://ve.dolarapi.com/v1/dolares/paralelo')
      ]);
      
      const officialData = await officialRes.json();
      const parallelData = await parallelRes.json();
      
      const newRates = {
        official: officialData.promedio_real || officialData.promedio || officialData.venta || 170,
        parallel: parallelData.promedio_real || parallelData.promedio || parallelData.venta || 280,
        lastUpdated: new Date()
      };
      
      console.log('💱 Tasas cargadas:', newRates);
      setExchangeRates(newRates);
    } catch (error) {
      console.error('❌ Error cargando tasas de cambio:', error);
    }
  };

  // Calcular el porcentaje de descuento real
  const calculateDiscountPercentage = () => {
    if (!exchangeRates.parallel || !exchangeRates.official || exchangeRates.parallel === exchangeRates.official) {
      return 40; // Descuento por defecto si no hay tasas
    }
    const discount = ((exchangeRates.parallel - exchangeRates.official) / exchangeRates.parallel) * 100;
    return Math.min(Math.max(discount, 35), 45); // Limitar entre 35% y 45%
  };

  // Calcular precio con descuento para métodos USD
  const calculateDiscountedPriceUSD = (priceUSD) => {
    const discountPercentage = calculateDiscountPercentage();
    const discountedPrice = priceUSD * (1 - (discountPercentage / 100));
    
    return {
      originalPriceUSD: parseFloat(priceUSD),
      discountedPriceUSD: parseFloat(discountedPrice.toFixed(2)),
      discountPercentage: parseFloat(discountPercentage.toFixed(1)),
      priceBSOfficial: priceUSD * exchangeRates.official,
      priceBSParallel: priceUSD * exchangeRates.parallel,
      savingsAmountBS: (priceUSD * exchangeRates.parallel) - (priceUSD * exchangeRates.official),
      savingsAmountUSD: priceUSD - discountedPrice
    };
  };

  // Calcular información completa de precios
  const calculatePriceInfo = (priceUSD) => {
    const discountInfo = calculateDiscountedPriceUSD(priceUSD);
    
    return {
      // Precio principal (en BS a tasa oficial) - para mostrar como precio "normal"
      priceBS: discountInfo.priceBSOfficial,
      
      // Precios en USD
      originalPriceUSD: discountInfo.originalPriceUSD,
      discountedPriceUSD: discountInfo.discountedPriceUSD,
      
      // Información de descuento
      discount: {
        percentage: discountInfo.discountPercentage,
        amountUSD: discountInfo.savingsAmountUSD,
        amountBS: discountInfo.savingsAmountBS
      },
      
      // Información de tasas
      rates: {
        official: exchangeRates.official,
        parallel: exchangeRates.parallel
      },
      
      // Precios de referencia
      priceBSParallel: discountInfo.priceBSParallel
    };
  };

  // Calcular para el carrito completo
  const calculateCartPriceInfo = () => {
    const totalOriginalUSD = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    return calculatePriceInfo(totalOriginalUSD);
  };

  const addToCart = (product, customization = {}) => {
    const customId = `${product.id}-${Date.now()}`;
    const finalPriceUSD = calculateCustomPrice(product.basePrice, customization);
    const priceInfo = calculatePriceInfo(finalPriceUSD);
    
    let productImage = '/images/placeholder-bracelet.jpg';
    
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.startsWith('http')) {
        productImage = firstImage;
      } else if (firstImage.startsWith('/')) {
        productImage = `http://localhost:5000${firstImage}`;
      } else {
        productImage = `http://localhost:5000/uploads/${firstImage}`;
      }
    }

    const newItem = {
      id: customId,
      product: product,
      customization: customization,
      quantity: 1,
      price: finalPriceUSD, // Precio original en USD
      image: productImage,
      priceInfo: priceInfo
    };
    
    setCartItems(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const calculateCustomPrice = (basePrice, customization) => {
    let finalPrice = parseFloat(basePrice);
    
    if (customization.material && customization.material !== 'standard') {
      const material = customization.product?.availableMaterials?.find(m => m.name === customization.material);
      if (material && material.priceAdjustment) {
        finalPrice += parseFloat(material.priceAdjustment);
      }
    }
    
    if (customization.charms && customization.charms.length > 0) {
      customization.charms.forEach(charm => {
        finalPrice += parseFloat(charm.basePrice || 0);
      });
    }
    
    return finalPrice;
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { 
        ...item, 
        quantity: newQuantity,
        priceInfo: calculatePriceInfo(item.price)
      } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotalUSD = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotalUSD,
    cartCount: getCartCount(),
    exchangeRates,
    calculatePriceInfo,
    calculateCartPriceInfo,
    calculateDiscountPercentage,
    loadExchangeRates
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};