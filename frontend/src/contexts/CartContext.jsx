import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({
    official: 170,
    parallel: 280,
    lastUpdated: null,
  });

  useEffect(() => {
    loadExchangeRates();
    const interval = setInterval(loadExchangeRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadExchangeRates = async () => {
    try {
      console.log("🔄 Cargando tasas de cambio...");
      const [officialRes, parallelRes] = await Promise.all([
        fetch("https://ve.dolarapi.com/v1/dolares/oficial"),
        fetch("https://ve.dolarapi.com/v1/dolares/paralelo"),
      ]);

      const officialData = await officialRes.json();
      const parallelData = await parallelRes.json();

      const newRates = {
        official:
          officialData.promedio_real ||
          officialData.promedio ||
          officialData.venta ||
          170,
        parallel:
          parallelData.promedio_real ||
          parallelData.promedio ||
          parallelData.venta ||
          280,
        lastUpdated: new Date(),
      };

      console.log("💱 Tasas cargadas:", newRates);
      setExchangeRates(newRates);
    } catch (error) {
      console.error("❌ Error cargando tasas de cambio:", error);
    }
  };

  // ✅ FUNCIÓN MEJORADA: Verificar si se puede agregar un producto
  const canAddToCart = (product, customization = {}) => {
    // 1. Verificar stock básico
    if (product.stock <= 0) {
      return { canAdd: false, reason: "AGOTADO" };
    }

    // 2. Verificar si ya existe en el carrito
    const existingItem = cartItems.find(
      (item) =>
        item.product.id === product.id &&
        JSON.stringify(item.customization) === JSON.stringify(customization)
    );

    if (existingItem) {
      // 3. Verificar stock disponible considerando lo ya en el carrito
      const totalRequested = existingItem.quantity + 1;
      if (totalRequested > product.stock) {
        return {
          canAdd: false,
          reason: "STOCK_INSUFICIENTE",
          available: product.stock,
          requested: totalRequested,
        };
      }
    } else {
      // 4. Para nuevo item, verificar que haya al menos 1 disponible
      if (product.stock < 1) {
        return { canAdd: false, reason: "AGOTADO" };
      }
    }

    return { canAdd: true };
  };

  // Calcular el porcentaje de descuento real
  const calculateDiscountPercentage = () => {
    if (
      !exchangeRates.parallel ||
      !exchangeRates.official ||
      exchangeRates.parallel === exchangeRates.official
    ) {
      return 40; // Descuento por defecto si no hay tasas
    }
    const discount =
      ((exchangeRates.parallel - exchangeRates.official) /
        exchangeRates.parallel) *
      100;
    return Math.min(Math.max(discount, 35), 45); // Limitar entre 35% y 45%
  };

  // Calcular precio con descuento para métodos USD
  const calculateDiscountedPriceUSD = (priceUSD) => {
    const discountPercentage = calculateDiscountPercentage();
    const discountedPrice = priceUSD * (1 - discountPercentage / 100);

    return {
      originalPriceUSD: parseFloat(priceUSD),
      discountedPriceUSD: parseFloat(discountedPrice.toFixed(2)),
      discountPercentage: parseFloat(discountPercentage.toFixed(1)),
      priceBSOfficial: priceUSD * exchangeRates.official,
      priceBSParallel: priceUSD * exchangeRates.parallel,
      savingsAmountBS:
        priceUSD * exchangeRates.parallel - priceUSD * exchangeRates.official,
      savingsAmountUSD: priceUSD - discountedPrice,
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
        amountBS: discountInfo.savingsAmountBS,
      },

      // Información de tasas
      rates: {
        official: exchangeRates.official,
        parallel: exchangeRates.parallel,
      },

      // Precios de referencia
      priceBSParallel: discountInfo.priceBSParallel,
    };
  };

  // Calcular para el carrito completo
  const calculateCartPriceInfo = () => {
    const totalOriginalUSD = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return calculatePriceInfo(totalOriginalUSD);
  };

  const addToCart = (product, customization = {}) => {
    const validation = canAddToCart(product, customization);

    if (!validation.canAdd) {
      switch (validation.reason) {
        case "AGOTADO":
          alert(
            "❌ Este producto está agotado y no se puede agregar al carrito"
          );
          return;
        case "STOCK_INSUFICIENTE":
          alert(
            `⚠️ No hay suficiente stock. Solo quedan ${validation.available} unidades disponibles.`
          );
          return;
        default:
          alert("❌ No se puede agregar este producto al carrito");
          return;
      }
    }

    const customId = `${product.id}-${Date.now()}-${JSON.stringify(
      customization
    )}`;
    const finalPriceUSD = calculateCustomPrice(
      product.basePrice,
      customization
    );
    const priceInfo = calculatePriceInfo(finalPriceUSD);

    let productImage = "/images/placeholder-bracelet.jpg";

    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.startsWith("http")) {
        productImage = firstImage;
      } else if (firstImage.startsWith("/")) {
        productImage = `http://localhost:5000${firstImage}`;
      } else {
        productImage = `http://localhost:5000/uploads/${firstImage}`;
      }
    }

    // Verificar si ya existe para actualizar cantidad
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.product.id === product.id &&
        JSON.stringify(item.customization) === JSON.stringify(customization)
    );

    if (existingItemIndex !== -1) {
      // Actualizar cantidad existente
      setCartItems((prev) =>
        prev.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                priceInfo: calculatePriceInfo(item.price),
              }
            : item
        )
      );
    } else {
      // Agregar nuevo item
      const newItem = {
        id: customId,
        product: product,
        customization: customization,
        quantity: 1,
        price: finalPriceUSD,
        image: productImage,
        priceInfo: priceInfo,
      };

      setCartItems((prev) => [...prev, newItem]);
    }

    setIsCartOpen(true);
  };

  // ✅ FUNCIÓN ÚNICA DE VALIDACIÓN (eliminar las duplicadas)
  const validateCart = () => {
    const issues = [];

    cartItems.forEach((item) => {
      if (item.product.stock <= 0) {
        issues.push({
          product: item.product.name,
          issue: "AGOTADO",
          message: "Este producto ya no está disponible",
        });
      } else if (item.quantity > item.product.stock) {
        issues.push({
          product: item.product.name,
          issue: "STOCK_INSUFICIENTE",
          message: `Solo ${item.product.stock} disponibles (solicitados: ${item.quantity})`,
        });
      }
    });

    return issues;
  };

  const removeOutOfStockItems = () => {
    setCartItems((prev) => prev.filter((item) => item.product.stock > 0));
  };

  const calculateCustomPrice = (basePrice, customization) => {
    let finalPrice = parseFloat(basePrice);

    if (customization.material && customization.material !== "standard") {
      const material = customization.product?.availableMaterials?.find(
        (m) => m.name === customization.material
      );
      if (material && material.priceAdjustment) {
        finalPrice += parseFloat(material.priceAdjustment);
      }
    }

    if (customization.charms && customization.charms.length > 0) {
      customization.charms.forEach((charm) => {
        finalPrice += parseFloat(charm.basePrice || 0);
      });
    }

    return finalPrice;
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;

    // Verificar stock máximo disponible
    if (newQuantity > item.product.stock) {
      alert(
        `❌ No hay suficiente stock. Máximo disponible: ${item.product.stock} unidades`
      );
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              priceInfo: calculatePriceInfo(item.price),
            }
          : item
      )
    );
  };

  // ✅ FUNCIÓN MEJORADA: Sincronizar stock del carrito
  const syncCartWithStock = (updatedProducts) => {
    setCartItems((prev) => {
      const updatedCart = prev
        .map((item) => {
          const updatedProduct = updatedProducts.find(
            (p) => p.id === item.product.id
          );
          if (updatedProduct) {
            // Actualizar información del producto
            return {
              ...item,
              product: updatedProduct,
              // Ajustar cantidad si excede el nuevo stock
              quantity: Math.min(item.quantity, updatedProduct.stock),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // Remover items con cantidad 0

      return updatedCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotalUSD = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
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
    loadExchangeRates,
    removeOutOfStockItems,
    canAddToCart, // ← FUNCIÓN DE VALIDACIÓN PARA AGREGAR
    syncCartWithStock, // ← SINCRONIZACIÓN DE STOCK
    validateCart, // ← VALIDACIÓN COMPLETA DEL CARRITO
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};