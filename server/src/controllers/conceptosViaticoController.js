import ConceptoViaticoModel from "../models/ConceptoViaticoModel.js";

/** Catálogo de Conceptos de Viático - Controller */
const conceptosViaticoController = {
  /**
   * Crea un nuevo concepto en el catálogo.
   * @param {import('express').Request} req - request con { TipoViatico, nombre, activo } en el body.
   * @param {import('express').Response} res - responde con el concepto creado (201) o un error (500).
   */
  crearConcepto: async (req, res) => {
    try {
      const { TipoViatico, nombre, activo } = req.body;

      const concepto = await ConceptoViaticoModel.create({
        TipoViatico,
        ...(nombre !== undefined ? { nombre } : {}),
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
   * Obtiene los conceptos activos del catálogo, ordenados por tipo.
   * @param {import('express').Request} req
   * @param {import('express').Response} res - responde con el arreglo de conceptos activos (200) o un error (500).
   */
  ReadActiveConceptos: async (req, res) => {
    try {
      const conceptos = await ConceptoViaticoModel.find({ activo: true })
        .sort({ TipoViatico: 1 })
        .lean();
      return res.status(200).json(conceptos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Obtiene todos los conceptos, activos e inactivos, para su gestión.
   * @param {import('express').Request} req
   * @param {import('express').Response} res - responde con el arreglo completo de conceptos (200) o un error (500).
   */
  ReadAllConceptos: async (req, res) => {
    try {
      const conceptos = await ConceptoViaticoModel.find({}).sort({ TipoViatico: 1 }).lean();
      return res.status(200).json(conceptos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Actualiza el tipo, nombre y/o estado activo de un concepto.
   * @param {import('express').Request} req - request con :id del concepto y { TipoViatico, nombre, activo } en el body.
   * @param {import('express').Response} res - responde con el concepto actualizado (200) o un error (404/500).
   */
  actualizarConcepto: async (req, res) => {
    try {
      const { id } = req.params;
      const { TipoViatico, nombre, activo } = req.body;

      const concepto = await ConceptoViaticoModel.findByIdAndUpdate(
        id,
        {
          ...(TipoViatico !== undefined ? { TipoViatico } : {}),
          ...(nombre !== undefined ? { nombre } : {}),
          ...(activo !== undefined ? { activo } : {}),
          updatedBy: req.user?.username,
        },
        { new: true, runValidators: true }
      );

      if (!concepto) {
        return res.status(404).json({ message: "Concepto no encontrado" });
      }

      return res.status(200).json(concepto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Elimina (desactiva) un concepto del catálogo.
   * @param {import('express').Request} req - request con :id del concepto.
   * @param {import('express').Response} res - responde con el concepto desactivado (200) o un error (404/500).
   */
  eliminarConcepto: async (req, res) => {
    try {
      const { id } = req.params;

      const concepto = await ConceptoViaticoModel.findByIdAndUpdate(
        id,
        { activo: false, updatedBy: req.user?.username },
        { new: true }
      );

      if (!concepto) {
        return res.status(404).json({ message: "Concepto no encontrado" });
      }

      return res.status(200).json(concepto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },
};

export default conceptosViaticoController;
