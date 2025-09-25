import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import theme from "./styles/theme";
import Header from "./components/common/Header";
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./styles/global.css";
import DesignManagement from "./pages/admin/DesignManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import StorePage from "./pages/customer/StorePage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import OrderConfirmationPage from "./pages/customer/OrderConfirmationPage";
import OrderHistoryPage from "./pages/customer/OrderHistoryPage";
import ExternalProductRequests from "./pages/admin/ExternalProductRequests";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/tienda" element={<StorePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/my-orders" element={<OrderHistoryPage />} />
              <Route
                path="/order-confirmation/:orderId"
                element={<OrderConfirmationPage />}
              />

              {/* Rutas protegidas de administración */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute adminOnly>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<ProductManagement />} />
                      <Route
                        path="products/new"
                        element={<ProductManagement />}
                      />
                      <Route path="designs" element={<DesignManagement />} />
                      <Route
                        path="customers"
                        element={<CustomerManagement />}
                      />
                      <Route path="payments" element={<PaymentManagement />} />
                      <Route
                        path="external-requests"
                        element={<ExternalProductRequests />}
                      />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
