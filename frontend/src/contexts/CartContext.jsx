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
        official: officialData.promedio || 170,
        parallel: parallelData.promedio || 280,
        lastUpdated: new Date()
      };
      
      console.log('💱 Tasas cargadas:', newRates);
      setExchangeRates(newRates);
    } catch (error) {
      console.error('❌ Error cargando tasas de cambio:', error);
    }
  };

  // Calcular precios para diferentes métodos de pago
  const calculatePriceInfo = (priceUSD) => {
    const priceBSOfficial = priceUSD * exchangeRates.official;
    const priceBSParallel = priceUSD * exchangeRates.parallel;
    const savingsAmount = priceBSParallel - priceBSOfficial;
    const savingsPercentage = ((savingsAmount / priceBSParallel) * 100).toFixed(1);
    
    return {
      // Precio principal (en BS a tasa oficial)
      priceBS: priceBSOfficial,
      // Precio en USD (para métodos USD)
      priceUSD: priceUSD,
      // Información de ahorro (si paga en USD)
      savings: {
        amount: savingsAmount,
        percentage: savingsPercentage,
        priceBSParallel: priceBSParallel
      },
      // Tasas utilizadas
      rates: {
        official: exchangeRates.official,
        parallel: exchangeRates.parallel
      }
    };
  };

  // Calcular precio para el carrito completo
  const calculateCartPriceInfo = () => {
    const totalUSD = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    return calculatePriceInfo(totalUSD);
  };

  const addToCart = (product, customization = {}) => {
    const customId = `${product.id}-${Date.now()}`;
    const finalPriceUSD = calculateCustomPrice(product.basePrice, customization);
    const priceInfo = calculatePriceInfo(finalPriceUSD);
    
    // Construir URL correcta para la imagen
    let productImage = '/images/placeholder-bracelet.jpg';
    
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.startsWith('http')) {
        productImage = firstImage;
      } else if (firstImage.startsWith('/uploads/')) {
        productImage = `http://localhost:5000${firstImage}`;
      } else {
        productImage = `http://localhost:5000/uploads/${firstImage}`;
      }
    }

    const newItem = {
      id: customId,
      product: product,
      customization: {
        material: customization.material || product.availableMaterials?.[0]?.name || 'standard',
        color: customization.color || product.availableColors?.[0] || 'standard',
        charms: customization.charms || [],
        notes: customization.notes || ''
      },
      quantity: 1,
      price: finalPriceUSD, // Precio en USD
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
    loadExchangeRates
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};