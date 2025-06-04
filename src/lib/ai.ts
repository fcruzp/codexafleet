import { supabase } from './supabase';

export async function getActiveModel() {
  const { data, error } = await supabase
    .from('llm_models')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

export async function getMaintenanceContext(vehicleId?: string) {
  const { data, error } = await supabase
    .rpc('get_vehicle_maintenance_context', {
      vehicle_id: vehicleId || null
    });

  if (error) throw error;
  return data;
}

export async function sendMessageToAI(message: string, vehicleId?: string) {
  try {
    const model = await getActiveModel();
    const context = await getMaintenanceContext(vehicleId);

    const systemPrompt = `Eres un asistente especializado en gestión de flotas y mantenimiento de vehículos. 
    Tu función es ayudar a los usuarios a entender y analizar la información de su flota de vehículos.
    
    Tienes acceso al siguiente historial de mantenimientos y estado de los vehículos:
    
    ${context}
    
    Instrucciones específicas:
    1. Usa esta información para responder preguntas sobre:
       - Estado actual de los vehículos
       - Historial de mantenimientos
       - Costos y presupuestos
       - Próximos mantenimientos programados
       - Análisis de kilometraje y uso
       - Comparativas entre vehículos
       - Recomendaciones basadas en el historial
    
    2. Cuando respondas:
       - Sé específico y detallado
       - Incluye datos relevantes como fechas, costos y estados
       - Si no tienes información sobre algo, indícalo claramente
       - Proporciona contexto cuando sea relevante
       - Si ves patrones o tendencias, compártelos
       - Si hay vehículos que necesitan atención, destácalo
    
    3. Formato de respuestas:
       - Usa listas cuando sea apropiado
       - Destaca información importante
       - Sé conciso pero completo
       - Usa lenguaje técnico cuando sea necesario, pero explica términos complejos
    
    4. Si el usuario pregunta sobre un vehículo específico:
       - Enfócate en ese vehículo
       - Proporciona su historial completo
       - Compara con otros vehículos si es relevante
    
    5. Si el usuario pregunta sobre toda la flota:
       - Proporciona un resumen general
       - Destaca puntos importantes
       - Identifica patrones o problemas comunes`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://fleet-management-app.com',
        'X-Title': 'Fleet Management AI Assistant'
      },
      body: JSON.stringify({
        model: model.path,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Error en la respuesta de la IA');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error al enviar mensaje a la IA:', error);
    throw error;
  }
} 