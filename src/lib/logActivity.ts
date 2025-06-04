import { supabase } from './supabase';

interface LogActivityParams {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
}

export async function logActivity({ userId, action, entity, entityId, description }: LogActivityParams) {
  try {
    // Verificar el rol del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Solo permitir insertar si el usuario es admin o staff
    if (userData.role !== 'admin' && userData.role !== 'staff') {
      console.warn('Usuario no autorizado para registrar actividad');
      return;
    }

    await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action,
        entity,
        entity_id: entityId,
        description,
      },
    ]);
  } catch (error) {
    console.warn('Error al registrar actividad:', error);
    // No lanzamos el error para no interrumpir el flujo principal
  }
} 