// En el useEffect donde cargas los locales
useEffect(() => {
  const cargarLocales = async () => {
    try {
      setLoading(true);
      
      // Datos locales de respaldo con los 6 locales
      const datosLocales = [
        { id: 1, nombre: 'Local 1' },
        { id: 2, nombre: 'Local 2' },
        { id: 3, nombre: 'Local 3' },
        { id: 4, nombre: 'Local 4' },
        { id: 5, nombre: 'Local 5' },
        { id: 6, nombre: 'Local 6' }
      ];
      
      // Establecer el local actual basado en el usuario
      if (user) {
        setLocalPresta(user.local || 'Local 1');
      } else {
        setLocalPresta('Local 1');
      }
      
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
