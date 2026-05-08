import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Mail, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { forgotPassword, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const result = await forgotPassword(data.email);

        if (result.success) {
            toast.success('Se han enviado instrucciones a su correo.');
            navigate('/reset-password');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-[450px] relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl mb-6">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase leading-none mb-3">
                        Recuperar <span className="text-primary">Clave</span>
                    </h1>
                    <p className="text-text-secondary text-sm font-medium px-4 leading-relaxed">
                        Ingrese su correo electrónico y le enviaremos un token para restablecer su contraseña de seguridad.
                    </p>
                </div>

                <div className="bank-card shadow-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="label-field">Correo Electrónico</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    {...register('email', {
                                        required: 'El correo es necesario',
                                        pattern: { value: /^\S+@\S+$/i, message: 'Formato de correo inválido' }
                                    })}
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    className="input-field pl-12"
                                />
                            </div>
                            {errors.email && (
                                <span className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1 tracking-wider">
                                    {errors.email.message}
                                </span>
                            )}
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
                                    Enviar Instrucciones
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                            <ArrowLeft className="w-4 h-4" />
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
