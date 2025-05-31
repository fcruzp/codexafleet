import { createClient } from '@supabase/supabase-js';

console.log('Environment variables at startup:', {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
  SUPABASE_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
  SITE_URL: process.env.SITE_URL || 'Not set'
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export async function handler(event, context) {
  console.log('Function started with event:', JSON.stringify(event, null, 2));
  console.log('Environment variables in handler:', {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
    SUPABASE_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
    SITE_URL: process.env.SITE_URL || 'Not set'
  });

  try {
    const body = JSON.parse(event.body);
    const { model, messages } = body;

    console.log('Request body:', { model, messagesCount: messages?.length });

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid request format:', body);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Formato de solicitud inválido" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Obtener la API key desde la base de datos
    console.log('Fetching API key from database...');
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('openrouter_key')
      .single();

    if (settingsError) {
      console.error('Database error:', settingsError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Error al obtener la API key de la base de datos",
          details: settingsError
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    console.log('Settings data:', { 
      hasKey: !!settingsData?.openrouter_key,
      keyLength: settingsData?.openrouter_key?.length
    });

    if (!settingsData?.openrouter_key) {
      console.error('API key not found in database');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key no configurada" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    console.log('Making request to OpenRouter API...');
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settingsData.openrouter_key}`,
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:8888",
        "X-Title": "Fleet Management System"
      },
      body: JSON.stringify({
        model: model || "deepseek/deepseek-r1-0528:free",
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.error?.message || `Error HTTP! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response:', { 
      hasChoices: !!data.choices,
      choicesCount: data.choices?.length
    });

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    };
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