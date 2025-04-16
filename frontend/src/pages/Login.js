import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { usuario, password } = formData;
    await login(usuario, password);
    
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Card.Header className="text-center bg-primary text-white">
          <h4>Sistema de Préstamos entre Locales</h4>
        </Card.Header>
        <Card.Body>
          <h5 className="text-center mb-4">Iniciar Sesión</h5>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                placeholder="Ingrese su usuario"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingrese su contraseña"
                required
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer className="text-center text-muted">
          <small>Ingrese con las credenciales proporcionadas para su local</small>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Login;
