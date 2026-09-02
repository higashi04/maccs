import { useState } from "react";
import { apiFetch } from "../../utils/api";

function Modules() {
  const [formData, setFormData] = useState({
    nombreModulo: "",
    ruta: "",
    componente: "",
    icono: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await apiFetch("/api/modules/create", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo crear el módulo");
      }

      setMessage({
        type: "success",
        text: `Módulo "${data.nombreModulo}" creado correctamente`,
      });
      setFormData({
        nombreModulo: "",
        ruta: "",
        componente: "",
        icono: "",
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8 lg:max-w-5xl xl:max-w-6xl">
      <h2 className="mb-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Crear módulo</h2>
      <p className="mb-6 text-slate-500">
        Registra un nuevo módulo para que quede disponible en la aplicación.
      </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-2 font-semibold text-slate-700">
              Nombre del módulo
              <input
                name="nombreModulo"
                type="text"
                value={formData.nombreModulo}
                onChange={handleChange}
                required
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ej. Dashboard"
              />
            </label>

            <label className="flex flex-col gap-2 font-semibold text-slate-700">
              Ruta
              <input
                name="ruta"
                type="text"
                value={formData.ruta}
                onChange={handleChange}
                required
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="/dashboard"
              />
            </label>

            <label className="flex flex-col gap-2 font-semibold text-slate-700">
              Componente
              <input
                name="componente"
                type="text"
                value={formData.componente}
                onChange={handleChange}
                required
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="DashboardPage"
              />
            </label>

            <label className="flex flex-col gap-2 font-semibold text-slate-700">
              Ícono
              <input
                name="icono"
                type="text"
                value={formData.icono}
                onChange={handleChange}
                required
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="faChartBar"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none lg:w-auto lg:self-start lg:px-10"
          >
            {loading ? "Creando..." : "Crear módulo"}
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
}

export default Modules;
