import { createClient } from '@supabase/supabase-js';

console.log('Environment variables at startup:', {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
  SUPABASE_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
  SITE_URL: process.env.SITE_URL || 'Not set'
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

// Verificar la conexión a Supabase
console.log('Supabase client initialized with:', {
  url: process.env.VITE_SUPABASE_URL,
  hasKey: !!process.env.VITE_SUPABASE_ANON_KEY,
  keyLength: process.env.VITE_SUPABASE_ANON_KEY?.length,
  config: {
    auth: {
      persistSession: false
    }
  }
});

export async function handler(event, context) {
  console.log('Function started with event:', JSON.stringify(event, null, 2));
  console.log('Environment variables in handler:', {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
    SUPABASE_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
    SITE_URL: process.env.SITE_URL || 'Not set'
  });

  try {
    const body = JSON.parse(event.body);
    const { messages } = body;

    console.log('Request body:', { messagesCount: messages?.length });

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid request format:', body);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Formato de solicitud inválido" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Obtener la API key y el modelo activo desde la base de datos
    console.log('Fetching API key and active model from database...');
    const [settingsResponse, allModelsResponse, activeModelsResponse] = await Promise.all([
      supabase
        .from('settings')
        .select('openrouter_key')
        .single(),
      supabase
        .from('llm_models')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('llm_models')
        .select('*')
        .eq('is_active', true)
    ]);

    console.log('Database responses:', {
      settings: settingsResponse,
      allModels: allModelsResponse,
      activeModels: activeModelsResponse,
      tableName: 'llm_models',
      query: {
        allModels: 'SELECT * FROM llm_models ORDER BY created_at DESC',
        activeModels: 'SELECT * FROM llm_models WHERE is_active = true'
      }
    });

    if (settingsResponse.error) {
      console.error('Database error (settings):', settingsResponse.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Error al obtener la API key de la base de datos",
          details: settingsResponse.error
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    if (allModelsResponse.error) {
      console.error('Database error (all models):', allModelsResponse.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Error al obtener los modelos",
          details: allModelsResponse.error
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    if (activeModelsResponse.error) {
      console.error('Database error (active model):', activeModelsResponse.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Error al obtener el modelo activo",
          details: activeModelsResponse.error
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    console.log('Settings and model data:', { 
      hasKey: !!settingsResponse.data?.openrouter_key,
      keyLength: settingsResponse.data?.openrouter_key?.length,
      allModels: allModelsResponse.data,
      activeModels: activeModelsResponse.data
    });

    if (!settingsResponse.data?.openrouter_key) {
      console.error('API key not found in database');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key no configurada" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    if (!activeModelsResponse.data || activeModelsResponse.data.length === 0) {
      console.error('No active model found in database');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "No hay un modelo activo configurado en la base de datos",
          availableModels: allModelsResponse.data
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    if (activeModelsResponse.data.length > 1) {
      console.error('Más de un modelo activo encontrado:', activeModelsResponse.data);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Hay más de un modelo activo en la base de datos. Solo debe haber uno.",
          activeModels: activeModelsResponse.data
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const activeModel = activeModelsResponse.data[0];

    const requestBody = {
      model: activeModel.path,
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    };

    console.log('Making request to OpenRouter API with:', requestBody);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settingsResponse.data.openrouter_key}`,
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:8888",
        "X-Title": "Fleet Management System"
      },
      body: JSON.stringify({
        ...requestBody,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        requestBody
      });
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: errorData.error?.message || `Error HTTP! status: ${response.status}`,
          details: errorData
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Configurar SSE
    let buffer = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const streamResponse = new Promise(async (resolve, reject) => {
      try {
        let fullResponse = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === 'data: [DONE]') {
              resolve({
                statusCode: 200,
                body: fullResponse,
                headers: {
                  'Content-Type': 'text/plain; charset=utf-8'
                }
              });
              return;
            }
            if (line.startsWith(': OPENROUTER')) continue;
            
            try {
              const jsonStr = line.replace(/^data: /, '');
              if (!jsonStr) continue;
              
              const json = JSON.parse(jsonStr);
              const content = json.choices[0]?.delta?.content;
              
              if (content) {
                fullResponse += content;
              }
            } catch (e) {
              console.error('Error parsing stream:', e, 'Line:', line);
            }
          }
        }

        // Si llegamos aquí sin encontrar [DONE], devolvemos lo que tengamos
        resolve({
          statusCode: 200,
          body: fullResponse,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        });
      } catch (error) {
        console.error('Stream error:', error);
        reject(error);
      }
    });

    return streamResponse;
  } catch (error) {
    console.error('Error in chat-gemini function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack,
        type: error.name
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
}