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

        // Datos locales de respaldo
        const datosLocales = [
          { id: 1, nombre: 'Local 1' },
          { id: 2, nombre: 'Local 2' },
          { id: 3, nombre: 'Local 3' },
          { id: 4, nombre: 'Local 4' },
          { id: 5, nombre: 'Local 5' },
          { id: 6, nombre: 'Local 6' }
        ];

        // Verificar si la URL de la API está disponible
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/locales`);
          if (response.data && response.data.success) {
            setLocales(response.data.locales);
          } else {
            console.log('Respuesta de API vacía, usando datos locales');
            setLocales(datosLocales);
          }
        } catch (error) {
          console.log('Error al obtener locales de la API, usando datos locales', error);
          setLocales(datosLocales);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, recargue la página.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  // Aplicar filtros
  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await valesService.buscarVales(filtros);
      if (response.success) {
        setVales(response.vales);
      } else {
        setError('Error al aplicar filtros');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
      setError('Error al aplicar filtros. Por favor, intente nuevamente.');
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
      setError(null);
      
      const response = await valesService.obtenerVales();
      if (response.success) {
        setVales(response.vales);
      } else {
        setError('Error al limpiar filtros');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al limpiar filtros:', error);
      setError('Error al limpiar filtros. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  // Exportar vales a CSV
  const exportarVales = () => {
    try {
      valesService.exportarVales();
    } catch (error) {
      console.error('Error al exportar vales:', error);
      setError('Error al exportar vales. Por favor, intente nuevamente.');
    }
  };

  // Marcar vale como pagado
  const marcarComoPagado = async (valeId) => {
    try {
      setLoading(true);
      setError(null);
      setMensajeExito(null);
      
      const response = await valesService.marcarComoPagado(valeId);
      if (response.success) {
        // Actualizar la lista de vales
        const valesActualizados = vales.map(vale => 
          vale.id === valeId ? { ...vale, estado: 'pagado' } : vale
        );
        setVales(valesActualizados);
        setMensajeExito('Vale marcado como pagado exitosamente');
      } else {
        setError('Error al marcar vale como pagado');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al marcar vale como pagado:', error);
      setError('Error al marcar vale como pagado. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  // Verificar si el usuario puede marcar un vale como pagado
  const puedeMarcarComoPagado = (vale) => {
    // Convertir a minúsculas para evitar problemas de mayúsculas/minúsculas
    const userLocal = user?.nombre?.toLowerCase();
    const valeLocal = vale.localPresta?.toLowerCase();
    const valeEstado = vale.estado?.toLowerCase();
    
    // Solo el local que prestó puede marcar como pagado y solo si está pendiente
    return user && userLocal === valeLocal && valeEstado === 'pendiente';
  };

  return (
    <div className="container mt-4">
      <Card>
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Historial de Vales</h4>
          <Button variant="light" onClick={exportarVales}>
            Exportar a CSV
          </Button>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger">{error}</Alert>
          )}
          
          {mensajeExito && (
            <Alert variant="success">{mensajeExito}</Alert>
          )}
          
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Filtros</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} lg={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Desde</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaDesde"
                      value={filtros.fechaDesde}
                      onChange={handleFiltroChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hasta</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaHasta"
                      value={filtros.fechaHasta}
                      onChange={handleFiltroChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={3}>
                  <Form.Group className="mb-3">
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
                <Col md={6} lg={3}>
                  <Form.Group className="mb-3">
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
                <Col md={6} lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mercadería</Form.Label>
                    <Form.Control
                      type="text"
                      name="mercaderia"
                      placeholder="Buscar por tipo de mercadería"
                      value={filtros.mercaderia}
                      onChange={handleFiltroChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={6}>
                  <Form.Group className="mb-3">
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
              </Row>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={aplicarFiltros}>
                  Aplicar Filtros
                </Button>
                <Button variant="secondary" onClick={limpiarFiltros}>
                  Limpiar Filtros
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          ) : (
            <Table striped bordered hover responsive>
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
                    <td>{vale.fecha}</td>
                    <td>{vale.localPresta}</td>
                    <td>{vale.localRecibe}</td>
                    <td>{vale.personaResponsable}</td>
                    <td>
                      <ul className="mb-0">
                        {vale.items.map((item, index) => (
                          <li key={index}>{item.descripcion}</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <Badge bg={vale.estado.toLowerCase() === 'pendiente' ? 'warning' : 'success'}>
                        {vale.estado.charAt(0).toUpperCase() + vale.estado.slice(1)}
                      </Badge>
                    </td>
                    <td>
                      {puedeMarcarComoPagado(vale) ? (
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => marcarComoPagado(vale.id)}
                          disabled={loading}
                        >
                          Marcar como pagado
                        </Button>
                      ) : (
                        vale.estado.toLowerCase() === 'pagado' && 'Vale pagado'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Historial;
