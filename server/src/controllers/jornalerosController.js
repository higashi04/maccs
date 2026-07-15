import JornalerosModel from "../models/JornalerosModel";
import JornalerosActividadesModel from "../models/JornalerosActivitiesModel";

const jornalerosController = {
    crearJornalero: async (req, res) => {
        try {

            const jornalero = await JornalerosModel.create(req.body);

            return res.status(201).json(jornalero);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },
    ReadActiveJornaleros: async (req, res) => {
        try {
            const jornaleros = await JornalerosModel.find({activo: true}).lean();
            return res.status(200).json(jornaleros);
        }  catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },
    
}

export default jornalerosController;