import ModulosModel from "../models/ModulosModel.js";

//** Module Controller */
const modulesController = {
    CreateModule: async (req, res) => {
        try {
            const { nombreModulo, ruta, componente, icono, createdBy } = req.body;

            const newModulo = await ModulosModel.create({
                nombreModulo,
                ruta,
                componente,
                icono,
                createdBy
            });

            return res.status(201).json(newModulo);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "server error" });
        }
    },
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