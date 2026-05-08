import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { toast } from 'react-hot-toast';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Shield,
    User,
    Ban,
    CheckCircle2,
    Loader2,
    Mail,
    Phone
} from 'lucide-react';
import { UserAvatar } from '../../../shared/components/UserAvatar';

export const UsersManagementPage = () => {
    const { users, getAllUsers, updateUserStatus, updateUserRole, isLoading } = useAdminStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        getAllUsers();
    }, [getAllUsers]);

    const handleStatusToggle = async (user) => {
        const newStatus = !user.status;
        const result = await updateUserStatus(user.id, newStatus);
        if (result.success) {
            toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'}`);
            getAllUsers();
        } else {
            toast.error(result.error);
        }
    };

    const handleRoleToggle = async (user) => {
        const newRole = user.role === 'ADMIN_ROLE' ? 'USER_ROLE' : 'ADMIN_ROLE';
        const result = await updateUserRole(user.id, newRole);
        if (result.success) {
            toast.success(`Rol actualizado a ${newRole}`);
            getAllUsers();
        } else {
            toast.error(result.error);
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
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-3">
                        Gestión de <span className="text-primary">Usuarios</span>
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                            <Users className="w-6 h-6 text-primary" />
                        </span>
                    </h1>
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
            ) : (
                <div className="bank-card p-0 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface border-b border-border">
                                    <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Usuario</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Contacto</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Rol</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Estado</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <UserAvatar src={user.profilePicture} className="w-10 h-10" />
                                                <div>
                                                    <p className="text-sm font-bold text-text-primary">{user.name} {user.surname}</p>
                                                    <p className="text-[10px] text-text-secondary font-medium">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                    <Phone className="w-3 h-3" />
                                                    {user.phone || 'No registrado'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'ADMIN_ROLE' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {user.role === 'ADMIN_ROLE' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                {user.role === 'ADMIN_ROLE' ? 'Administrador' : 'Cliente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${user.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {user.status ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRoleToggle(user)}
                                                    title="Cambiar Rol"
                                                    className="p-2 text-text-secondary hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusToggle(user)}
                                                    title={user.status ? 'Desactivar' : 'Activar'}
                                                    className={`p-2 rounded-lg transition-all ${user.status
                                                            ? 'text-text-secondary hover:text-red-500 hover:bg-red-50'
                                                            : 'text-text-secondary hover:text-green-500 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {user.status ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No se encontraron usuarios</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};