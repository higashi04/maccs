import PerfilModel from "../models/PerfilModel.js";

//** Perfil Controller */
const perfilesController = {
    CreatePerfil: async (req, res) => {
        try {
            const { nombrePerfil, modulos, createdBy } = req.body;

            const newPerfil = await PerfilModel.create({
                nombrePerfil,
                modulos,
                createdBy
            });

            return res.status(201).json(newPerfil);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },
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
