import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('store_rating_user');
    const storedToken = localStorage.getItem('store_rating_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      localStorage.setItem('store_rating_user', JSON.stringify(data.user));
      localStorage.setItem('store_rating_token', data.token);

      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, address, password) => {
    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: { name, email, address, password }
      });

      localStorage.setItem('store_rating_user', JSON.stringify(data.user));
      localStorage.setItem('store_rating_token', data.token);

      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('store_rating_user');
    localStorage.removeItem('store_rating_token');
    setUser(null);
    setToken(null);
  };

  const updatePassword = async (newPassword) => {
    try {
      await apiFetch('/auth/password', {
        method: 'PUT',
        body: { password: newPassword }
      });
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
