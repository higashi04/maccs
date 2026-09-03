import ConceptoActividadModel from "../models/ConceptoActividadModel.js";
import { TIPO_SILLA_CODES } from "../constants/tiposSilla.js";

/**
 * Deja solo las llaves de tipo de silla válidas con un número >= 0; descarta el resto.
 * @param {Object} [tarifas] - objeto de tarifas recibido del cliente.
 * @returns {Object} tarifas saneadas (puede quedar vacío).
 */
const normalizarTarifas = (tarifas) => {
  if (!tarifas || typeof tarifas !== "object") return {};
  return TIPO_SILLA_CODES.reduce((acumulado, code) => {
    const valor = Number(tarifas[code]);
    if (Number.isFinite(valor) && valor >= 0 && tarifas[code] !== "" && tarifas[code] !== null) {
      acumulado[code] = valor;
    }
    return acumulado;
  }, {});
};

/** Catálogo de Actividades de Jornaleros - Controller */
const conceptosActividadController = {
  /**
   * Crea una nueva actividad en el catálogo.
   * @param {import('express').Request} req - request con { nombre, descripcion, tarifas, activo } en el body.
   * @param {import('express').Response} res - responde con la actividad creada (201) o un error (500).
   */
  crearConcepto: async (req, res) => {
    try {
      const { nombre, descripcion, tarifas, activo } = req.body;

      const concepto = await ConceptoActividadModel.create({
        nombre,
        ...(descripcion !== undefined ? { descripcion } : {}),
        ...(tarifas !== undefined ? { tarifas: normalizarTarifas(tarifas) } : {}),
        ...(activo !== undefined ? { activo } : {}),
        createdBy: req.user?.username,
      });

      return res.status(201).json(concepto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Obtiene las actividades activas del catálogo, ordenadas por nombre.
   * @param {import('express').Request} req
   * @param {import('express').Response} res - responde con el arreglo de actividades activas (200) o un error (500).
   */
  ReadActiveConceptos: async (req, res) => {
    try {
      const conceptos = await ConceptoActividadModel.find({ activo: true })
        .sort({ nombre: 1 })
        .lean();
      return res.status(200).json(conceptos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Obtiene todas las actividades, activas e inactivas, para su gestión.
   * @param {import('express').Request} req
   * @param {import('express').Response} res - responde con el arreglo completo de actividades (200) o un error (500).
   */
  ReadAllConceptos: async (req, res) => {
    try {
      const conceptos = await ConceptoActividadModel.find({}).sort({ nombre: 1 }).lean();
      return res.status(200).json(conceptos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Actualiza el nombre, descripción, tarifas y/o estado activo de una actividad del catálogo.
   * @param {import('express').Request} req - request con :id de la actividad y { nombre, descripcion, tarifas, activo } en el body.
   * @param {import('express').Response} res - responde con la actividad actualizada (200) o un error (404/500).
   */
  actualizarConcepto: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, tarifas, activo } = req.body;

      const concepto = await ConceptoActividadModel.findByIdAndUpdate(
        id,
        {
          ...(nombre !== undefined ? { nombre } : {}),
          ...(descripcion !== undefined ? { descripcion } : {}),
          ...(tarifas !== undefined ? { tarifas: normalizarTarifas(tarifas) } : {}),
          ...(activo !== undefined ? { activo } : {}),
          updatedBy: req.user?.username,
        },
        { new: true, runValidators: true }
      );

      if (!concepto) {
        return res.status(404).json({ message: "Actividad no encontrada" });
      }

      return res.status(200).json(concepto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Elimina (desactiva) una actividad del catálogo.
   * @param {import('express').Request} req - request con :id de la actividad.
   * @param {import('express').Response} res - responde con la actividad desactivada (200) o un error (404/500).
   */
  eliminarConcepto: async (req, res) => {
    try {
      const { id } = req.params;

      const concepto = await ConceptoActividadModel.findByIdAndUpdate(
        id,
        { activo: false, updatedBy: req.user?.username },
        { new: true }
      );

      if (!concepto) {
        return res.status(404).json({ message: "Actividad no encontrada" });
      }

      return res.status(200).json(concepto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },
};

export default conceptosActividadController;
