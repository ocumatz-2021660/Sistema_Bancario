import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import {
    Wallet,
    User,
    Mail,
    Lock,
    Phone,
    Camera,
    Loader2,
    ArrowLeft,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';

export const RegisterPage = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { register: registerUser, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);

    const password = watch('password');

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
        Object.keys(data).forEach(key => {
            if (key === 'profilePicture') {
                if (data[key][0]) formData.append(key, data[key][0]);
            } else {
                formData.append(key, data[key]);
            }
        });

        const result = await registerUser(formData);

        if (result.success) {
            toast.success('Registro exitoso. Por favor verifica tu correo.');
            navigate('/verify-email');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-[800px] relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/login"
                        className="w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center text-text-secondary hover:text-primary transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase leading-none">
                            Afiliación <span className="text-primary">Digital</span>
                        </h1>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                            Complete el formulario para unirse a BanKinal
                        </p>
                    </div>
                </div>

                <div className="bank-card shadow-xl overflow-hidden border-t-4 border-t-primary">
                    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Profile Picture Section */}
                            <div className="flex flex-col items-center justify-center p-6 bg-background rounded-2xl border border-dashed border-border group hover:border-primary transition-colors relative">
                                <div className="relative w-32 h-32 mb-4">
                                    <div className="w-full h-full rounded-full bg-surface border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-border group-hover:text-primary/30 transition-colors" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-dark transition-colors">
                                        <Camera className="w-5 h-5" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            {...register('profilePicture')}
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Foto de perfil</p>
                                <p className="text-[10px] text-text-secondary/60 mt-1 uppercase">(Opcional)</p>

                                <div className="mt-8 space-y-4 w-full">
                                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                                        <p className="text-[11px] text-text-primary leading-relaxed">
                                            Sus datos están protegidos por encriptación de nivel bancario. Al registrarse, acepta nuestros términos y condiciones.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields Section */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-field">Nombres</label>
                                        <input
                                            {...register('name', { required: 'Requerido' })}
                                            type="text"
                                            className="input-field"
                                            placeholder="Juan"
                                        />
                                        {errors.name && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.name.message}</span>}
                                    </div>
                                    <div>
                                        <label className="label-field">Apellidos</label>
                                        <input
                                            {...register('surname', { required: 'Requerido' })}
                                            type="text"
                                            className="input-field"
                                            placeholder="Pérez"
                                        />
                                        {errors.surname && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.surname.message}</span>}
                                    </div>
                                </div>

                                <div>
                                    <label className="label-field">Nombre de Usuario</label>
                                    <input
                                        {...register('username', { required: 'Requerido' })}
                                        type="text"
                                        className="input-field"
                                        placeholder="juanperez_26"
                                    />
                                    {errors.username && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.username.message}</span>}
                                </div>

                                <div>
                                    <label className="label-field">Correo Electrónico</label>
                                    <input
                                        {...register('email', {
                                            required: 'Requerido',
                                            pattern: { value: /^\S+@\S+$/i, message: 'Formato inválido' }
                                        })}
                                        type="email"
                                        className="input-field"
                                        placeholder="juan.perez@ejemplo.com"
                                    />
                                    {errors.email && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.email.message}</span>}
                                </div>

                                <div>
                                    <label className="label-field">Teléfono</label>
                                    <input
                                        {...register('phone', {
                                            required: 'Requerido',
                                            minLength: { value: 8, message: 'Mínimo 8 dígitos' }
                                        })}
                                        type="text"
                                        className="input-field"
                                        placeholder="55554444"
                                    />
                                    {errors.phone && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.phone.message}</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-field">Contraseña</label>
                                        <input
                                            {...register('password', { required: 'Requerido', minLength: { value: 8, message: 'Mín. 8 caracteres' } })}
                                            type="password"
                                            className="input-field"
                                            placeholder="••••••••"
                                        />
                                        {errors.password && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.password.message}</span>}
                                    </div>
                                    <div>
                                        <label className="label-field">Confirmar</label>
                                        <input
                                            {...register('confirmPassword', {
                                                required: 'Requerido',
                                                validate: value => value === password || 'No coinciden'
                                            })}
                                            type="password"
                                            className="input-field"
                                            placeholder="••••••••"
                                        />
                                        {errors.confirmPassword && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.confirmPassword.message}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border flex justify-end">
                            <button
                                disabled={isLoading}
                                type="submit"
                                className="btn-primary flex items-center justify-center gap-2 px-10 h-[52px] group"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Finalizar Afiliación
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
