import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import valesService from '../services/valesService';

const CrearVale = () => {
  const { user } = useAuth();
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState(['']);
  
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    local_destino_id: '',
    persona_responsable: ''
  });

  // Obtener lista de locales al cargar el componente
  useEffect(() => {
    const fetchLocales = async () => {
      try {
        const response = await axios.get('/api/usuarios');
        if (response.data.success) {
          setLocales(response.data.usuarios);
        }
      } catch (error) {
        console.error('Error al obtener locales:', error);
        setError('Error al cargar la lista de locales');
      }
    };

    fetchLocales();
  }, []);

  // Manejar cambios en el formulario principal
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Manejar cambios en los items de mercadería
  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  // Agregar un nuevo item
  const addItem = () => {
    setItems([...items, '']);
  };

  // Eliminar un item
  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    // Filtrar items vacíos
    const itemsValidos = items.filter(item => item.trim() !== '');
    
    if (itemsValidos.length === 0) {
      setError('Debe agregar al menos un item de mercadería');
      setLoading(false);
      return;
    }
    
    try {
      const valeData = {
        ...formData,
        items: itemsValidos
      };
      
      const response = await valesService.crearVale(valeData);
      
      if (response.success) {
        setSuccess(true);
        // Resetear formulario
        setFormData({
          fecha: new Date().toISOString().split('T')[0],
          local_destino_id: '',
          persona_responsable: ''
        });
        setItems(['']);
      } else {
        setError(response.message || 'Error al crear el vale');
      }
    } catch (error) {
      console.error('Error al crear vale:', error);
      setError(error.response?.data?.message || 'Error al crear el vale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vale-form-container">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h4>Crear Nuevo Vale de Préstamo</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">
              Vale creado exitosamente
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Local que presta</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.nombre || ''}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Local que recibe</Form.Label>
                  <Form.Select
                    name="local_destino_id"
                    value={formData.local_destino_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un local</option>
                    {locales
                      .filter(local => local.id !== user?.id)
                      .map(local => (
                        <option key={local.id} value={local.id}>
                          {local.nombre}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Persona responsable</Form.Label>
                  <Form.Control
                    type="text"
                    name="persona_responsable"
                    value={formData.persona_responsable}
                    onChange={handleChange}
                    placeholder="Nombre de quien lleva la mercadería"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="items-container mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Mercadería prestada</h5>
                <Button 
                  variant="success" 
                  size="sm" 
                  onClick={addItem}
                >
                  + Agregar Item
                </Button>
              </div>
              
              {items.map((item, index) => (
                <Row key={index} className="mb-2">
                  <Col xs={10}>
                    <Form.Control
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      placeholder="Descripción del item"
                    />
                  </Col>
                  <Col xs={2}>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="w-100"
                    >
                      Eliminar
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
            
            <div className="d-grid gap-2 mt-4">
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">Guardando...</span>
                  </>
                ) : (
                  'Guardar Vale'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CrearVale;
