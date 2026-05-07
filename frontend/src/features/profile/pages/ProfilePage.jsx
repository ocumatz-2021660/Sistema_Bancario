import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Camera, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle2, 
  Loader2, 
  Save,
  Building2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ProfilePage = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [preview, setPreview] = useState(user?.profilePicture);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name,
      surname: user?.surname,
      phone: user?.phone
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('surname', data.surname);
    formData.append('phone', data.phone);
    
    if (data.profilePicture[0]) {
      formData.append('profilePicture', data.profilePicture[0]);
    }

    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('¡Perfil actualizado correctamente!');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-black text-text-primary tracking-tighter">
          Configuración de <span className="text-primary">Perfil</span> 👤
        </h1>
        <p className="text-text-secondary font-medium mt-2">Gestiona tu identidad y seguridad dentro del ecosistema BanKinal.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Foto y Resumen */}
        <div className="space-y-6">
          <div className="bank-card text-center p-10 flex flex-col items-center shadow-xl">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1 relative overflow-hidden group-hover:border-primary transition-all duration-300">
                <img 
                  src={preview || 'https://via.placeholder.com/150'} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <label className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-dark transition-all scale-90 hover:scale-100">
                <Camera className="w-5 h-5" />
                <input 
                  type="file" 
                  className="hidden" 
                  {...register('profilePicture')}
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </label>
            </div>
            
            <h3 className="text-xl font-black text-text-primary tracking-tight">{user?.name} {user?.surname}</h3>
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-1">
              {user?.role === 'ADMIN_ROLE' ? 'Administrador del Sistema' : 'Cliente Institucional'}
            </p>

            <div className="w-full h-px bg-border my-6"></div>

            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-text-secondary flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</span>
                <span className="text-text-primary truncate ml-4">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-text-secondary flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Estado</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-black uppercase">Verificado</span>
              </div>
            </div>
          </div>

          <div className="bank-card bg-primary-dark text-white border-none p-8">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-primary-light" />
              <h4 className="font-black text-sm uppercase tracking-widest">BanKinal S.A.</h4>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed font-medium">
              Miembro desde: <br />
              <span className="text-white font-bold">{user?.createdAt ? format(new Date(user.createdAt), "dd 'de' MMMM, yyyy", { locale: es }) : 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="lg:col-span-2">
          <div className="bank-card shadow-xl border-t-4 border-t-primary">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-field">Nombres</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input 
                      {...register('name', { required: 'Requerido' })}
                      className="input-field pl-12"
                      placeholder="Tus nombres"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-field">Apellidos</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input 
                      {...register('surname', { required: 'Requerido' })}
                      className="input-field pl-12"
                      placeholder="Tus apellidos"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label-field">Teléfono de Contacto</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                  <input 
                    {...register('phone')}
                    className="input-field pl-12"
                    placeholder="+502 0000-0000"
                  />
                </div>
              </div>

              <div className="bg-background p-6 rounded-2xl border border-border space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shrink-0 border border-border">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-text-primary uppercase tracking-tight mb-1">Actividad Reciente</h4>
                    <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
                      Última actualización: {user?.updatedAt ? format(new Date(user.updatedAt), "dd/MM/yyyy HH:mm") : 'Nunca'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end">
                <button
                  disabled={isLoading}
                  type="submit"
                  className="btn-primary px-10 h-14 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
