import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { createJornalero } from "../../api/jornalerosApi";

const initialFormData = {
  nombre: "",
  activo: true,
};

/**
 * Formulario para registrar un nuevo jornalero.
 * @param {{ onCreated: (jornalero: Object) => void }} props - callback invocado tras crear el jornalero.
 */
const JornaleroForm = ({ onCreated }) => {
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
      const nuevoJornalero = await createJornalero(formData);
      setMessage({
        type: "success",
        text: `Jornalero "${nuevoJornalero.nombre}" creado correctamente`,
      });
      setFormData(initialFormData);
      onCreated?.(nuevoJornalero);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-8 shadow-xl">
      <h2 className="mb-2 flex items-center gap-2 text-3xl font-semibold text-slate-900">
        <FontAwesomeIcon icon={faUserPlus} className="text-sky-600" />
        Registrar jornalero
      </h2>
      <p className="mb-6 text-slate-500">
        Registra un nuevo jornalero para llevar el control de sus actividades y préstamos.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 font-semibold text-slate-700">
          Nombre
          <input
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ej. Juan Pérez"
          />
        </label>

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
          className="mt-2 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Creando..." : "Crear jornalero"}
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

export default JornaleroForm;
