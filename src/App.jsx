import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/Main';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ConsultPage from './pages/ConsultPage';
import ChatPage from './pages/ChatPage';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import SearchResults from './components/SearchResults';
import ProtectedRoute from './components/ProtectedRoute';
import ProductsOverview from './pages/ProductsOverview';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Profile from './pages/Profile';
import UserOrder from './pages/UserOrder';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="/*" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route
              path="consult"
              element={
                <ProtectedRoute requiredRole="USER">
                  <ConsultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="chat/:partner"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="products" element={<ProductsOverview />} />
            <Route path="search" element={<SearchResults />} />

            <Route
              path="cart"
              element={
                <ProtectedRoute requiredRole="USER">
                  <CartPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="checkout"
              element={
                <ProtectedRoute requiredRole="USER">
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="profile"
              element={
                <ProtectedRoute requiredRole="USER">
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="orders"
              element={
                <ProtectedRoute requiredRole="USER">
                  <UserOrder />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
