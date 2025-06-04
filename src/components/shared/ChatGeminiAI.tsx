import React, { useState, useEffect } from 'react';
import { MessageCircle, X, RefreshCw, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { getMaintenanceContext } from '../../lib/ai';
import { Dialog } from '@headlessui/react';

const OPENROUTER_API_URL = "/.netlify/functions/chat-gemini";

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  is_active: boolean;
}

// Palabras clave que activan el contexto de la base de datos
const KEYWORDS = ['@vehiculos', '@flota', '@mantenimiento', '@datos'];

const HELP_QUESTIONS = [
  '¿Cuáles vehículos necesitan mantenimiento próximamente? @vehiculos',
  'Dame un resumen del estado de la flota. @flota',
  '¿Cuánto hemos gastado en mantenimientos este año? @mantenimiento',
  '¿Cuál es el historial de mantenimientos del vehículo ABC123? @vehiculos',
  '¿Qué vehículos tienen el mantenimiento vencido? @flota',
  '¿Qué tipo de combustible usan los vehículos de la flota? @datos',
  '¿Cuál es el vehículo con mayor kilometraje? @vehiculos',
  '¿Qué mantenimientos se han realizado en marzo? @mantenimiento',
  '¿Cuáles son los vehículos activos y cuáles están fuera de servicio? @flota',
  '¿Qué proveedor realizó el último mantenimiento del vehículo XYZ789? @vehiculos',
  '¿Cuántos mantenimientos ha tenido el vehículo con placa DEF456? @vehiculos',
  '¿Qué vehículos tienen el mismo modelo y año? @flota',
  '¿Cuáles son los próximos mantenimientos programados? @mantenimiento',
  '¿Cuál es el costo promedio de los mantenimientos? @mantenimiento',
  '¿Qué vehículos tienen más de 100,000 km? @vehiculos',
];

const HELP_TEXT = `\
**¿Cómo funciona el Asistente de IA de Flota?**\n\n
Este asistente puede responder preguntas sobre el estado, historial y mantenimientos de tus vehículos, usando los datos reales de tu flota.\n\n
**¿Cómo obtener respuestas basadas en los datos reales?**\n\n
Incluye alguna de las siguientes palabras clave en tu pregunta para que la IA use el contexto de la base de datos:\n\n
- @vehiculos
- @flota
- @mantenimiento
- @datos\n\n
Por ejemplo: "¿Cuáles vehículos necesitan mantenimiento próximamente? @vehiculos"\n\n
**Ejemplos de preguntas que puedes hacer:**\n`;

const ChatGeminiAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<LLMModel | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchApiKey();
    fetchActiveModel();
  }, []);

  const fetchApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('openrouter_key')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setApiKey(data?.openrouter_key || null);
    } catch (err) {
      console.error('Error fetching API key:', err);
      setApiKey(null);
    }
  };

  const fetchActiveModel = async () => {
    try {
      const { data, error } = await supabase
        .from('llm_models')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setActiveModel(data);
    } catch (err) {
      console.error('Error fetching active model:', err);
      toast.error('Error al cargar el modelo activo');
    }
  };

  // Mensajes en formato OpenAI
  const getOpenAIMessages = () => {
    const formattedMessages = messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    if (input.trim()) {
      formattedMessages.push({
        role: 'user',
        content: input.trim()
      });
    }

    // Asegurarnos de que siempre haya al menos un mensaje del sistema
    if (formattedMessages.length === 0 || formattedMessages[0].role !== 'system') {
      formattedMessages.unshift({
        role: 'system',
        content: 'Eres un asistente útil y amigable.'
      });
    }

    return formattedMessages;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!apiKey) {
      toast.error('Por favor, configure su OpenRouter API key en la configuración', {
        duration: 5000,
        icon: '⚙️'
      });
      return;
    }

    if (!activeModel) {
      toast.error('No hay un modelo de IA activo. Por favor, configure uno en la configuración.', {
        duration: 5000,
        icon: '⚙️'
      });
      return;
    }

    const userMessage = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Detectar si el mensaje contiene alguna palabra clave
      const lowerMsg = userMessage.toLowerCase();
      const hasKeyword = KEYWORDS.some(keyword => lowerMsg.includes(keyword));
      let aiText = '';

      if (hasKeyword) {
        // Obtener contexto de la base de datos
        const context = await getMaintenanceContext();
        const systemPrompt = `Eres un asistente especializado en gestión de flotas y mantenimiento de vehículos.\n\nTienes acceso al siguiente historial de la flota:\n\n${context}\n\nResponde a la consulta del usuario usando solo estos datos. Si no hay información suficiente, indícalo claramente.`;
        const response = await fetch('/.netlify/functions/chat-gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: activeModel.model_id || activeModel.name,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ]
          })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        aiText = (await response.text()) || 'No se pudo obtener respuesta de la IA.';
      } else {
        // Respuesta normal (sin contexto de la base de datos)
        const response = await fetch('/.netlify/functions/chat-gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: activeModel.model_id || activeModel.name,
            messages: getOpenAIMessages(),
          })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        aiText = await response.text();
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiText }]);
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      toast.error('Error al obtener respuesta. Por favor, verifique su API key e intente de nuevo.', {
        duration: 5000,
        icon: '❌'
      });
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: 'Lo siento, encontré un error. Por favor, intente de nuevo o verifique su API key en la configuración.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none transition-colors duration-200"
          onClick={() => setOpen(true)}
          aria-label="Open AI chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
      {/* Ventana flotante de chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 animate-fade-in transition-colors duration-200">
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700 bg-blue-600 rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">AI Assistant</span>
              {activeModel && (
                <span className="text-xs text-blue-100 ml-2">
                  ({activeModel.name})
                </span>
              )}
              <button
                onClick={fetchActiveModel}
                className="ml-1 p-1 rounded hover:bg-blue-700 text-blue-100 hover:text-white transition-colors"
                title="Actualizar modelo activo"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="ml-1 p-1 rounded hover:bg-blue-700 text-blue-100 hover:text-white transition-colors"
                title="Ayuda sobre preguntas de IA"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="text-white hover:text-gray-200 transition-colors duration-200"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Modal de ayuda */}
          <Dialog open={showHelp} onClose={() => setShowHelp(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-h-[420px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    Ayuda del Asistente de IA
                  </Dialog.Title>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="prose dark:prose-invert max-w-none text-sm mb-4">
                  <h2 className="text-base font-semibold text-blue-700 dark:text-blue-300 mb-1 dark:text-white">¿Cómo funciona el Asistente de IA de Flota?</h2>
                  <p className="text-gray-700 dark:text-white">
                    <span className="font-medium">Este asistente puede responder preguntas sobre el <em>estado</em>, <em>historial</em> y <em>mantenimientos</em> de tus vehículos, usando los <strong>datos reales</strong> de tu flota.</span>
                  </p>
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-200 mt-3 mb-1 dark:text-white">¿Cómo obtener respuestas basadas en los datos reales?</h3>
                  <p className="text-gray-700 dark:text-white">
                    Incluye alguna de las siguientes <strong>palabras clave</strong> en tu pregunta para que la IA use el contexto de la base de datos:
                  </p>
                  <ul className="list-disc pl-5">
                    <li><span className="font-mono dark:text-white">@vehiculos</span></li>
                    <li><span className="font-mono dark:text-white">@flota</span></li>
                    <li><span className="font-mono dark:text-white">@mantenimiento</span></li>
                    <li><span className="font-mono dark:text-white">@datos</span></li>
                  </ul>
                  <p className="mt-2 text-gray-700 dark:text-white">
                    <span className="italic">Por ejemplo:</span> <span className="bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded font-mono">¿Cuáles vehículos necesitan mantenimiento próximamente? @vehiculos</span>
                  </p>
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-200 mt-4 mb-1 dark:text-white">Ejemplos de preguntas que puedes hacer:</h3>
                  <ul className="list-disc pl-5">
                    {HELP_QUESTIONS.map((q, idx) => (
                      <li key={idx} className="mb-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 flex items-center justify-between">
                        <span className="select-all">{q}</span>
                        <button
                          className="ml-2 text-xs text-blue-600 hover:underline"
                          onClick={() => navigator.clipboard.writeText(q)}
                          title="Copiar pregunta"
                        >
                          Copiar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Puedes copiar y pegar cualquiera de estas preguntas en el chat para obtener respuestas basadas en los datos reales de tu flota.
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
          {/* Fin modal ayuda */}
          <div className="flex-1 overflow-y-auto mb-2 p-2 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-2 text-sm ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block px-2 py-1 rounded transition-colors duration-200 ${
                  msg.sender === 'user' 
                    ? 'bg-blue-200 dark:bg-blue-700 text-gray-800 dark:text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}>
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>AI está pensando...</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2 p-2 border-t dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg transition-colors duration-200">
            <input
              className="flex-1 border rounded p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors duration-200"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatGeminiAI;