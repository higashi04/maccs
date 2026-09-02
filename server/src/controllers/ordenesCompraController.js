import OrdenCompraModel from "../models/OrdenCompraModel.js";

/**
 * Genera el siguiente folio consecutivo de orden de compra para el año en curso.
 * El formato es `OC-<año>-<secuencia de 4 dígitos>` (ej. `OC-2026-0007`).
 * @returns {Promise<string>} el folio disponible siguiente.
 */
const generarFolio = async () => {
  const year = new Date().getFullYear();
  const prefijo = `OC-${year}-`;

  const ultima = await OrdenCompraModel.findOne({ ordenCompra: new RegExp(`^${prefijo}`) })
    .sort({ ordenCompra: -1 })
    .lean();

  const secuencia = ultima
    ? Number.parseInt(ultima.ordenCompra.slice(prefijo.length), 10) + 1
    : 1;

  return `${prefijo}${String(secuencia).padStart(4, "0")}`;
};

/** Órdenes de Compra Controller */
const ordenesCompraController = {
  /**
   * Crea una nueva orden de compra con folio generado automáticamente.
   * @param {import('express').Request} req - request con { modeloSillas, cantidadSillas, MontoEsperado, active } en el body.
   * @param {import('express').Response} res - responde con la orden creada (201) o un error (500).
   */
  crearOrdenCompra: async (req, res) => {
    try {
      const { modeloSillas, cantidadSillas, MontoEsperado, active } = req.body;

      // Reintenta ante una colisión de folio por creación concurrente.
      for (let intento = 0; intento < 5; intento += 1) {
        try {
          const orden = await OrdenCompraModel.create({
            ordenCompra: await generarFolio(),
            modeloSillas,
            ...(cantidadSillas !== undefined ? { cantidadSillas } : {}),
            ...(MontoEsperado !== undefined ? { MontoEsperado } : {}),
            ...(active !== undefined ? { active } : {}),
            createdBy: req.user?.username,
          });

          return res.status(201).json(orden);
        } catch (error) {
          if (error.code === 11000 && intento < 4) continue;
          throw error;
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Obtiene las órdenes de compra activas.
   * @param {import('express').Request} req
   * @param {import('express').Response} res - responde con el arreglo de órdenes activas (200) o un error (500).
   */
  ReadActiveOrdenesCompra: async (req, res) => {
    try {
      const ordenes = await OrdenCompraModel.find({ active: true }).lean();
      return res.status(200).json(ordenes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Obtiene todas las órdenes de compra, activas e inactivas, para su gestión.
   * @param {import('express').Request} req
   * @param {import('express').Response} res - responde con el arreglo completo de órdenes (200) o un error (500).
   */
  ReadAllOrdenesCompra: async (req, res) => {
    try {
      const ordenes = await OrdenCompraModel.find({}).lean();
      return res.status(200).json(ordenes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Obtiene una orden de compra por su id.
   * @param {import('express').Request} req - request con :id de la orden.
   * @param {import('express').Response} res - responde con la orden (200) o un error (404/500).
   */
  ReadOrdenCompraById: async (req, res) => {
    try {
      const { id } = req.params;
      const orden = await OrdenCompraModel.findById(id).lean();

      if (!orden) {
        return res.status(404).json({ message: "Orden de compra no encontrada" });
      }

      return res.status(200).json(orden);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Actualiza el modelo, cantidad, monto esperado y/o estado activo de una orden de compra.
   * El folio es generado por el sistema y no puede modificarse.
   * @param {import('express').Request} req - request con :id de la orden y { modeloSillas, cantidadSillas, MontoEsperado, active } en el body.
   * @param {import('express').Response} res - responde con la orden actualizada (200) o un error (404/500).
   */
  actualizarOrdenCompra: async (req, res) => {
    try {
      const { id } = req.params;
      const { modeloSillas, cantidadSillas, MontoEsperado, active } = req.body;

      const orden = await OrdenCompraModel.findByIdAndUpdate(
        id,
        {
          ...(modeloSillas !== undefined ? { modeloSillas } : {}),
          ...(cantidadSillas !== undefined ? { cantidadSillas } : {}),
          ...(MontoEsperado !== undefined ? { MontoEsperado } : {}),
          ...(active !== undefined ? { active } : {}),
          updatedBy: req.user?.username,
        },
        { new: true, runValidators: true }
      );

      if (!orden) {
        return res.status(404).json({ message: "Orden de compra no encontrada" });
      }

      return res.status(200).json(orden);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Elimina (desactiva) una orden de compra, conservando su historial.
   * @param {import('express').Request} req - request con :id de la orden.
   * @param {import('express').Response} res - responde con la orden desactivada (200) o un error (404/500).
   */
  eliminarOrdenCompra: async (req, res) => {
    try {
      const { id } = req.params;

      const orden = await OrdenCompraModel.findByIdAndUpdate(
        id,
        { active: false, updatedBy: req.user?.username },
        { new: true }
      );

      if (!orden) {
        return res.status(404).json({ message: "Orden de compra no encontrada" });
      }

      return res.status(200).json(orden);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },
};

export default ordenesCompraController;
