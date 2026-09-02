import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { createOrdenCompra } from "../../api/ordenesCompraApi";

const initialFormData = {
  modeloSillas: "",
  cantidadSillas: "",
  MontoEsperado: "",
  active: true,
};

/**
 * Formulario para registrar una nueva orden de compra.
 * El folio se genera automáticamente en el servidor.
 * @param {{ onCreated: (orden: Object) => void }} props - callback invocado tras crear la orden.
 */
const OrdenCompraForm = ({ onCreated }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const nuevaOrden = await createOrdenCompra({
        modeloSillas: formData.modeloSillas.trim(),
        cantidadSillas: Number(formData.cantidadSillas) || 0,
        MontoEsperado: Number(formData.MontoEsperado) || 0,
        active: formData.active,
      });
      setMessage({
        type: "success",
        text: `Orden de compra "${nuevaOrden.ordenCompra}" creada correctamente`,
      });
      setFormData(initialFormData);
      onCreated?.(nuevaOrden);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8 lg:max-w-5xl xl:max-w-6xl">
      <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
        <FontAwesomeIcon icon={faFileCirclePlus} className="text-sky-600" />
        Registrar orden de compra
      </h2>
      <p className="mb-6 text-slate-500">
        Registra una nueva orden de compra. El folio se asignará automáticamente.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-2 font-semibold text-slate-700 sm:col-span-2">
            Modelo de sillas
            <input
              name="modeloSillas"
              type="text"
              value={formData.modeloSillas}
              onChange={handleChange}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej. Silla colonial"
            />
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Cantidad de sillas
            <input
              name="cantidadSillas"
              type="number"
              min="0"
              value={formData.cantidadSillas}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="0"
            />
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Monto esperado
            <input
              name="MontoEsperado"
              type="number"
              min="0"
              step="0.01"
              value={formData.MontoEsperado}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="0.00"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 font-semibold text-slate-700">
          <input
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          Activa
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none lg:w-auto lg:self-start lg:px-10"
        >
          {submitting ? "Creando..." : "Crear orden de compra"}
        </button>
      </form>

      {message.text ? (
        <p
          className={`mt-4 rounded-lg px-3 py-2 font-semibold ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
};

export default OrdenCompraForm;
