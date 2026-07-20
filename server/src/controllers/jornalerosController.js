import JornalerosModel from "../models/JornalerosModel.js";

//** Jornaleros Controller */
const jornalerosController = {
    /**
     * Crea un nuevo jornalero en la colección.
     * @param {import('express').Request} req - request con { nombre, activo } en el body.
     * @param {import('express').Response} res - responde con el jornalero creado (201) o un error (500).
     */
    crearJornalero: async (req, res) => {
        try {
            const { nombre, activo } = req.body;

            const jornalero = await JornalerosModel.create({
                nombre,
                activo,
                createdBy: req.user?.username,
            });

            return res.status(201).json(jornalero);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

    /**
     * Obtiene los jornaleros activos.
     * @param {import('express').Request} req
     * @param {import('express').Response} res - responde con el arreglo de jornaleros activos (200) o un error (500).
     */
    ReadActiveJornaleros: async (req, res) => {
        try {
            const jornaleros = await JornalerosModel.find({ activo: true }).lean();
            return res.status(200).json(jornaleros);
        }  catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

    /**
     * Obtiene todos los jornaleros, activos e inactivos, para su gestión.
     * @param {import('express').Request} req
     * @param {import('express').Response} res - responde con el arreglo completo de jornaleros (200) o un error (500).
     */
    ReadAllJornaleros: async (req, res) => {
        try {
            const jornaleros = await JornalerosModel.find({}).lean();
            return res.status(200).json(jornaleros);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

    /**
     * Actualiza el nombre y/o estado activo de un jornalero.
     * @param {import('express').Request} req - request con :id del jornalero y { nombre, activo } en el body.
     * @param {import('express').Response} res - responde con el jornalero actualizado (200) o un error (404/500).
     */
    actualizarJornalero: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, activo } = req.body;

            const jornalero = await JornalerosModel.findByIdAndUpdate(
                id,
                {
                    ...(nombre !== undefined ? { nombre } : {}),
                    ...(activo !== undefined ? { activo } : {}),
                    updatedBy: req.user?.username,
                },
                { new: true, runValidators: true }
            );

            if (!jornalero) {
                return res.status(404).json({ message: "Jornalero no encontrado" });
            }

            return res.status(200).json(jornalero);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

    /**
     * Elimina (desactiva) un jornalero. Conserva su historial de préstamos.
     * @param {import('express').Request} req - request con :id del jornalero.
     * @param {import('express').Response} res - responde con el jornalero desactivado (200) o un error (404/500).
     */
    eliminarJornalero: async (req, res) => {
        try {
            const { id } = req.params;

            const jornalero = await JornalerosModel.findByIdAndUpdate(
                id,
                { activo: false, updatedBy: req.user?.username },
                { new: true }
            );

            if (!jornalero) {
                return res.status(404).json({ message: "Jornalero no encontrado" });
            }

            return res.status(200).json(jornalero);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

    /**
     * Agrega un nuevo préstamo pendiente a un jornalero.
     * @param {import('express').Request} req - request con :id del jornalero y { fecha, cantidad } en el body.
     * @param {import('express').Response} res - responde con el jornalero actualizado (201) o un error (404/500).
     */
    agregarPrestamo: async (req, res) => {
        try {
            const { id } = req.params;
            const { fecha, cantidad } = req.body;

            const jornalero = await JornalerosModel.findByIdAndUpdate(
                id,
                {
                    $push: {
                        prestamos: {
                            fecha,
                            cantidad,
                            createdBy: req.user?.username,
                        },
                    },
                },
                { new: true, runValidators: true }
            );

            if (!jornalero) {
                return res.status(404).json({ message: "Jornalero no encontrado" });
            }

            return res.status(201).json(jornalero);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

    /**
     * Actualiza fecha/cantidad de un préstamo pendiente existente.
     * @param {import('express').Request} req - request con :id del jornalero, :prestamoId del préstamo y { fecha, cantidad } en el body.
     * @param {import('express').Response} res - responde con el jornalero actualizado (200) o un error (404/500).
     */
    actualizarPrestamo: async (req, res) => {
        try {
            const { id, prestamoId } = req.params;
            const { fecha, cantidad } = req.body;

            const jornalero = await JornalerosModel.findOne({ _id: id, "prestamos._id": prestamoId });
            if (!jornalero) {
                return res.status(404).json({ message: "Préstamo no encontrado" });
            }

            const prestamo = jornalero.prestamos.id(prestamoId);
            if (fecha !== undefined) prestamo.fecha = fecha;
            if (cantidad !== undefined) prestamo.cantidad = cantidad;
            prestamo.updatedBy = req.user?.username;

            await jornalero.save();
            return res.status(200).json(jornalero);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

    /**
     * Marca un préstamo pendiente como pagado, moviéndolo a prestamosPagados.
     * @param {import('express').Request} req - request con :id del jornalero y :prestamoId del préstamo.
     * @param {import('express').Response} res - responde con el jornalero actualizado (200) o un error (404/500).
     */
    marcarPrestamoPagado: async (req, res) => {
        try {
            const { id, prestamoId } = req.params;

            const jornalero = await JornalerosModel.findOne({ _id: id, "prestamos._id": prestamoId });
            if (!jornalero) {
                return res.status(404).json({ message: "Préstamo no encontrado" });
            }

            const prestamo = jornalero.prestamos.id(prestamoId);
            jornalero.prestamosPagados.push({
                fecha: prestamo.fecha,
                cantidad: prestamo.cantidad,
                createdBy: prestamo.createdBy,
                pagadoBy: req.user?.username,
                fechaPago: new Date(),
            });
            prestamo.deleteOne();

            await jornalero.save();
            return res.status(200).json(jornalero);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "server error" });
        }
    },

}

export default jornalerosController;
