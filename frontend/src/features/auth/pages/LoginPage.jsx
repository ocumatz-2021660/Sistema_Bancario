import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { Wallet, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await login(data.emailOrUsername, data.password);
    
    if (result.success) {
      toast.success('¡Bienvenido de nuevo!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[450px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/20 mb-6">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none mb-3">
            Ban<span className="text-primary">Kinal</span>
          </h1>
          <p className="text-text-secondary font-semibold text-sm uppercase tracking-widest">
            Banca Digital Institucional
          </p>
        </div>

        <div className="bank-card shadow-xl border-t-4 border-t-primary">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="label-field">Usuario o Correo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    {...register('emailOrUsername', { required: 'Este campo es obligatorio' })}
                    type="text"
                    placeholder="Ej. usuario123"
                    className="input-field pl-12"
                  />
                </div>
                {errors.emailOrUsername && (
                  <span className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1 tracking-wider">
                    {errors.emailOrUsername.message}
                  </span>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="label-field mb-0">Contraseña</label>
                  <Link 
                    to="/forgot-password" 
                    className="text-[10px] font-bold text-primary hover:text-primary-dark uppercase tracking-wider"
                  >
                    ¿Olvidó su clave?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    {...register('password', { required: 'La contraseña es obligatoria' })}
                    type="password"
                    placeholder="••••••••"
                    className="input-field pl-12"
                  />
                </div>
                {errors.password && (
                  <span className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1 tracking-wider">
                    {errors.password.message}
                  </span>
                )}
              </div>
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
                  Ingresar a mi cuenta
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-text-secondary text-sm font-medium">
              ¿No tiene una cuenta?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Afíliese hoy mismo
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-[0.2em]">
            © 2026 BanKinal — Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};
