import { useState } from "react";
import { createPerfil } from "../../api/perfilesApi";
import ModulesPicker from "./ModulesPicker";

/**
 * Formulario para crear un nuevo perfil y asignarle los módulos permitidos.
 * @param {{ onCreated?: (perfil: Object) => void }} props - callback tras crear el perfil.
 * @returns {JSX.Element}
 */
function ProfileForm({ onCreated }) {
  const [formData, setFormData] = useState({ nombrePerfil: "", modulos: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  /**
   * Actualiza el nombre del perfil en el estado del formulario.
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Agrega o quita un módulo de la selección.
   * @param {string} moduleId - id del módulo a alternar.
   */
  const toggleModule = (moduleId) => {
    setFormData((prev) => ({
      ...prev,
      modulos: prev.modulos.includes(moduleId)
        ? prev.modulos.filter((id) => id !== moduleId)
        : [...prev.modulos, moduleId],
    }));
  };

  /**
   * Envía el formulario para crear el perfil.
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (formData.modulos.length === 0) {
      setMessage({ type: "error", text: "Selecciona al menos un módulo" });
      return;
    }

    setLoading(true);
    try {
      const perfil = await createPerfil(formData);
      setMessage({
        type: "success",
        text: `Perfil "${perfil.nombrePerfil}" creado correctamente`,
      });
      setFormData({ nombrePerfil: "", modulos: [] });
      onCreated?.(perfil);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8 lg:max-w-5xl xl:max-w-6xl">
      <h2 className="mb-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Crear perfil</h2>
      <p className="mb-6 text-slate-500">
        Define un perfil y los módulos a los que tendrán acceso los usuarios asignados a él.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 font-semibold text-slate-700 lg:max-w-md">
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
          <ModulesPicker selectedIds={formData.modulos} onToggle={toggleModule} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none lg:w-auto lg:self-start lg:px-10"
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
  );
}

export default ProfileForm;
