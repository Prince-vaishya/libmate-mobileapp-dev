import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout/Layout';
import MemberLayout from './components/Layout/MemberLayout';
import AuthLayout from './components/Layout/AuthLayout';
import AdminLayout from './components/Layout/AdminLayout';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import TrendingPage from './pages/TrendingPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import BookDetailPage from './pages/BookDetailPage';
import MyBooksPage from './pages/MyBooksPage';
import WishlistPage from './pages/WishlistPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Routes>
      {/* Public routes with Navbar + SearchBar */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogue" element={<CataloguePage />} />
        <Route path="trending" element={<TrendingPage />} />
        <Route path="new-arrivals" element={<NewArrivalsPage />} />
      </Route>

      {/* Member routes - Navbar ONLY, NO SearchBar */}
      <Route path="/" element={<MemberLayout />}>
        <Route path="book/:id" element={<BookDetailPage />} />
        <Route path="my-books" element={isAuthenticated ? <MyBooksPage /> : <Navigate to="/login" />} />
        <Route path="wishlist" element={isAuthenticated ? <WishlistPage /> : <Navigate to="/login" />} />
        <Route path="notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />} />
        <Route path="profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
      </Route>

      {/* Auth routes - NO Navbar or SearchBar */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/login" />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/" />}>
        <Route index element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <AppContent />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;