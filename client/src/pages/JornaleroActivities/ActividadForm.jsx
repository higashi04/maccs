import { useState } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import { createActividad } from "../../api/jornaleroActividadesApi";
import { ACTIVIDADES_CAMPOS } from "../../constants/actividadesCampos";

const todayISO = () => new Date().toISOString().slice(0, 10);

const camposIniciales = ACTIVIDADES_CAMPOS.reduce((acumulado, campo) => {
  acumulado[campo.key] = 0;
  return acumulado;
}, {});

const initialFormData = {
  jornalero: null,
  ordenCompra: null,
  fecha: todayISO(),
  modelo: "",
  ...camposIniciales,
};

const selectClassNames = {
  control: () =>
    "!rounded-lg !border-slate-300 !text-sm !shadow-none focus-within:!border-sky-500 focus-within:!ring-2 focus-within:!ring-sky-500",
};

/**
 * Formulario para registrar el avance diario de actividades de un jornalero activo,
 * ligado a una orden de compra.
 * @param {{
 *   jornaleroOptions: Array<{ value: string, label: string }>,
 *   ordenCompraOptions: Array<{ value: string, label: string }>,
 *   loadingCatalogos: boolean,
 *   onCreated: (actividad: Object) => void,
 * }} props
 */
const ActividadForm = ({ jornaleroOptions, ordenCompraOptions, loadingCatalogos, onCreated }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleJornaleroChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, jornalero: selectedOption ? selectedOption.value : null }));
  };

  const handleOrdenChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, ordenCompra: selectedOption ? selectedOption.value : null }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCampoChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value === "" ? "" : Number(value) }));
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...initialFormData,
      jornalero: prev.jornalero,
      ordenCompra: prev.ordenCompra,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const actividad = await createActividad({
        ...formData,
        ...ACTIVIDADES_CAMPOS.reduce((acumulado, campo) => {
          acumulado[campo.key] = Number(formData[campo.key]) || 0;
          return acumulado;
        }, {}),
      });
      setMessage({ type: "success", text: "Actividad registrada correctamente" });
      resetForm();
      onCreated?.(actividad);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8 lg:max-w-5xl xl:max-w-6xl">
      <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
        <FontAwesomeIcon icon={faClipboardList} className="text-sky-600" />
        Registrar actividades
      </h2>
      <p className="mb-6 text-slate-500">
        Selecciona un jornalero activo y la orden de compra, luego captura las actividades del día.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Jornalero
            <Select
              inputId="jornalero"
              name="jornalero"
              options={jornaleroOptions}
              value={jornaleroOptions.find((option) => option.value === formData.jornalero) || null}
              onChange={handleJornaleroChange}
              isLoading={loadingCatalogos}
              isClearable
              placeholder="Selecciona un jornalero"
              noOptionsMessage={() => "No hay jornaleros activos"}
              classNames={selectClassNames}
            />
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Orden de compra
            <Select
              inputId="ordenCompra"
              name="ordenCompra"
              options={ordenCompraOptions}
              value={ordenCompraOptions.find((option) => option.value === formData.ordenCompra) || null}
              onChange={handleOrdenChange}
              isLoading={loadingCatalogos}
              isClearable
              placeholder="Selecciona una orden"
              noOptionsMessage={() => "No hay órdenes de compra activas"}
              classNames={selectClassNames}
            />
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Fecha
            <input
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleChange}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Modelo
            <input
              name="modelo"
              type="text"
              value={formData.modelo}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej. Silla colonial"
            />
          </label>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Actividades
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {ACTIVIDADES_CAMPOS.map((campo) => (
              <label key={campo.key} className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                {campo.label}
                <input
                  name={campo.key}
                  type="number"
                  min="0"
                  value={formData[campo.key]}
                  onChange={handleCampoChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !formData.jornalero || !formData.ordenCompra}
          className="mt-2 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none lg:w-auto lg:self-start lg:px-10"
        >
          {submitting ? "Registrando..." : "Registrar actividad"}
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

export default ActividadForm;
