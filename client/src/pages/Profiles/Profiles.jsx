import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModules } from "../../context/ModulesContext";
import { resolveIcon } from "../../utils/iconRegistry";
import { apiFetch } from "../../utils/api";

function Profiles() {
  const { modules, loading: loadingModules } = useModules();
  const [formData, setFormData] = useState({
    nombrePerfil: "",
    modulos: [],
    createdBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleModule = (moduleId) => {
    setFormData((prev) => ({
      ...prev,
      modulos: prev.modulos.includes(moduleId)
        ? prev.modulos.filter((id) => id !== moduleId)
        : [...prev.modulos, moduleId],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (formData.modulos.length === 0) {
      setLoading(false);
      setMessage({ type: "error", text: "Selecciona al menos un módulo" });
      return;
    }

    try {
      const response = await apiFetch("/api/perfiles/create", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo crear el perfil");
      }

      setMessage({
        type: "success",
        text: `Perfil "${data.nombrePerfil}" creado correctamente`,
      });
      setFormData({ nombrePerfil: "", modulos: [], createdBy: "" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-2 text-3xl font-semibold text-slate-900">Crear perfil</h2>
        <p className="mb-6 text-slate-500">
          Define un perfil y los módulos a los que tendrán acceso los usuarios asignados a él.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Nombre del perfil
            <input
              name="nombrePerfil"
              type="text"
              value={formData.nombrePerfil}
              onChange={handleChange}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej. Contador"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="font-semibold text-slate-700">Módulos permitidos</span>

            {loadingModules ? (
              <p className="text-sm text-slate-500">Cargando módulos...</p>
            ) : modules.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay módulos registrados todavía. Crea uno primero.
              </p>
            ) : (
              <div className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-2">
                {modules.map((module) => (
                  <label
                    key={module._id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.modulos.includes(module._id)}
                      onChange={() => toggleModule(module._id)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <FontAwesomeIcon icon={resolveIcon(module.icono)} className="w-4 text-slate-400" />
                    {module.nombreModulo}
                  </label>
                ))}
              </div>
            )}
          </div>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Creado por
            <input
              name="createdBy"
              type="text"
              value={formData.createdBy}
              onChange={handleChange}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="admin"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Creando..." : "Crear perfil"}
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
    </div>
  );
}

export default Profiles;
