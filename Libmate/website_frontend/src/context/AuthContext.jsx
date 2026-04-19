// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      
      toast.success(`Welcome back, ${data.user.full_name}!`);
      return { success: true, data };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      
      toast.success('Registration successful! Welcome to LibMate!');
      return { success: true, data };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await usersAPI.updateProfile(profileData);
      // Refresh user data
      const userResponse = await authAPI.getCurrentUser();
      setUser(userResponse.user);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    setUser,
    loading,
    token,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin' || user?.email?.includes('libmate.edu'),
    isMember: user?.role === 'member',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};