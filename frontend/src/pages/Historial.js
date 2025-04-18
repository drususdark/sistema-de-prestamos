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

        // Datos de respaldo para desarrollo/demostración
        setVales([
          {
            id: 1,
            fecha: '2025-04-15',
            localPresta: 'Local 1',
            localRecibe: 'Local 2',
            personaResponsable: 'Juan Pérez',
            items: [{ descripcion: 'Producto 1' }, { descripcion: 'Producto 2' }],
            estado: 'pendiente'
          },
          {
            id: 2,
            fecha: '2025-04-14',
            localPresta: 'Local 3',
            localRecibe: 'Local 1',
            personaResponsable: 'María López',
            items: [{ descripcion: 'Producto 3' }],
            estado: 'pagado'
          }
        ]);

        setLocales([
          { id: 1, nombre: 'Local 1' },
          { id: 2, nombre: 'Local 2' },
          { id: 3, nombre: 'Local 3' },
          { id: 4, nombre: 'Local 4' },
          { id: 5, nombre: 'Local 5' },
          { id: 6, nombre: 'Local 6' }
        ]);
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

  // Verificar si el usuario actual puede marcar un vale como pagado
  const puedeMarcarComoPagado = (vale) => {
    // Solo el local que prestó puede marcar como pagado
    return user && user.nombre === vale.localPresta && vale.estado === 'pendiente';
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
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="me-2" 
                    disabled={loading}
                  >
                    Aplicar Filtros
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={limpiarFiltros} 
                    disabled={loading}
                  >
                    Limpiar Filtros
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>

          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando datos...</p>
            </div>
          ) : vales.length === 0 ? (
            <Alert variant="info">No se encontraron vales con los criterios seleccionados.</Alert>
          ) : (
            <Table responsive striped bordered hover className="mt-4">
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
                    <td>{vale.origen_nombre || vale.localPresta}</td>
                    <td>{vale.destino_nombre || vale.localRecibe}</td>
                    <td>{vale.persona_responsable}</td>
                    <td>
                      <ul className="mb-0">
                        {vale.items.map((item, index) => (
                          <li key={index}>{item.descripcion}</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <Badge bg={vale.estado === 'pendiente' ? 'warning' : 'success'}>
                        {vale.estado === 'pendiente' ? 'Pendiente' : 'Pagado'}
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
                        vale.estado === 'pagado' && 'Vale pagado'
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
