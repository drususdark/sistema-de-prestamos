import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CrearVale = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [localPresta, setLocalPresta] = useState('');
  const [localRecibe, setLocalRecibe] = useState('');
  const [personaResponsable, setPersonaResponsable] = useState('');
  const [items, setItems] = useState([{ descripcion: '' }]);
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Cargar la lista de locales al montar el componente
  useEffect(() => {
    const cargarLocales = async () => {
      try {
        setLoading(true);
        
        // Establecer el local actual basado en el usuario
        if (user) {
          setLocalPresta(user.nombre);
        } else {
          setLocalPresta('Local 1');
        }

        // Datos locales de respaldo con los 6 locales
        const datosLocales = [
          { id: 1, nombre: 'Local 1' },
          { id: 2, nombre: 'Local 2' },
          { id: 3, nombre: 'Local 3' },
          { id: 4, nombre: 'Local 4' },
          { id: 5, nombre: 'Local 5' },
          { id: 6, nombre: 'Local 6' }
        ];

        // Verificar si la URL del backend está configurada
        const backendUrl = process.env.REACT_APP_API_URL;
        if (!backendUrl) {
          console.log('URL del backend no configurada, usando datos locales');
          setLocales(datosLocales);
          setLoading(false);
          return;
        }

        // Intentar cargar los locales desde el backend
        try {
          const response = await axios.get(`${backendUrl}/api/locales`);
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log('Locales cargados desde API:', response.data);
            setLocales(response.data);
          } else {
            console.warn('Respuesta de API vacía, usando datos locales');
            setLocales(datosLocales);
          }
        } catch (error) {
          console.error('Error al cargar los locales desde API:', error);
          setLocales(datosLocales);
        }
      } catch (error) {
        console.error('Error general:', error);
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

    cargarLocales();
  }, [user]);

  // Definición de la función handleGuardarVale
  const handleGuardarVale = async () => {
    // Validar que todos los campos requeridos estén completos
    if (!localRecibe) {
      setError('Por favor seleccione un local que recibe');
      return;
    }
    if (!personaResponsable) {
      setError('Por favor ingrese el nombre de la persona responsable');
      return;
    }

    // Validar que haya al menos un item con descripción
    const itemsValidos = items.filter(item => item.descripcion.trim() !== '');
    if (itemsValidos.length === 0) {
      setError('Por favor agregue al menos un item de mercadería');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Preparar los datos del vale
      const valeData = {
        fecha,
        localPresta,
        local_destino_id: localRecibe, // Ahora localRecibe contiene el ID numérico
        personaResponsable,
        items: itemsValidos,
        estado: 'Pendiente'
      };

      // Enviar los datos al backend si está configurado
      const backendUrl = process.env.REACT_APP_API_URL;
      if (backendUrl) {
        await axios.post(`${backendUrl}/api/vales`, valeData);
        // Limpiar el formulario después de guardar
        setLocalRecibe('');
        setPersonaResponsable('');
        setItems([{ descripcion: '' }]);
        alert('Vale guardado exitosamente');
      } else {
        // Si no hay backend, simular guardado exitoso
        console.log('Simulando guardado de vale:', valeData);
        // Limpiar el formulario después de guardar
        setLocalRecibe('');
        setPersonaResponsable('');
        setItems([{ descripcion: '' }]);
        alert('Vale guardado exitosamente (modo simulación)');
      }
    } catch (error) {
      console.error('Error al guardar el vale:', error);
      setError('Error al guardar el vale. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Renderizado del formulario
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4>Crear Nuevo Vale de Préstamo</h4>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form>
            {/* Campos de fecha y local que presta */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="fecha" className="form-label">Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  id="fecha"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="localPresta" className="form-label">Local que presta</label>
                <input
                  type="text"
                  className="form-control"
                  id="localPresta"
                  value={localPresta}
                  readOnly
                />
              </div>
            </div>

            {/* Campo de local que recibe */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="localRecibe" className="form-label">Local que recibe</label>
                <select
                  className="form-select"
                  id="localRecibe"
                  value={localRecibe}
                  onChange={(e) => setLocalRecibe(e.target.value)}
                >
                  <option value="">Seleccione un local</option>
                  {locales
                    .filter(local => local.nombre !== localPresta) // Filtrar el local actual
                    .map(local => (
                      <option key={local.id} value={local.id}>  {/* CAMBIO AQUÍ: Usar local.id en lugar de local.nombre */}
                        {local.nombre}
                      </option>
                    ))}
                  {/* Asegurarse de que siempre haya al menos una opción si el filtrado elimina todas */}
                  {locales.filter(local => local.nombre !== localPresta).length === 0 && (
                    <>
                      <option value="2">Local 2</option>  {/* CAMBIO AQUÍ: Usar IDs numéricos en lugar de nombres */}
                      <option value="3">Local 3</option>
                      <option value="4">Local 4</option>
                      <option value="5">Local 5</option>
                      <option value="6">Local 6</option>
                    </>
                  )}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="personaResponsable" className="form-label">Persona responsable</label>
                <input
                  type="text"
                  className="form-control"
                  id="personaResponsable"
                  placeholder="Nombre de quien lleva la mercadería"
                  value={personaResponsable}
                  onChange={(e) => setPersonaResponsable(e.target.value)}
                />
              </div>
            </div>

            {/* Sección de mercadería */}
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Mercadería prestada</h5>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => setItems([...items, { descripcion: '' }])}
                >
                  + Agregar Item
                </button>
              </div>
              <div className="card-body">
                {items.map((item, index) => (
                  <div key={index} className="row mb-2">
                    <div className="col-10">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Descripción del item"
                        value={item.descripcion}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].descripcion = e.target.value;
                          setItems(newItems);
                        }}
                      />
                    </div>
                    <div className="col-2">
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                          if (items.length > 1) {
                            const newItems = [...items];
                            newItems.splice(index, 1);
                            setItems(newItems);
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de guardar */}
            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGuardarVale}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Vale'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearVale;
