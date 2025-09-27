import { useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

const CartMigrationHandler = () => {
  const { user, isAuthenticated } = useAuth();
  const { migrateGuestCartToUser } = useCart();
  const hasMigratedRef = useRef(false); // ← Referencia para evitar múltiples migraciones

  useEffect(() => {
    // Condiciones de seguridad para evitar bucles
    if (!isAuthenticated || !user || !user.id || hasMigratedRef.current) {
      return;
    }

    // Verificar si ya hay un carrito de usuario
    const userCartKey = `cart_user_${user.id}`;
    const guestCart = localStorage.getItem("cart_guest");
    const userCart = localStorage.getItem(userCartKey);

    // Solo migrar si hay carrito de invitado y no hay carrito de usuario
    if (guestCart && !userCart) {
      console.log("🔄 CartMigrationHandler: Migrando carrito para usuario:", user.id);
      migrateGuestCartToUser(user.id);
      hasMigratedRef.current = true; // ← Marcar como migrado
    } else {
      console.log("✅ CartMigrationHandler: No es necesaria la migración");
      hasMigratedRef.current = true;
    }
  }, [isAuthenticated, user, migrateGuestCartToUser]); // ← Dependencias correctas

  return null;
};

export default CartMigrationHandler;