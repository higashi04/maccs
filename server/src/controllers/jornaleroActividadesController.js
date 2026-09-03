import mongoose from "mongoose";
import JornaleroActividadesModel from "../models/JornaleroActividadesModel.js";
import OrdenCompraModel from "../models/OrdenCompraModel.js";
import ConceptoActividadModel from "../models/ConceptoActividadModel.js";

/** Campos poblados en las respuestas de actividades. */
const POPULATE_ACTIVIDAD = [
  { path: "jornalero", select: "nombre" },
  { path: "ordenCompra", select: "ordenCompra modeloSillas tipoSilla" },
  { path: "actividad", select: "nombre descripcion tarifas" },
];

/**
 * Calcula el salario de una línea: `cantidad × tarifa(actividad, tipoSilla)`.
 * Si la actividad no tiene tarifa para ese tipo de silla (o la orden no tiene
 * tipo de silla), devuelve 0.
 * @param {number} cantidad
 * @param {Object|null} concepto - documento de `conceptoActividad` con `tarifas`.
 * @param {string} [tipoSilla] - código de tipo de silla de la orden de compra.
 * @returns {number} salario de la línea, redondeado a 2 decimales.
 */
const calcularSalarioLinea = (cantidad, concepto, tipoSilla) => {
  const tarifa = Number(concepto?.tarifas?.[tipoSilla]) || 0;
  const total = (Number(cantidad) || 0) * tarifa;
  return Math.round(total * 100) / 100;
};

/** Jornalero Actividades Controller */
const jornaleroActividadesController = {
  /**
   * Captura en lote N actividades de un jornalero ligadas a una orden de compra en un solo request.
   * Body esperado: `{ jornalero, ordenCompra, fecha?, salarioJornalero?, actividades: Array<{ actividad, cantidad, descripcion? }> }`.
   * El salario de cada línea se calcula en el servidor con la tarifa del catálogo y el tipo de silla de la orden.
   * La operación es atómica: si una fila falla la validación, no se inserta ninguna.
   * @param {import('express').Request} req
   * @param {import('express').Response} res - responde con las actividades creadas (201) o un error (400/404/500).
   */
  crearActividades: async (req, res) => {
    try {
      const { jornalero, ordenCompra, fecha } = req.body;
      const filas = Array.isArray(req.body) ? req.body : req.body.actividades;

      if (!Array.isArray(filas) || filas.length === 0) {
        return res.status(400).json({ message: "Se requiere al menos una actividad" });
      }

      if (!mongoose.isValidObjectId(jornalero)) {
        return res.status(400).json({ message: "Jornalero inválido o faltante" });
      }

      const ordenIds = [
        ...new Set(filas.map((fila) => String(fila.ordenCompra ?? ordenCompra ?? ""))),
      ];
      if (ordenIds.includes("") || ordenIds.some((id) => !mongoose.isValidObjectId(id))) {
        return res.status(400).json({ message: "Orden de compra inválida o faltante" });
      }

      const actividadIds = [...new Set(filas.map((fila) => String(fila.actividad ?? "")))];
      if (actividadIds.some((id) => !mongoose.isValidObjectId(id))) {
        return res.status(400).json({ message: "Alguna actividad no referencia un concepto válido" });
      }

      const [ordenes, conceptos] = await Promise.all([
        OrdenCompraModel.find({ _id: { $in: ordenIds } }).select("modeloSillas tipoSilla").lean(),
        ConceptoActividadModel.find({ _id: { $in: actividadIds } }).select("tarifas").lean(),
      ]);

      if (ordenes.length !== ordenIds.length) {
        return res.status(404).json({ message: "Orden de compra no encontrada" });
      }
      if (conceptos.length !== actividadIds.length) {
        return res.status(404).json({ message: "Actividad del catálogo no encontrada" });
      }

      const ordenPorId = new Map(ordenes.map((orden) => [String(orden._id), orden]));
      const conceptoPorId = new Map(conceptos.map((concepto) => [String(concepto._id), concepto]));

      const docs = filas.map((fila) => {
        const orden = ordenPorId.get(String(fila.ordenCompra ?? ordenCompra));
        const concepto = conceptoPorId.get(String(fila.actividad));
        return {
          jornalero,
          ordenCompra: orden._id,
          actividad: fila.actividad,
          cantidad: fila.cantidad,
          salarioJornalero: calcularSalarioLinea(fila.cantidad, concepto, orden.tipoSilla),
          ...(orden.modeloSillas ? { modelo: orden.modeloSillas } : {}),
          ...(fecha !== undefined ? { fecha } : {}),
          ...(fila.descripcion !== undefined ? { descripcion: fila.descripcion } : {}),
          createdBy: req.user?.username,
        };
      });

      const creados = await JornaleroActividadesModel.insertMany(docs, { ordered: true });

      const poblados = await JornaleroActividadesModel.find({
        _id: { $in: creados.map((doc) => doc._id) },
      })
        .populate(POPULATE_ACTIVIDAD)
        .lean();

      return res.status(201).json(poblados);
    } catch (error) {
      if (error.name === "ValidationError" || /BulkWrite/i.test(error.name || "")) {
        return res.status(400).json({ message: "Alguna de las actividades tiene datos inválidos" });
      }
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Obtiene las actividades activas, filtrables por jornalero y/o por orden de compra.
   * @param {import('express').Request} req - request con ?jornalero=<id> y/o ?ordenCompra=<id> opcionales en el query.
   * @param {import('express').Response} res - responde con el arreglo de actividades (200) o un error (500).
   */
  ReadActividades: async (req, res) => {
    try {
      const { jornalero, ordenCompra } = req.query;
      const filtro = {
        activo: true,
        ...(jornalero ? { jornalero } : {}),
        ...(ordenCompra ? { ordenCompra } : {}),
      };

      const actividades = await JornaleroActividadesModel.find(filtro)
        .sort({ fecha: -1, createdAt: -1 })
        .populate(POPULATE_ACTIVIDAD)
        .lean();

      return res.status(200).json(actividades);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Actualiza una actividad individual. Al cambiar `actividad`, `cantidad` u
   * `ordenCompra` se recalcula el salario de la línea con las tarifas del catálogo.
   * @param {import('express').Request} req - request con :id y { actividad, cantidad, fecha, descripcion, jornalero, ordenCompra } en el body.
   * @param {import('express').Response} res - responde con la actividad actualizada (200) o un error (404/500).
   */
  actualizarActividad: async (req, res) => {
    try {
      const { id } = req.params;
      const { actividad, cantidad, fecha, descripcion, jornalero, ordenCompra } = req.body;

      const registro = await JornaleroActividadesModel.findById(id);
      if (!registro) {
        return res.status(404).json({ message: "Registro no encontrado" });
      }

      if (actividad !== undefined) registro.actividad = actividad;
      if (cantidad !== undefined) registro.cantidad = cantidad;
      if (fecha !== undefined) registro.fecha = fecha;
      if (descripcion !== undefined) registro.descripcion = descripcion;
      if (jornalero !== undefined) registro.jornalero = jornalero;
      if (ordenCompra !== undefined) registro.ordenCompra = ordenCompra;
      registro.updatedBy = req.user?.username;

      const [orden, concepto] = await Promise.all([
        OrdenCompraModel.findById(registro.ordenCompra).select("modeloSillas tipoSilla").lean(),
        ConceptoActividadModel.findById(registro.actividad).select("tarifas").lean(),
      ]);

      if (!orden) return res.status(404).json({ message: "Orden de compra no encontrada" });
      if (!concepto) return res.status(404).json({ message: "Actividad del catálogo no encontrada" });

      registro.salarioJornalero = calcularSalarioLinea(registro.cantidad, concepto, orden.tipoSilla);
      if (orden.modeloSillas) registro.modelo = orden.modeloSillas;

      await registro.save();
      await registro.populate(POPULATE_ACTIVIDAD);

      return res.status(200).json(registro);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Elimina (desactiva) una actividad, conservando su historial.
   * @param {import('express').Request} req - request con :id del registro.
   * @param {import('express').Response} res - responde con el registro desactivado (200) o un error (404/500).
   */
  eliminarActividad: async (req, res) => {
    try {
      const { id } = req.params;

      const actividad = await JornaleroActividadesModel.findByIdAndUpdate(
        id,
        { activo: false, updatedBy: req.user?.username },
        { new: true }
      );

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
