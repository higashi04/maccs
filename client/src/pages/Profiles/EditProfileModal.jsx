import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { updatePerfil } from "../../api/perfilesApi";
import ModulesPicker from "./ModulesPicker";

/**
 * Obtiene el id de un módulo, que puede venir poblado (objeto) o como string.
 * @param {string|{_id: string}} modulo
 * @returns {string}
 */
const toModuleId = (modulo) => (typeof modulo === "string" ? modulo : modulo?._id);

/**
 * Modal para editar un perfil: renombrarlo y agregar/quitar módulos permitidos.
 * @param {{
 *   perfil: Object,
 *   onClose: () => void,
 *   onUpdated: (perfil: Object) => void,
 * }} props
 * @returns {JSX.Element}
 */
function EditProfileModal({ perfil, onClose, onUpdated }) {
  const [nombrePerfil, setNombrePerfil] = useState(perfil.nombrePerfil || "");
  const [modulos, setModulos] = useState((perfil.modulos || []).map(toModuleId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /**
   * Agrega o quita un módulo de la selección.
   * @param {string} moduleId - id del módulo a alternar.
   */
  const toggleModule = (moduleId) => {
    setModulos((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  /**
   * Guarda los cambios del perfil.
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (modulos.length === 0) {
      setError("Selecciona al menos un módulo");
      return;
    }

    setSaving(true);
    try {
      const actualizado = await updatePerfil(perfil._id, { nombrePerfil, modulos });
      onUpdated(actualizado);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:p-4">
      <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[85vh] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">Editar perfil</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6">
          <label className="mb-4 flex flex-col gap-2 font-semibold text-slate-700">
            Nombre del perfil
            <input
              type="text"
              value={nombrePerfil}
              onChange={(event) => setNombrePerfil(event.target.value)}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>

          <span className="mb-2 font-semibold text-slate-700">Módulos permitidos</span>
          <ModulesPicker selectedIds={modulos} onToggle={toggleModule} />

          {error ? (
            <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
