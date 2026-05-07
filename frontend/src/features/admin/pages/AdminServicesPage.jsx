import { useEffect, useState } from 'react';
import { useServiceStore } from '../../services/store/useServiceStore';
import { toast } from 'react-hot-toast';
import { 
  Gift, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  X,
  Zap,
  Tag
} from 'lucide-react';

export const AdminServicesPage = () => {
  const { services, getServices, createService, updateService, deleteService, isLoading, error } = useServiceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', points: '' });

  useEffect(() => {
    if (services.length === 0 && !isLoading && !error) {
      getServices();
    }
  }, [getServices, services.length, isLoading, error]);

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({ name: service.name, description: service.description, points: service.points });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', points: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = editingService 
      ? await updateService(editingService._id, formData)
      : await createService(formData);

    if (result.success) {
      toast.success(`Servicio ${editingService ? 'actualizado' : 'creado'} correctamente`);
      setIsModalOpen(false);
      getServices();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que desea eliminar este servicio?')) return;
    const result = await deleteService(id);
    if (result.success) {
      toast.success('Servicio eliminado');
      getServices();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-3">
            Gestión de <span className="text-primary">Servicios</span>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Gift className="w-6 h-6 text-primary" />
            </span>
          </h1>
          <p className="text-text-secondary font-medium mt-2">Configura el catálogo de pagos y canjes disponibles.</p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary px-8 h-12 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </button>
      </header>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Sincronizando catálogo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service._id} className="bank-card group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleOpenModal(service)}
                    className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(service._id)}
                    className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1">{service.name}</h3>
              <p className="text-xs text-text-secondary mb-6 line-clamp-2">{service.description}</p>
              <div className="pt-4 border-t border-border">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Costo Configurado</p>
                <p className="text-xl font-black text-primary tracking-tighter">Q {service.points?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-border">
            <div className="p-8 border-b border-border bg-primary-dark text-white relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-black tracking-tighter">{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="label-field">Nombre del Servicio</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Ej. Pago de Luz"
                />
              </div>
              <div>
                <label className="label-field">Descripción</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field py-3 h-24 resize-none"
                  placeholder="Descripción detallada..."
                />
              </div>
              <div>
                <label className="label-field">Costo en Quetzales</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input 
                    type="number"
                    required
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: e.target.value})}
                    className="input-field pl-12"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="btn-primary w-full h-14"
              >
                {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
