import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { toast } from 'react-hot-toast';
import {
    Users,
    Search,
    Shield,
    User,
    Ban,
    CheckCircle2,
    Loader2,
    Mail,
    Phone
} from 'lucide-react';
import { UserAvatar } from '../../../shared/components/userAvatar';

export const UsersManagementPage = () => {
    const { users, getAllUsers, updateUserStatus, updateUserRole, isLoading } = useAdminStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        getAllUsers();
    }, [getAllUsers]);

    const handleActivate = async (user) => {
        const result = await updateUserStatus(user.id, true);
        if (result.success) {
            toast.success('Usuario activado exitosamente');
        } else {
            toast.error(result.error || 'No se pudo activar al usuario');
        }
    };

    const handleDeactivate = async (user) => {
        const result = await updateUserStatus(user.id, false);
        if (result.success) {
            toast.success('Usuario desactivado exitosamente');
        } else {
            toast.error(result.error || 'No se pudo desactivar al usuario');
        }
    };

    const handleRoleToggle = async (user) => {
        const newRole = user.role === 'ADMIN_ROLE' ? 'USER_ROLE' : 'ADMIN_ROLE';
        const result = await updateUserRole(user.id, newRole);
        if (result.success) {
            toast.success(`Rol actualizado a ${newRole === 'ADMIN_ROLE' ? 'Administrador' : 'Cliente'}`);
        } else {
            toast.error(result.error || 'No se pudo actualizar el rol');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tighter">
                            Gestión de <span className="text-primary">Usuarios</span>
                        </h1>
                        <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </span>
                    </div>
                    <p className="text-text-secondary font-medium mt-2">Control total sobre los accesos y roles del sistema.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Nombre, email o user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-12 h-12"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="input-field h-12 px-4 cursor-pointer w-full sm:w-auto"
                    >
                        <option value="ALL">Todos los roles</option>
                        <option value="ADMIN_ROLE">Administradores</option>
                        <option value="USER_ROLE">Clientes</option>
                    </select>
                </div>
            </header>
            {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Cargando base de datos...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No se encontraron usuarios</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="bank-card p-6 flex flex-col gap-4 hover:shadow-xl hover:bg-green-50 transition-shadow">

                            {/* Avatar + nombre */}
                            <div className="flex flex-col items-center text-center gap-2">
                                <UserAvatar src={user.profilePicture} className="w-20 h-20" />
                                <div>
                                    <p className="text-sm font-bold text-text-primary">{user.name} {user.surname}</p>
                                    <p className="text-[11px] text-text-secondary font-medium">@{user.username}</p>
                                </div>
                            </div>

                            {/* Contacto */}
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Contacto</p>
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                    <Mail className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                    <Phone className="w-3 h-3 shrink-0" />
                                    {user.phone || 'No registrado'}
                                </div>
                            </div>

                            {/* Rol */}
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Rol</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'ADMIN_ROLE'
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {user.role === 'ADMIN_ROLE' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                    {user.role === 'ADMIN_ROLE' ? 'Administrador' : 'Cliente'}
                                </span>
                            </div>

                            {/* Estado */}
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${user.status ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className={`text-xs font-bold ${user.status ? 'text-green-600' : 'text-red-500'}`}>
                                    {user.status ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-2 pt-2 border-t border-border mt-auto">
                                <button
                                    onClick={() => handleRoleToggle(user)}
                                    title="Cambiar Rol"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-text-secondary hover:text-amber-500 hover:bg-amber-100 rounded-lg transition-all"
                                >
                                    <Shield className="w-4 h-4" />
                                    Rol
                                </button>

                                {!user.status && (
                                    <button
                                        onClick={() => handleActivate(user)}
                                        title="Activar cuenta"
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-text-secondary hover:text-green-500 hover:bg-blue-100 rounded-lg transition-all"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Activar
                                    </button>
                                )}

                                {user.status && (
                                    <button
                                        onClick={() => handleDeactivate(user)}
                                        title="Desactivar cuenta"
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-text-secondary hover:text-red-500 hover:bg-red-100 rounded-lg transition-all"
                                    >
                                        <Ban className="w-4 h-4" />
                                        Banear
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
