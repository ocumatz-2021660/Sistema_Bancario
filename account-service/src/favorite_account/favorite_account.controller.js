
import Favorito from './favorite_account.model.js';
import Cuenta from '../account/account.model.js';


export const addFavorito = async (req, res) => {
    try {
        const { no_cuenta, alias_favorito } = req.body;
        const dueno_favorito = req.userId;


        const cuentaExiste = await Cuenta.findOne({ no_cuenta, isActive: true });
        if (!cuentaExiste) {
            return res.status(404).json({
                success: false,
                message: 'La cuenta especificada no existe o está inactiva'
            });
        }


        if (cuentaExiste.usuario_cuenta === dueno_favorito) {
            return res.status(400).json({
                success: false,
                message: 'No puedes agregar tu propia cuenta como favorito'
            });
        }

        const favorito = new Favorito({ dueno_favorito, no_cuenta, alias_favorito });
        await favorito.save();

        return res.status(201).json({
            success: true,
            message: 'Favorito agregado exitosamente',
            data: favorito
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Esta cuenta ya está en tus favoritos'
            });
        }
        return res.status(500).json({ success: false, message: 'Error al agregar favorito', error: error.message });
    }
};


export const getMisFavoritos = async (req, res) => {
    try {
        const dueno_favorito = req.userId;  // solo ve los suyos

        const favoritos = await Favorito.find({ dueno_favorito });

        return res.status(200).json({
            success: true,
            total: favoritos.length,
            data: favoritos
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener favoritos', error: error.message });
    }
};

export const updateAliasFavorito = async (req, res) => {
    try {
        const { id } = req.params;
        const { alias_favorito } = req.body;
        const dueno_favorito = req.userId;

        const favorito = await Favorito.findById(id);
        if (!favorito) {
            return res.status(404).json({ success: false, message: 'Favorito no encontrado' });
        }

        // Solo el dueño puede modificarlo
        if (favorito.dueno_favorito !== dueno_favorito) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para modificar este favorito' });
        }

        favorito.alias_favorito = alias_favorito;
        await favorito.save();

        return res.status(200).json({ success: true, message: 'Alias actualizado', data: favorito });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al actualizar favorito', error: error.message });
    }
};


export const deleteFavorito = async (req, res) => {
    try {
        const { id } = req.params;
        const dueno_favorito = req.userId;

        const favorito = await Favorito.findById(id);
        if (!favorito) {
            return res.status(404).json({ success: false, message: 'Favorito no encontrado' });
        }

        if (favorito.dueno_favorito !== dueno_favorito) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este favorito' });
        }

        await Favorito.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: 'Favorito eliminado exitosamente' });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al eliminar favorito', error: error.message });
    }
};