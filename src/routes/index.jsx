import { Suspense, lazy } from "react";
import { Navigate, useRoutes, useLocation } from "react-router-dom";

import LoadingScreen from "../components/LoadingScreen";
import MainLayout from "../layout/Main";
import ProtectedRoute from "../components/ProtectedRoute";


const Loadable = (Component) => (props) => {
  const { pathname } = useLocation();

  return (
    <Suspense
      fallback={<LoadingScreen isDashboard={pathname.includes("/dashboard")} />}
    >
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    
    {
      path: "login",
      element: <LoginPage />,
    },
    {
      path: "register",
      element: <RegisterPage />,
    },
    
    
    {
      path: "/",
      element: <MainLayout />,
      children: [
        { element: <HomePage />, index: true },
        { element: <ProductsOverview />, path: "products" },
        { element: <CategoryPage />, path: "category/:slug" },
        { element: <ConsultPage />, path: "consult" },
        { element: <ProductDetail />, path: "product/:id" },
        { element: <SearchResults />, path: "search" },

        {
          element: (
            <ProtectedRoute requiredRole="USER">
              <CartPage />
            </ProtectedRoute>
          ),
          path: "cart",
        },
        {
          element: (
            <ProtectedRoute requiredRole="USER">
              <CheckoutPage />
            </ProtectedRoute>
          ),
          path: "checkout",
        },

        
        
        {
          element: (
            <ProtectedRoute requiredRole="USER">
              <UserProfilePage />
            </ProtectedRoute>
          ),
          path: "profile",
        },
        
        
        {
          element: (
            <ProtectedRoute requiredRole="USER">
              <UserOrderPage />
            </ProtectedRoute>
          ),
          path: "orders",
        },
        {
          element: (
            <ProtectedRoute requiredRole="USER">
              <UserAddressesPage />
            </ProtectedRoute>
          ),
          path: "addresses",
        },
        {
          element: (
            <ProtectedRoute requiredRole="USER">
              <VaccinationSchedulePage />
            </ProtectedRoute>
          ),
          path: "vaccination-schedule",
        },
      ],
    },
    
    
    {
      path: "/admin",
      element: (
        <ProtectedRoute requiredRole="ADMIN">
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { element: <AdminDashboard />, index: true },
        { element: <AdminDashboard />, path: "dashboard" },
        { element: <AdminUsersPage />, path: "users" },
        { element: <AdminOrdersPage />, path: "orders" },
        { element: <AdminProductsPage />, path: "products" },
        { element: <AdminCategoriesPage />, path: "categories" },
        { element: <AdminManufacturersPage />, path: "manufacturers" },
        { element: <AdminReportsPage />, path: "reports" },
        { element: <AdminSupportPage />, path: "support" },
        { element: <AdminSettingsPage />, path: "settings" },
      ],
    },
    
    
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}



const HomePage = Loadable(lazy(() => import("../pages/HomePage")));
const ProductsOverview = Loadable(lazy(() => import("../pages/ProductsOverview")));
const LoginPage = Loadable(lazy(() => import("../pages/Login")));
const RegisterPage = Loadable(lazy(() => import("../pages/Register")));
const CategoryPage = Loadable(lazy(() => import("../pages/CategoryPage")));
const ConsultPage = Loadable(lazy(() => import("../pages/ConsultPage")));
const ProductDetail = Loadable(lazy(() => import("../pages/ProductDetail")));
const SearchResults = Loadable(lazy(() => import("../components/SearchResults")));
const CartPage = Loadable(lazy(() => import("../pages/CartPage")));
const CheckoutPage = Loadable(lazy(() => import("../pages/CheckoutPage")));


const MainLayout = Loadable(lazy(() => import("../layout/Main")));
const AdminLayout = Loadable(lazy(() => import("../pages/Admin")));


const UserProfilePage = Loadable(lazy(() => import("../pages/UserProfile")));
const UserOrderPage = Loadable(lazy(() => import("../pages/UserOrder")));
const UserAddressesPage = Loadable(lazy(() => import("../pages/UserAddresses")));
const VaccinationSchedulePage = Loadable(lazy(() => import("../pages/VaccinationSchedule")));


const AdminDashboard = Loadable(lazy(() => import("../pages/Admin/AdminDashboard")));
const AdminUsersPage = Loadable(lazy(() => import("../pages/Admin/AdminUsers")));
 
const AdminOrdersPage = Loadable(lazy(() => import("../pages/Admin/AdminOrders")));
const AdminProductsPage = Loadable(lazy(() => import("../pages/Admin/AdminProducts")));
const AdminCategoriesPage = Loadable(lazy(() => import("../pages/Admin/AdminCategories")));
const AdminManufacturersPage = Loadable(lazy(() => import("../pages/Admin/AdminManufacter")));
const AdminReportsPage = Loadable(lazy(() => import("../pages/Admin/AdminReports")));
const AdminSupportPage = Loadable(lazy(() => import("../pages/Admin/AdminSupport")));
const AdminSettingsPage = Loadable(lazy(() => import("../pages/Admin/AdminSettings")));
