const { supabase } = require('../supabase');

class Vale {
  // Crear un nuevo vale con sus items de mercadería
  static async create(valeData, itemsMercaderia) {
    try {
      // Insertar el vale
      const { data: vale, error: valeError } = await supabase
        .from('vales')
        .insert([{
          fecha: valeData.fecha,
          local_origen_id: valeData.local_origen_id,
          local_destino_id: valeData.local_destino_id,
          persona_responsable: valeData.persona_responsable,
          estado: 'pendiente'
        }])
        .select()
        .single();

      if (valeError) {
        throw valeError;
      }

      // Insertar los items de mercadería
      if (itemsMercaderia && itemsMercaderia.length > 0) {
        const itemsToInsert = itemsMercaderia.map(item => ({
          vale_id: vale.id,
          descripcion: item
        }));

        const { data: items, error: itemsError } = await supabase
          .from('items_mercaderia')
          .insert(itemsToInsert)
          .select();

        if (itemsError) {
          // Si falla la inserción de items, eliminar el vale creado
          await supabase.from('vales').delete().eq('id', vale.id);
          throw itemsError;
        }

        return { ...vale, items: items };
      }

      return { ...vale, items: [] };
    } catch (error) {
      console.error('Error al crear vale:', error);
      throw error;
    }
  }

  // Obtener todos los vales con sus items
  static async getAll() {
    try {
      const { data: vales, error: valesError } = await supabase
        .from('vales')
        .select(`
          id, fecha, persona_responsable, estado, creado_en,
          local_origen:usuarios!local_origen_id(id, nombre),
          local_destino:usuarios!local_destino_id(id, nombre)
        `)
        .order('fecha', { ascending: false });

      if (valesError) {
        throw valesError;
      }

      // Para cada vale, obtener sus items de mercadería
      const valesConItems = await Promise.all(vales.map(async (vale) => {
        const items = await this.getItemsByValeId(vale.id);
        return {
          ...vale,
          origen_id: vale.local_origen.id,
          origen_nombre: vale.local_origen.nombre,
          destino_id: vale.local_destino.id,
          destino_nombre: vale.local_destino.nombre,
          items
        };
      }));

      return valesConItems;
    } catch (error) {
      console.error('Error al obtener todos los vales:', error);
      throw error;
    }
  }

  // Obtener items de mercadería por ID de vale
  static async getItemsByValeId(valeId) {
    try {
      const { data: items, error } = await supabase
        .from('items_mercaderia')
        .select('id, descripcion')
        .eq('vale_id', valeId);

      if (error) {
        throw error;
      }

      return items || [];
    } catch (error) {
      console.error('Error al obtener items por vale ID:', error);
      throw error;
    }
  }

  // Buscar vales con filtros
  static async buscarVales(filtros) {
    try {
      let query = supabase
        .from('vales')
        .select(`
          id, fecha, persona_responsable, estado, creado_en,
          local_origen:usuarios!local_origen_id(id, nombre),
          local_destino:usuarios!local_destino_id(id, nombre)
        `);

      // Aplicar filtros si existen
      if (filtros.fechaDesde) {
        query = query.gte('fecha', filtros.fechaDesde);
      }

      if (filtros.fechaHasta) {
        query = query.lte('fecha', filtros.fechaHasta);
      }

      if (filtros.localOrigen) {
        query = query.eq('local_origen_id', filtros.localOrigen);
      }

      if (filtros.localDestino) {
        query = query.eq('local_destino_id', filtros.localDestino);
      }

      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }

      const { data: vales, error } = await query.order('fecha', { ascending: false });

      if (error) {
        throw error;
      }

      // Para cada vale, obtener sus items de mercadería
      let valesConItems = await Promise.all(vales.map(async (vale) => {
        const items = await this.getItemsByValeId(vale.id);
        return {
          ...vale,
          origen_id: vale.local_origen.id,
          origen_nombre: vale.local_origen.nombre,
          destino_id: vale.local_destino.id,
          destino_nombre: vale.local_destino.nombre,
          items
        };
      }));

      // Filtrar por mercadería si se especifica
      if (filtros.mercaderia) {
        valesConItems = valesConItems.filter(vale => 
          vale.items.some(item => 
            item.descripcion.toLowerCase().includes(filtros.mercaderia.toLowerCase())
          )
        );
      }

      return valesConItems;
    } catch (error) {
      console.error('Error al buscar vales:', error);
      throw error;
    }
  }

  // Marcar un vale como pagado
  static async marcarComoPagado(valeId, usuarioId) {
    try {
      // Primero verificar que el usuario es el dueño del vale
      const { data: vale, error: valeError } = await supabase
        .from('vales')
        .select('*')
        .eq('id', valeId)
        .eq('local_origen_id', usuarioId)
        .single();

      if (valeError && valeError.code !== 'PGRST116') {
        throw valeError;
      }

      if (!vale) {
        throw new Error('No tienes permiso para modificar este vale o el vale no existe');
      }

      // Actualizar el estado del vale
      const { error: updateError } = await supabase
        .from('vales')
        .update({ estado: 'completado' })
        .eq('id', valeId);

      if (updateError) {
        throw updateError;
      }

      return { success: true, message: 'Vale marcado como completado' };
    } catch (error) {
      console.error('Error al marcar vale como pagado:', error);
      throw error;
    }
  }

  // Obtener vale por ID
  static async findById(id) {
    try {
      const { data: vale, error } = await supabase
        .from('vales')
        .select(`
          id, fecha, persona_responsable, estado, creado_en,
          local_origen:usuarios!local_origen_id(id, nombre),
          local_destino:usuarios!local_destino_id(id, nombre)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!vale) {
        return null;
      }

      const items = await this.getItemsByValeId(vale.id);
      
      return {
        ...vale,
        origen_id: vale.local_origen.id,
        origen_nombre: vale.local_origen.nombre,
        destino_id: vale.local_destino.id,
        destino_nombre: vale.local_destino.nombre,
        items
      };
    } catch (error) {
      console.error('Error al buscar vale por ID:', error);
      throw error;
    }
  }

  // Actualizar vale
  static async update(id, valeData, itemsMercaderia) {
    try {
      // Actualizar el vale
      const { data: vale, error: valeError } = await supabase
        .from('vales')
        .update({
          fecha: valeData.fecha,
          local_origen_id: valeData.local_origen_id,
          local_destino_id: valeData.local_destino_id,
          persona_responsable: valeData.persona_responsable,
          estado: valeData.estado || 'pendiente'
        })
        .eq('id', id)
        .select()
        .single();

      if (valeError) {
        throw valeError;
      }

      // Eliminar items existentes
      const { error: deleteError } = await supabase
        .from('items_mercaderia')
        .delete()
        .eq('vale_id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Insertar nuevos items si existen
      if (itemsMercaderia && itemsMercaderia.length > 0) {
        const itemsToInsert = itemsMercaderia.map(item => ({
          vale_id: id,
          descripcion: item
        }));

        const { data: items, error: itemsError } = await supabase
          .from('items_mercaderia')
          .insert(itemsToInsert)
          .select();

        if (itemsError) {
          throw itemsError;
        }

        return { ...vale, items: items };
      }

      return { ...vale, items: [] };
    } catch (error) {
      console.error('Error al actualizar vale:', error);
      throw error;
    }
  }

  // Eliminar vale
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('vales')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error al eliminar vale:', error);
      throw error;
    }
  }
}

module.exports = Vale;

