import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import valesService from '../services/valesService';
import { useAuth } from '../context/AuthContext';

const Historial = () => {
  const { user } = useAuth();
  const [vales, setVales] = useState([]);
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    localOrigen: '',
    localDestino: '',
    mercaderia: '',
    estado: ''
  });

  // Obtener vales y locales al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener vales
        const valesResponse = await valesService.obtenerVales();
        if (valesResponse.success) {
          setVales(valesResponse.vales);
        }
        
        // Obtener locales
        const localesResponse = await axios.get('/api/usuarios');
        if (localesResponse.data.success) {
          setLocales(localesResponse.data.usuarios);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar el historial de vales');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  // Aplicar filtros
  const aplicarFiltros = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Eliminar filtros vacíos
      const filtrosValidos = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== '')
      );
      
      const response = await valesService.buscarVales(filtrosValidos);
      
      if (response.success) {
        setVales(response.vales);
        setError(null);
      } else {
        setError(response.message || 'Error al buscar vales');
      }
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
      setError(error.response?.data?.message || 'Error al buscar vales');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = async () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      localOrigen: '',
      localDestino: '',
      mercaderia: '',
      estado: ''
    });
    
    try {
      setLoading(true);
      
      const response = await valesService.obtenerVales();
      
      if (response.success) {
        setVales(response.vales);
        setError(null);
      } else {
        setError(response.message || 'Error al obtener vales');
      }
    } catch (error) {
      console.error('Error al limpiar filtros:', error);
      setError(error.response?.data?.message || 'Error al obtener vales');
    } finally {
      setLoading(false);
    }
  };

  // Marcar vale como pagado
  const marcarComoPagado = async (valeId) => {
    try {
      setLoading(true);
      const response = await valesService.marcarComoPagado(valeId);
      
      if (response.success) {
        // Actualizar la lista de vales
        const nuevosVales = vales.map(vale => 
          vale.id === valeId ? { ...vale, estado: 'pagado' } : vale
        );
        setVales(nuevosVales);
        
        // Mostrar mensaje de éxito
        setMensajeExito('Vale marcado como pagado correctamente');
        setTimeout(() => setMensajeExito(null), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al marcar vale como pagado');
    } finally {
      setLoading(false);
    }
  };

  // Exportar a CSV
  const exportarCSV = () => {
    valesService.exportarVales();
  };

  // Obtener nombre de local por ID
  const getNombreLocal = (id) => {
    const local = locales.find(local => local.id === id);
    return local ? local.nombre : 'Desconocido';
  };

  return (
    <div className="historial-container">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Historial de Vales</h4>
          <Button 
            variant="outline-light" 
            size="sm"
            onClick={exportarCSV}
          >
            Exportar a CSV
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {mensajeExito && <Alert variant="success">{mensajeExito}</Alert>}
          
          <div className="filtros-container">
            <h5 className="mb-3">Filtros</h5>
            <Form onSubmit={aplicarFiltros}>
              <Row>
                <Col md={6} lg={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Desde</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaDesde"
                      value={filtros.fechaDesde}
                      onChange={handleFiltroChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Hasta</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaHasta"
                      value={filtros.fechaHasta}
                      onChange={handleFiltroChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Local que presta</Form.Label>
                    <Form.Select
                      name="localOrigen"
                      value={filtros.localOrigen}
                      onChange={handleFiltroChange}
                    >
                      <option value="">Todos</option>
                      {locales.map(local => (
                        <option key={local.id} value={local.id}>
                          {local.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} lg={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Local que recibe</Form.Label>
                    <Form.Select
                      name="localDestino"
                      value={filtros.localDestino}
                      onChange={handleFiltroChange}
                    >
                      <option value="">Todos</option>
                      {locales.map(local => (
                        <option key={local.id} value={local.id}>
                          {local.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Mercadería</Form.Label>
                    <Form.Control
                      type="text"
                      name="mercaderia"
                      value={filtros.mercaderia}
                      onChange={handleFiltroChange}
                      placeholder="Buscar por tipo de mercadería"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      name="estado"
                      value={filtros.estado}
                      onChange={handleFiltroChange}
                    >
                      <option value="">Todos</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="pagado">Pagado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3 d-flex align-items-end">
                  <div className="d-grid gap-2 w-100">
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={loading}
                    >
                      Aplicar Filtros
                    </Button>
                    <Button 
                      variant="secondary" 
                      type="button"
                      onClick={limpiarFiltros}
                      disabled={loading}
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </div>
          
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando vales...</p>
            </div>
          ) : vales.length === 0 ? (
            <Alert variant="info">
              No se encontraron vales con los filtros seleccionados
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Local que presta</th>
                    <th>Local que recibe</th>
                    <th>Persona responsable</th>
                    <th>Mercadería</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vales.map(vale => (
                    <tr key={vale.id}>
                      <td>{new Date(vale.fecha).toLocaleDateString()}</td>
                      <td>{vale.origen_nombre}</td>
                      <td>{vale.destino_nombre}</td>
                      <td>{vale.persona_responsable}</td>
                      <td>
                        <ul className="mb-0">
                          {vale.items.map((item, index) => (
                            <li key={index}>{item.descripcion}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {vale.estado === 'pagado' ? (
                          <Badge bg="success">Pagado</Badge>
                        ) : (
                          <Badge bg="warning">Pendiente</Badge>
                        )}
                      </td>
                      <td>
                        {vale.origen_id === user?.id && vale.estado === 'pendiente' && (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => marcarComoPagado(vale.id)}
                            disabled={loading}
                          >
                            Marcar como pagado
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Historial;
