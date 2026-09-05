import ModulosModel from "../models/ModulosModel.js";
import PerfilModel from "../models/PerfilModel.js";

//** Module Controller */
const modulesController = {
    /**
     * Crea un nuevo módulo en la colección.
     * @param {import('express').Request} req - request con { nombreModulo, ruta, componente, icono } en el body.
     * @param {import('express').Response} res - responde con el módulo creado (201) o un error (500).
     */
    CreateModule: async (req, res) => {
        try {
            const { nombreModulo, ruta, componente, icono } = req.body;

            const newModulo = await ModulosModel.create({
                nombreModulo,
                ruta,
                componente,
                icono,
                createdBy: req.user?.username
            });

            return res.status(201).json(newModulo);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "server error" });
        }
    },
    /**
     * Obtiene los módulos disponibles para el usuario autenticado: todos si es administrador,
     * o solo los asignados a su perfil en caso contrario.
     * @param {import('express').Request} req - request con el usuario autenticado en req.user (isAdmin, perfil).
     * @param {import('express').Response} res - responde con la lista de módulos (200) o un error (500).
     */
    ReadModules: async(req, res) => {
        try {
            if (req.user?.isAdmin) {
                const modulos = await ModulosModel.find().lean();
                return res.status(200).json(modulos);
            }

            if (!req.user?.perfil) {
                return res.status(200).json([]);
            }

            const perfil = await PerfilModel.findById(req.user.perfil).populate("modulos").lean();
            return res.status(200).json(perfil?.modulos || []);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    }
}

export default modulesController;