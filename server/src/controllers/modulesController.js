import ModulosModel from "../models/ModulosModel.js";

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
     * Obtiene todos los módulos registrados.
     * @param {import('express').Request} req - request sin parámetros esperados.
     * @param {import('express').Response} res - responde con la lista de módulos (200) o un error (500).
     */
    ReadModules: async(req, res) => {
        try {
            const modulos = await ModulosModel.find().lean();
            return res.status(200).json(modulos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    }
}

export default modulesController;