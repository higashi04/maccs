import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import { createConceptoViatico } from "../../api/conceptosViaticoApi";

const initialFormData = {
  TipoViatico: "",
  nombre: "",
  activo: true,
};

/**
 * Formulario para registrar un nuevo concepto en el catálogo de viáticos.
 * @param {{ onCreated: (concepto: Object) => void }} props - callback invocado tras crear el concepto.
 */
const ConceptoViaticoForm = ({ onCreated }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  /**
   * Actualiza el estado del formulario ante cambios en los campos.
   * @param {import('react').ChangeEvent<HTMLInputElement>} event
   */
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /**
   * Envía el formulario para crear el concepto.
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const nuevoConcepto = await createConceptoViatico({
        TipoViatico: formData.TipoViatico.trim(),
        nombre: formData.nombre.trim(),
        activo: formData.activo,
      });
      setMessage({
        type: "success",
        text: `Concepto "${nuevoConcepto.TipoViatico}" creado correctamente`,
      });
      setFormData(initialFormData);
      onCreated?.(nuevoConcepto);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8 lg:max-w-5xl xl:max-w-6xl">
      <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
        <FontAwesomeIcon icon={faTag} className="text-sky-600" />
        Registrar concepto
      </h2>
      <p className="mb-6 text-slate-500">
        Da de alta un concepto que estará disponible al capturar viáticos.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Tipo de viático
            <input
              name="TipoViatico"
              type="text"
              value={formData.TipoViatico}
              onChange={handleChange}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej. Combustible"
            />
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            <span className="flex items-baseline gap-1">
              Nombre / descripción
              <span className="text-xs font-normal text-slate-400">Opcional</span>
            </span>
            <input
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej. Gasolina para traslados a proveedor"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 font-semibold text-slate-700">
          <input
            name="activo"
            type="checkbox"
            checked={formData.activo}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          Activo
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none lg:w-auto lg:self-start lg:px-10"
        >
          {submitting ? "Creando..." : "Crear concepto"}
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

export default ConceptoViaticoForm;
