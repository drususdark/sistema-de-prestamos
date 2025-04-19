import React, { createContext, useState, useEffect, useContext } from 'react';
import ApiService from '../services/ApiService';

// Crear contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un usuario autenticado al cargar
  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const auth = await ApiService.verificarToken();
        if (auth.success) {
          setUser(auth.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setError('Error al verificar autenticación');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verificarAuth();
  }, []);

  // Iniciar sesión
  const login = async (usuario, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.login(usuario, password);
      
      if (response.success) {
        setUser(response.user);
        return { success: true };
      } else {
        setError(response.message || 'Error al iniciar sesión');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión');
      return { success: false, message: 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = () => {
    try {
      ApiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Valor del contexto
  const value = {
    user,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
