import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHammer } from "@fortawesome/free-solid-svg-icons";
import { createConceptoActividad } from "../../api/conceptosActividadApi";
import { TIPOS_SILLA } from "../../constants/tiposSilla";

const tarifasVacias = () =>
  TIPOS_SILLA.reduce((acumulado, tipo) => {
    acumulado[tipo.code] = "";
    return acumulado;
  }, {});

const initialFormData = () => ({
  nombre: "",
  descripcion: "",
  activo: true,
  tarifas: tarifasVacias(),
});

/**
 * Convierte el objeto de tarifas del formulario (strings) a números, descartando vacíos.
 * @param {Record<string, string>} tarifas
 * @returns {Record<string, number>}
 */
const limpiarTarifas = (tarifas) =>
  Object.entries(tarifas).reduce((acumulado, [code, valor]) => {
    if (valor !== "" && Number.isFinite(Number(valor))) acumulado[code] = Number(valor);
    return acumulado;
  }, {});

/**
 * Formulario para registrar una nueva actividad en el catálogo de jornaleros,
 * con su tarifa por pieza según el tipo de silla.
 * @param {{ onCreated: (concepto: Object) => void }} props - callback invocado tras crear la actividad.
 */
const ConceptoActividadForm = ({ onCreated }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  /**
   * Actualiza el estado del formulario ante cambios en los campos base.
   * @param {import('react').ChangeEvent<HTMLInputElement>} event
   */
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /**
   * Actualiza la tarifa de un tipo de silla.
   * @param {string} code - código del tipo de silla.
   * @param {string} valor
   */
  const setTarifa = (code, valor) => {
    setFormData((prev) => ({ ...prev, tarifas: { ...prev.tarifas, [code]: valor } }));
  };

  /**
   * Envía el formulario para crear la actividad.
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const nuevoConcepto = await createConceptoActividad({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        activo: formData.activo,
        tarifas: limpiarTarifas(formData.tarifas),
      });
      setMessage({
        type: "success",
        text: `Actividad "${nuevoConcepto.nombre}" creada correctamente`,
      });
      setFormData(initialFormData());
      onCreated?.(nuevoConcepto);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8 lg:max-w-5xl xl:max-w-6xl">
      <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
        <FontAwesomeIcon icon={faHammer} className="text-sky-600" />
        Registrar actividad
      </h2>
      <p className="mb-6 text-slate-500">
        Da de alta una actividad que estará disponible al capturar el avance de los jornaleros.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Nombre de la actividad
            <input
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Ej. Primera tinta"
            />
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            <span className="flex items-baseline gap-1">
              Descripción
              <span className="text-xs font-normal text-slate-400">Opcional</span>
            </span>
            <input
              name="descripcion"
              type="text"
              value={formData.descripcion}
              onChange={handleChange}
              className={inputClass}
              placeholder="Ej. Aplicación de la primera capa de tinta"
            />
          </label>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Tarifa por pieza según tipo de silla
          </h3>
          <p className="mb-3 text-xs text-slate-400">
            Deja en blanco los tipos de silla que no aplican a esta actividad.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TIPOS_SILLA.map((tipo) => (
              <label
                key={tipo.code}
                className="flex flex-col gap-1 text-xs font-semibold text-slate-600"
              >
                {tipo.label} ({tipo.code})
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tarifas[tipo.code]}
                  onChange={(event) => setTarifa(tipo.code, event.target.value)}
                  className={inputClass}
                  placeholder="$"
                />
              </label>
            ))}
          </div>
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
          {submitting ? "Creando..." : "Crear actividad"}
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

export default ConceptoActividadForm;
