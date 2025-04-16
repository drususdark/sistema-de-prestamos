// Solución para el problema de persistencia del formulario de login
// Este código debe ser implementado en el componente Login.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// ... otros imports necesarios

const Login = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Efecto para redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (user && !loading) {
      // Redirigir a la página principal si el usuario ya está autenticado
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      // La redirección se manejará en el useEffect
    } catch (error) {
      setError('Credenciales inválidas. Por favor intente nuevamente.');
      console.error('Error de login:', error);
    }
  };

  // Si está cargando, mostrar un indicador de carga
  if (loading) {
    return <div className="text-center p-5">Cargando...</div>;
  }

  // Si el usuario ya está autenticado, no renderizar el formulario
  // (esto es una protección adicional, aunque el useEffect debería redirigir)
  if (user) {
    return null;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white text-center">
              <h4>Sistema de Préstamos entre Locales</h4>
            </div>
            <div className="card-body">
              <h5 className="card-title text-center mb-4">Iniciar Sesión</h5>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <small>Ingrese con las credenciales proporcionadas para su local</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
