import mongoose from "mongoose";
import JornaleroActividadesModel from "../models/JornaleroActividadesModel.js";
import OrdenCompraModel from "../models/OrdenCompraModel.js";

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
     * Registra las actividades diarias realizadas por un jornalero, ligadas a una orden de compra.
     * @param {import('express').Request} req - request con { jornalero, ordenCompra, fecha, modelo, ...camposDeActividad } en el body.
     * @param {import('express').Response} res - responde con el registro creado (201) o un error (400/404/500).
     */
    crearActividad: async (req, res) => {
        try {
            const { jornalero, ordenCompra, fecha, modelo } = req.body;

            if (!mongoose.isValidObjectId(ordenCompra)) {
                return res.status(400).json({ message: "Orden de compra inválida o faltante" });
            }

            const orden = await OrdenCompraModel.findById(ordenCompra).lean();
            if (!orden) {
                return res.status(404).json({ message: "Orden de compra no encontrada" });
            }

            const datosActividad = CAMPOS_ACTIVIDAD.reduce((acumulado, campo) => {
                if (req.body[campo] !== undefined) acumulado[campo] = req.body[campo];
                return acumulado;
            }, {});

            const actividad = await JornaleroActividadesModel.create({
                jornalero,
                ordenCompra,
                fecha,
                modelo,
                ...datosActividad,
                createdBy: req.user?.username,
            });

            await actividad.populate([
                { path: "jornalero", select: "nombre" },
                { path: "ordenCompra", select: "ordenCompra modeloSillas" },
            ]);

            return res.status(201).json(actividad);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

    /**
     * Obtiene el registro de actividades diarias, filtrable por jornalero y/o por orden de compra.
     * @param {import('express').Request} req - request con ?jornalero=<id> y/o ?ordenCompra=<id> opcionales en el query.
     * @param {import('express').Response} res - responde con el arreglo de registros (200) o un error (500).
     */
    ReadActividades: async (req, res) => {
        try {
            const { jornalero, ordenCompra } = req.query;
            const filtro = {
                ...(jornalero ? { jornalero } : {}),
                ...(ordenCompra ? { ordenCompra } : {}),
            };

            const actividades = await JornaleroActividadesModel
                .find(filtro)
                .sort({ fecha: -1, createdAt: -1 })
                .populate("jornalero", "nombre")
                .populate("ordenCompra", "ordenCompra modeloSillas")
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
