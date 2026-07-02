import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { toast } from 'react-hot-toast';
import {
  CircleUserRound,
  Camera,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Loader2,
  Save,
  Building2,
  AtSign
} from 'lucide-react';
import { UserAvatar } from '../../../shared/components/userAvatar';

export const ProfilePage = () => {
  const { user, updateProfile, getProfile, isLoading } = useAuthStore();
  const [preview, setPreview] = useState(user?.profilePicture);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        surname: user.surname || '',
        phone: user.phone || '',
        username: user.username || '',
      });
      setPreview(user.profilePicture);
    }
  }, [user, reset]);

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
    if (data.username) formData.append('username', data.username);

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
        <h1 className="text-3xl sm:text-3xl lg:text-5xl font-black flex flex-wrap items-center gap-2">
          Configuración de <span className="text-primary">Perfil</span>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 ml-3">
            <CircleUserRound className="w-6 h-6 text-primary" />
          </span>
        </h1>
        <p className="text-text-secondary font-medium mt-2">Gestiona tu identidad y seguridad dentro del ecosistema CyberVaul.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Foto y Resumen */}
        <div className="space-y-6">
          <div className="bank-card text-center p-10 flex flex-col items-center shadow-xl">
            <div className="relative group mb-6">
              <UserAvatar
                src={preview}
                className="w-32 h-32 border-4 border-primary/20 group-hover:border-primary transition-all duration-300"
                iconSize="w-12 h-12"
              />
              <label className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-dark transition-all scale-90 hover:scale-100">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  {...register('profilePicture', {
                    onChange: (e) => handleImageChange(e)
                  })}
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
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary-light" />
              <h4 className="font-black text-sm uppercase tracking-widest">CyberVaul</h4>
            </div>
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
                    <CircleUserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
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
                    <CircleUserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
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

              <div>
                <label className="label-field">Nombre de Usuario</label>
                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                  <input
                    {...register('username', {
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                      maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                      pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Solo letras, números y guión bajo' }
                    })}
                    className="input-field pl-12"
                    placeholder="tu_username"
                  />
                </div>
                {errors.username && (
                  <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.username.message}</p>
                )}
                <p className="text-[10px] text-text-secondary font-medium mt-1">Actual: @{user?.username}</p>
              </div>

              <div>
                <label className="label-field">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    value={user?.email || ''}
                    readOnly
                    className="input-field pl-12 opacity-60 cursor-not-allowed bg-surface"
                  />
                </div>
                <p className="text-[10px] text-text-secondary font-medium mt-1">El correo no puede modificarse.</p>
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
