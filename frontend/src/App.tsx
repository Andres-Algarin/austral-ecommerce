import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import SiteLayout from "./components/SiteLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ResetPassword from "./pages/Login/ResetPassword";
import Register from "./pages/Registrer/Register";
import Profile from "./pages/Profile/Profile";
import Admin from "./pages/Admin/Admin";
import OurIngredients from "./pages/OurIngredients/OurIngredients";
import Products from "./pages/Products/Products";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Categories from "./pages/Categories/Categories";
import CategoryDetail from "./pages/Categories/CategoryDetail";
import About from "./pages/About/About";
import FAQ from "./pages/FAQ/FAQ";
import Legal from "./pages/Legal/Legal";
import Cart from "./pages/Shop/Cart";
import Checkout from "./pages/Shop/Checkout";
import MyOrders from "./pages/Shop/MyOrders";
import OrderDetail from "./pages/Shop/OrderDetail";

function AdminRoute() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: "/admin" }} />;
  }

  if (usuario.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Admin />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* Páginas de la tienda: comparten navbar fijo y footer */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />

          {/* Tienda */}
          <Route path="/productos" element={<Products />} />
          <Route path="/productos/:id" element={<ProductDetail />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/categorias/:id" element={<CategoryDetail />} />
          <Route path="/carrito" element={<Cart />} />

          {/* Compra y cuenta (requieren sesión) */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-pedidos"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-pedidos/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Experiencia Austral */}
          <Route path="/quienes-somos" element={<About />} />
          <Route path="/valor-de-nuestros-ingredientes" element={<OurIngredients />} />
          <Route path="/preguntas-frecuentes" element={<FAQ />} />

          {/* Legal */}
          <Route path="/privacidad" element={<Legal tipo="privacidad" />} />
          <Route path="/terminos" element={<Legal tipo="terminos" />} />
          <Route path="/envios-cambios" element={<Legal tipo="envios" />} />
        </Route>

        {/* Pantallas completas sin navbar */}
        {/* Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
        <Route path="/restablecer-contrasena" element={<ResetPassword />} />

        <Route path="/admin" element={<AdminRoute />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
