import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { MailCheck, Key, Loader2, ArrowRight } from 'lucide-react';

export const VerifyEmailPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { verifyEmail, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const result = await verifyEmail(data.token);

        if (result.success) {
            toast.success('¡Correo verificado con éxito! Ya puedes iniciar sesión.');
            navigate('/login');
        } else {
            toast.error(result.error || 'Token inválido o expirado');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-[450px] relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                        <MailCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase leading-none mb-3">
                        Verifique su <span className="text-primary">Cuenta</span>
                    </h1>
                    <p className="text-text-secondary text-sm font-medium px-4">
                        Hemos enviado un código de seguridad a su dirección de correo electrónico.
                    </p>
                </div>

                <div className="bank-card shadow-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="label-field">Código de Verificación</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Key className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    {...register('token', { required: 'El código es necesario' })}
                                    type="text"
                                    placeholder="Ingrese el código aquí"
                                    className="input-field pl-12 text-center tracking-[0.3em] font-mono font-bold"
                                />
                            </div>
                            {errors.token && (
                                <span className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1 tracking-wider">
                                    {errors.token.message}
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
                                    Verificar Correo
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <p className="text-text-secondary text-xs font-medium leading-relaxed">
                            ¿No recibió el correo? Revise su carpeta de spam o contacte a soporte técnico si el problema persiste.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
