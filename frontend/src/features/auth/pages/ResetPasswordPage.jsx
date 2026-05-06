import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { LockKeyhole, Key, Lock, Loader2, ArrowRight } from 'lucide-react';

export const ResetPasswordPage = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    const result = await resetPassword(data.token, data.newPassword, data.confirmPassword);
    
    if (result.success) {
      toast.success('Contraseña restablecida con éxito.');
      navigate('/login');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-[450px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <LockKeyhole className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase leading-none mb-3">
            Nueva <span className="text-primary">Contraseña</span>
          </h1>
          <p className="text-text-secondary text-sm font-medium px-4 leading-relaxed">
            Ingrese el token recibido y su nueva contraseña de seguridad.
          </p>
        </div>

        <div className="bank-card shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="label-field">Token de Seguridad</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Key className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  {...register('token', { required: 'El token es necesario' })}
                  type="text"
                  placeholder="Pegue el token aquí"
                  className="input-field pl-12 font-mono"
                />
              </div>
              {errors.token && <span className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.token.message}</span>}
            </div>

            <div>
              <label className="label-field">Nueva Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  {...register('newPassword', { 
                    required: 'Requerido',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                  })}
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-12"
                />
              </div>
              {errors.newPassword && <span className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.newPassword.message}</span>}
            </div>

            <div>
              <label className="label-field">Confirmar Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  {...register('confirmPassword', { 
                    required: 'Requerido',
                    validate: value => value === newPassword || 'No coinciden'
                  })}
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-12"
                />
              </div>
              {errors.confirmPassword && <span className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.confirmPassword.message}</span>}
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 group h-[52px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Actualizar Contraseña
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
