import React, { createContext, useState, useContext } from 'react';

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

  const addToCart = (product, customization = {}) => {
    const customId = `${product.id}-${Date.now()}`;
    const finalPrice = calculateCustomPrice(product.basePrice, customization);
    
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
      price: finalPrice,
      image: product.images?.[0] || '/placeholder-bracelet.jpg'
    };
    
    setCartItems(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const calculateCustomPrice = (basePrice, customization) => {
    let finalPrice = parseFloat(basePrice);
    
    // Precio por material seleccionado
    if (customization.material && customization.material !== 'standard') {
      const material = customization.product?.availableMaterials?.find(m => m.name === customization.material);
      if (material && material.priceAdjustment) {
        finalPrice += parseFloat(material.priceAdjustment);
      }
    }
    
    // Precio por dijes adicionales
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
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
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
    getCartTotal,
    cartCount: getCartCount()
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};