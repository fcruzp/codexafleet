import { Dialog } from '@headlessui/react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Listbox } from '@headlessui/react';

interface LLMModel {
  id: string;
  name: string;
  path: string;
  is_active: boolean;
  provider: string;
}

interface LLMModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDERS = [
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'google', label: 'Google' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'meta', label: 'Meta' },
];

export default function LLMModelsModal({ isOpen, onClose }: LLMModelsModalProps) {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newModel, setNewModel] = useState({ name: '', path: '', provider: PROVIDERS[0].value });

  useEffect(() => {
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from('llm_models')
        .select('*')
        .order('created_at');

      if (error) throw error;
      setModels(data || []);
    } catch (err) {
      console.error('Error fetching models:', err);
      toast.error('Error al cargar los modelos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalToggleActive = (id: string) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, is_active: !m.is_active } : m
      )
    );
  };

  const handleDeleteModel = async (id: string) => {
    try {
      const { error } = await supabase.from('llm_models').delete().eq('id', id);
      if (error) throw error;
      setModels((prev) => prev.filter((m) => m.id !== id));
      toast.success('Modelo eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting model:', err);
      toast.error('Error al eliminar el modelo');
    }
  };

  const handleLocalAddModel = () => {
    if (!newModel.name || !newModel.path) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    setModels((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: newModel.name,
        path: newModel.path,
        is_active: true,
        provider: newModel.provider,
      },
    ]);
    setNewModel({ name: '', path: '', provider: PROVIDERS[0].value });
  };

  const handleCancel = () => {
    fetchModels();
    onClose();
  };

  const handleSave = async () => {
    if (!models.some((m) => m.is_active)) {
      toast.error('Debe haber al menos un modelo activo.');
      return;
    }
    setIsLoading(true);
    try {
      const newModels = models.filter(m => m.id.startsWith('temp-'));
      if (newModels.length > 0) {
        const { error } = await supabase.from('llm_models').insert(
          newModels.map(({ name, path, is_active, provider }) => ({ name, path, is_active, provider }))
        );
        if (error) throw error;
      }
      const existingModels = models.filter(m => !m.id.startsWith('temp-'));
      for (const m of existingModels) {
        const { data, error, count, status } = await supabase.from('llm_models')
          .update({ name: m.name, path: m.path, is_active: m.is_active, provider: m.provider })
          .eq('id', m.id);
        if (error) throw error;
      }
      toast.success('Cambios guardados correctamente');
      await fetchModels();
      onClose();
    } catch (err) {
      console.error('Error guardando cambios:', err);
      toast.error('Error al guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
              Gestionar Modelos LLM
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Añadir Nuevo Modelo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newModel.name}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  placeholder="Nombre del modelo"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={newModel.path}
                  onChange={(e) => setNewModel({ ...newModel, path: e.target.value })}
                  placeholder="Ruta del modelo (ej: openai/gpt-3.5-turbo)"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
                  <Listbox value={newModel.provider} onChange={val => setNewModel({ ...newModel, provider: val })}>
                    <div className="relative">
                      <Listbox.Button className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left">
                        {PROVIDERS.find(p => p.value === newModel.provider)?.label}
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {PROVIDERS.map((prov) => (
                          <Listbox.Option
                            key={prov.value}
                            value={prov.value}
                            className={({ active }) =>
                              `cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-white'}`
                            }
                          >
                            {prov.label}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>
              <button
                onClick={handleLocalAddModel}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Añadir Modelo
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Modelos Disponibles
              </h3>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : models.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No hay modelos configurados
                </p>
              ) : (
                <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          ID
                        </th> */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Ruta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {models.map((model) => (
                        <tr key={model.id}>
                          {/* <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                            {model.id}
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {model.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {model.path}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleLocalToggleActive(model.id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                model.is_active
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                              }`}
                            >
                              {model.is_active ? 'Activo' : 'Inactivo'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteModel(model.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
            >
              <Save className="h-5 w-5 mr-2" />
              Guardar cambios
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 