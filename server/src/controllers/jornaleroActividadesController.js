import JornaleroActividadesModel from "../models/JornaleroActividadesModel.js";

/** Campos numéricos de actividades capturados en cada registro diario. */
const CAMPOS_ACTIVIDAD = [
    "respaldos",
    "quitarAsientos",
    "raspar",
    "carpinteria",
    "botarClavosYResanar",
    "pulir",
    "lijaDeMano",
    "primeraTinta",
    "segundaTinta",
    "terceraTinta",
    "sellador",
    "primer",
    "inicio",
    "tejidas",
    "asentada",
    "laca",
    "ponerResbalones",
    "asentarConCarton",
    "porDia",
    "porHora",
];

//** Jornalero Actividades Controller */
const jornaleroActividadesController = {
    /**
     * Registra las actividades diarias realizadas por un jornalero.
     * @param {import('express').Request} req - request con { jornalero, fecha, modelo, ...camposDeActividad } en el body.
     * @param {import('express').Response} res - responde con el registro creado (201) o un error (500).
     */
    crearActividad: async (req, res) => {
        try {
            const { jornalero, fecha, modelo } = req.body;

            const datosActividad = CAMPOS_ACTIVIDAD.reduce((acumulado, campo) => {
                if (req.body[campo] !== undefined) acumulado[campo] = req.body[campo];
                return acumulado;
            }, {});

            const actividad = await JornaleroActividadesModel.create({
                jornalero,
                fecha,
                modelo,
                ...datosActividad,
                createdBy: req.user?.username,
            });

            await actividad.populate("jornalero", "nombre");

            return res.status(201).json(actividad);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

    /**
     * Obtiene el registro de actividades diarias, opcionalmente filtrado por jornalero.
     * @param {import('express').Request} req - request con ?jornalero=<id> opcional en el query.
     * @param {import('express').Response} res - responde con el arreglo de registros (200) o un error (500).
     */
    ReadActividades: async (req, res) => {
        try {
            const { jornalero } = req.query;
            const filtro = jornalero ? { jornalero } : {};

            const actividades = await JornaleroActividadesModel
                .find(filtro)
                .sort({ fecha: -1, createdAt: -1 })
                .populate("jornalero", "nombre")
                .lean();

            return res.status(200).json(actividades);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

    /**
     * Elimina un registro de actividad diaria.
     * @param {import('express').Request} req - request con :id del registro.
     * @param {import('express').Response} res - responde con el registro eliminado (200) o un error (404/500).
     */
    eliminarActividad: async (req, res) => {
        try {
            const { id } = req.params;

            const actividad = await JornaleroActividadesModel.findByIdAndDelete(id);

            if (!actividad) {
                return res.status(404).json({ message: "Registro no encontrado" });
            }

            return res.status(200).json(actividad);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },
};

export default jornaleroActividadesController;
