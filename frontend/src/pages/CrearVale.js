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
        console.error('Error al cargar locales:', error);
        setError('Error al cargar los datos. Por favor, recargue la página.');
        setLoading(false);
      }
    };

    cargarLocales();
  }, [user]);

  // Agregar un nuevo item vacío
  const agregarItem = () => {
    setItems([...items, { descripcion: '' }]);
  };

  // Actualizar un item existente
  const actualizarItem = (index, value) => {
    const newItems = [...items];
    newItems[index].descripcion = value;
    setItems(newItems);
  };

  // Guardar el vale
  const handleGuardarVale = async () => {
    try {
      setLoading(true);
      setError('');

      // Validar campos
      if (!fecha || !localRecibe || !personaResponsable) {
        setError('Por favor, complete todos los campos requeridos.');
        setLoading(false);
        return;
      }

      // Validar que haya al menos un item con descripción
      const itemsValidos = items.filter(item => item.descripcion.trim() !== '');
      if (itemsValidos.length === 0) {
        setError('Por favor, agregue al menos un item.');
        setLoading(false);
        return;
      }

      // Encontrar el ID del local que recibe basado en su nombre
      const localRecibeObj = locales.find(local => local.id.toString() === localRecibe.toString());
      if (!localRecibeObj) {
        setError('Por favor seleccione un local que recibe');
        setLoading(false);
        return;
      }

      // Crear objeto de datos del vale
      const valeData = {
        fecha,
        localPresta,
        local_destino_id: parseInt(localRecibe), // Convertir a número para asegurar compatibilidad
        persona_responsable: personaResponsable,
        items: itemsValidos,
        estado: 'pendiente' // Asegurar que el estado sea en minúsculas
      };

      // Intentar guardar el vale
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/vales`, valeData);
        if (response.data && response.data.success) {
          // Limpiar el formulario
          setLocalRecibe('');
          setPersonaResponsable('');
          setItems([{ descripcion: '' }]);
          alert('Vale guardado con éxito');
        } else {
          throw new Error('Respuesta de API vacía');
        }
      } catch (apiError) {
        console.log('Error al guardar en API, usando localStorage', apiError);
        
        // Fallback a localStorage
        const localStorageService = await import('../services/LocalStorageService').then(module => module.default);
        const result = localStorageService.crearVale(valeData);
        
        if (result.success) {
          // Limpiar el formulario
          setLocalRecibe('');
          setPersonaResponsable('');
          setItems([{ descripcion: '' }]);
          alert('Vale guardado con éxito');
        } else {
          throw new Error(result.message || 'Error al guardar el vale');
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error al guardar el vale:', error);
      setError('Error al guardar el vale. Por favor intente nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Crear Nuevo Vale de Préstamo</h4>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form>
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="fecha" className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fecha"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
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
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="localRecibe" className="form-label">Local que recibe</label>
                  <select
                    className="form-select"
                    id="localRecibe"
                    value={localRecibe}
                    onChange={(e) => setLocalRecibe(e.target.value)}
                  >
                    <option value="">Seleccione un local</option>
                    {locales
                      .filter(local => local.nombre !== localPresta)
                      .map(local => (
                        <option key={local.id} value={local.id}>
                          {local.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
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
            </div>

            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Mercadería prestada</h5>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={agregarItem}
                >
                  + Agregar Item
                </button>
              </div>
              <div className="card-body">
                {items.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Descripción del item"
                        value={item.descripcion}
                        onChange={(e) => actualizarItem(index, e.target.value)}
                      />
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
