import React, { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Toaster } from "sonner";
import { Toaster as LegacyToaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";
import { WalletProvider } from "./contexts/WalletContext";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import CuisineCategory from "./components/CuisineCategory";
import PromotionalBanner from "./components/PromotionalBanner";
import RestaurantList from "./components/RestaurantList";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import ProtectedAdminRoute from "./components/shared/ProtectedAdminRoute";
import OfflineBanner from "./components/shared/OfflineBanner";
import PageSkeleton from "./components/shared/PageSkeleton";

const AdminPanel = lazy(() => import("./components/admin/AdminPanel"));
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const RestaurantDetail = lazy(() => import("./components/customer/RestaurantDetail"));
const NotFound = lazy(() => import("./components/NotFound"));
const TermsConditions = lazy(() => import("./components/legal/TermsConditions"));
const PrivacyPolicy = lazy(() => import("./components/legal/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./components/legal/CookiePolicy"));
const RefundCancellationPolicy = lazy(() => import("./components/legal/RefundCancellationPolicy"));
const ShippingDeliveryPolicy = lazy(() => import("./components/legal/ShippingDeliveryPolicy"));
const GrievanceOfficer = lazy(() => import("./components/legal/GrievanceOfficer"));

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>serveDoor - Food Delivery</title>
        <meta
          name="description"
          content="Order food from top restaurants with fast delivery on serveDoor."
        />
      </Helmet>
      <Header />
      <HeroBanner />
      <CuisineCategory />
      <PromotionalBanner />
      <RestaurantList />
      <Footer />
    </div>
  );
};

const AdminLoginPage = () => {
  const navigate = useNavigate();
  return <AdminLogin onLoginSuccess={() => navigate("/admin")} />;
};

/**
 * RoutesWithErrorBoundary wraps routes with ErrorBoundary
 * The key prop resets the boundary on navigation
 */
function RoutesWithErrorBoundary() {
  const location = useLocation();
  
  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/refund-cancellation-policy" element={<RefundCancellationPolicy />} />
          <Route path="/shipping-delivery-policy" element={<ShippingDeliveryPolicy />} />
          <Route path="/grievance-officer" element={<GrievanceOfficer />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <WalletProvider>
              <BrowserRouter>
                <OfflineBanner />
                <RoutesWithErrorBoundary />
                <Toaster richColors closeButton duration={4000} />
                <LegacyToaster />
              </BrowserRouter>
            </WalletProvider>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;