import mongoose from "mongoose";
import ViaticosModel from "../models/ViaticosModel.js";
import OrdenCompraModel from "../models/OrdenCompraModel.js";

/**
 * Normaliza una fila de viático recibida del cliente a un documento listo para insertar.
 * @param {Object} fila - datos capturados de un viático.
 * @param {string} ordenCompraId - id de la orden de compra a la que se liga el viático.
 * @param {string} [username] - usuario autenticado que realiza la captura.
 * @returns {Object} documento normalizado para `ViaticosModel`.
 */
const normalizarViatico = (fila, ordenCompraId, username) => ({
  ordenCompra: fila.ordenCompra ?? ordenCompraId,
  concepto: fila.concepto,
  monto: fila.monto,
  ...(fila.fecha !== undefined ? { fecha: fila.fecha } : {}),
  ...(fila.descripcion !== undefined ? { descripcion: fila.descripcion } : {}),
  createdBy: username,
});

/** Viáticos Controller */
const viaticosController = {
  /**
   * Captura en lote N viáticos ligados a una orden de compra en un solo request.
   * Body esperado: `{ ordenCompra: string, viaticos: Array<{ concepto, monto, fecha?, descripcion?, ordenCompra? }> }`.
   * Cada fila puede traer su propio `ordenCompra`; si no, se usa el del nivel superior.
   * La operación es atómica: si una fila falla la validación, no se inserta ninguna.
   * @param {import('express').Request} req
   * @param {import('express').Response} res - responde con los viáticos creados (201) o un error (400/404/500).
   */
  crearViaticos: async (req, res) => {
    try {
      const { ordenCompra } = req.body;
      const filas = Array.isArray(req.body) ? req.body : req.body.viaticos;

      if (!Array.isArray(filas) || filas.length === 0) {
        return res.status(400).json({ message: "Se requiere al menos un viático" });
      }

      const ordenIds = new Set(
        filas.map((fila) => String(fila.ordenCompra ?? ordenCompra ?? ""))
      );

      if (ordenIds.has("") || [...ordenIds].some((id) => !mongoose.isValidObjectId(id))) {
        return res.status(400).json({ message: "Orden de compra inválida o faltante" });
      }

      const encontradas = await OrdenCompraModel.countDocuments({ _id: { $in: [...ordenIds] } });
      if (encontradas !== ordenIds.size) {
        return res.status(404).json({ message: "Orden de compra no encontrada" });
      }

      const docs = filas.map((fila) => normalizarViatico(fila, ordenCompra, req.user?.username));
      const creados = await ViaticosModel.insertMany(docs, { ordered: true });

      return res.status(201).json(creados);
    } catch (error) {
      if (error.name === "ValidationError" || /BulkWrite/i.test(error.name || "")) {
        return res.status(400).json({ message: "Alguno de los viáticos tiene datos inválidos" });
      }
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Obtiene los viáticos activos. Acepta `?ordenCompra=<id>` para filtrar por orden.
   * @param {import('express').Request} req
   * @param {import('express').Response} res - responde con el arreglo de viáticos (200) o un error (500).
   */
  ReadActiveViaticos: async (req, res) => {
    try {
      const { ordenCompra } = req.query;
      const filtro = { activo: true };
      if (ordenCompra) filtro.ordenCompra = ordenCompra;

      const viaticos = await ViaticosModel.find(filtro)
        .populate("concepto", "TipoViatico nombre")
        .sort({ fecha: -1 })
        .lean();

      return res.status(200).json(viaticos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Obtiene todos los viáticos de una orden de compra específica.
   * @param {import('express').Request} req - request con :ordenId de la orden de compra.
   * @param {import('express').Response} res - responde con el arreglo de viáticos (200) o un error (500).
   */
  ReadViaticosByOrden: async (req, res) => {
    try {
      const { ordenId } = req.params;

      const viaticos = await ViaticosModel.find({ ordenCompra: ordenId, activo: true })
        .populate("concepto", "TipoViatico nombre")
        .sort({ fecha: -1 })
        .lean();

      return res.status(200).json(viaticos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Obtiene un viático por su id.
   * @param {import('express').Request} req - request con :id del viático.
   * @param {import('express').Response} res - responde con el viático (200) o un error (404/500).
   */
  ReadViaticoById: async (req, res) => {
    try {
      const { id } = req.params;
      const viatico = await ViaticosModel.findById(id)
        .populate("concepto", "TipoViatico nombre")
        .lean();

      if (!viatico) {
        return res.status(404).json({ message: "Viático no encontrado" });
      }

      return res.status(200).json(viatico);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Actualiza los datos de un viático individual.
   * @param {import('express').Request} req - request con :id del viático y { concepto, monto, fecha, descripcion, ordenCompra } en el body.
   * @param {import('express').Response} res - responde con el viático actualizado (200) o un error (404/500).
   */
  actualizarViatico: async (req, res) => {
    try {
      const { id } = req.params;
      const { concepto, monto, fecha, descripcion, ordenCompra } = req.body;

      const viatico = await ViaticosModel.findByIdAndUpdate(
        id,
        {
          ...(concepto !== undefined ? { concepto } : {}),
          ...(monto !== undefined ? { monto } : {}),
          ...(fecha !== undefined ? { fecha } : {}),
          ...(descripcion !== undefined ? { descripcion } : {}),
          ...(ordenCompra !== undefined ? { ordenCompra } : {}),
          updatedBy: req.user?.username,
        },
        { new: true, runValidators: true }
      );

      if (!viatico) {
        return res.status(404).json({ message: "Viático no encontrado" });
      }

      return res.status(200).json(viatico);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Elimina (desactiva) un viático, conservando su historial.
   * @param {import('express').Request} req - request con :id del viático.
   * @param {import('express').Response} res - responde con el viático desactivado (200) o un error (404/500).
   */
  eliminarViatico: async (req, res) => {
    try {
      const { id } = req.params;

      const viatico = await ViaticosModel.findByIdAndUpdate(
        id,
        { activo: false, updatedBy: req.user?.username },
        { new: true }
      );

      if (!viatico) {
        return res.status(404).json({ message: "Viático no encontrado" });
      }

      return res.status(200).json(viatico);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },
};

export default viaticosController;
