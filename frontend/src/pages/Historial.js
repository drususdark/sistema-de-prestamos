import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Table, Button, Badge, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import valesService from '../services/valesService';

const Historial = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vales, setVales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar los vales
  const cargarVales = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando vales...');
      const response = await valesService.getAll();
      console.log('Respuesta de valesService.getAll():', response);
      
      if (response.success) {
        console.log('Vales cargados correctamente:', response.vales);
        setVales(response.vales || []);
      } else {
        console.error('Error al cargar vales:', response.message);
        setError(response.message || 'Error al cargar los vales');
        setVales([]);
      }
    } catch (error) {
      console.error('Excepción al cargar vales:', error);
      setError('Error al cargar los vales');
      setVales([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar vales al montar el componente
  useEffect(() => {
    if (user) {
      cargarVales();
    }
  }, [user]);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener el color del badge según el estado
  const getBadgeVariant = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'pagado':
        return 'success';
      default:
        return 'secondary';
    }
  };

  // Función para manejar el pago de un vale
  const handlePagar = async (valeId) => {
    try {
      const response = await valesService.marcarComoPagado(valeId);
      if (response.success) {
        // Recargar los vales para mostrar el cambio
        cargarVales();
      } else {
        setError(response.message || 'Error al marcar como pagado');
      }
    } catch (error) {
      console.error('Error al marcar como pagado:', error);
      setError('Error al marcar como pagado');
    }
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <Container className="mt-4">
        <Alert variant="info">Cargando historial de vales...</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h4>Historial de Vales</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="mb-3">
            <Col>
              <Button variant="primary" onClick={() => navigate('/crear-vale')}>
                Crear Nuevo Vale
              </Button>
              <Button variant="outline-secondary" className="ms-2" onClick={cargarVales}>
                Actualizar
              </Button>
            </Col>
          </Row>
          
          {vales && vales.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Local Origen</th>
                  <th>Local Destino</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vales.map((vale) => (
                  <tr key={vale.id}>
                    <td>{vale.id}</td>
                    <td>{formatDate(vale.fecha)}</td>
                    <td>{vale.localOrigen}</td>
                    <td>{vale.localDestino}</td>
                    <td>${vale.total.toFixed(2)}</td>
                    <td>
                      <Badge bg={getBadgeVariant(vale.estado)}>
                        {vale.estado.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      {vale.estado === 'pendiente' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handlePagar(vale.id)}
                        >
                          Marcar como Pagado
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">
              No hay vales para mostrar. Crea un nuevo vale usando el botón "Crear Nuevo Vale".
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Historial;
