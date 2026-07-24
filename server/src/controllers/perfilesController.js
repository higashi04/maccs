import PerfilModel from "../models/PerfilModel.js";

//** Perfil Controller */
const perfilesController = {
    /**
     * Crea un nuevo perfil en la colección.
     * @param {import('express').Request} req - request con { nombrePerfil, modulos } en el body.
     * @param {import('express').Response} res - responde con el perfil creado (201) o un error (500).
     */
    CreatePerfil: async (req, res) => {
        try {
            const { nombrePerfil, modulos } = req.body;

            const newPerfil = await PerfilModel.create({
                nombrePerfil,
                modulos,
                createdBy: req.user?.username
            });

            return res.status(201).json(newPerfil);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },
    /**
     * Obtiene todos los perfiles registrados, con sus módulos poblados.
     * @param {import('express').Request} req - request sin parámetros esperados.
     * @param {import('express').Response} res - responde con la lista de perfiles (200) o un error (500).
     */
    ReadPerfiles: async (req, res) => {
        try {
            const perfiles = await PerfilModel.find().populate("modulos").lean();
            return res.status(200).json(perfiles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    }
}

export default perfilesController;
