import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModules } from "../../context/ModulesContext";
import { resolveIcon } from "../../utils/iconRegistry";

/**
 * Cuadrícula de casillas para agregar/quitar módulos de un perfil.
 * @param {{
 *   selectedIds: string[],
 *   onToggle: (moduleId: string) => void,
 * }} props - ids de módulos seleccionados y callback al alternar uno.
 * @returns {JSX.Element}
 */
function ModulesPicker({ selectedIds, onToggle }) {
  const { modules, loading } = useModules();

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando módulos...</p>;
  }

  if (modules.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No hay módulos registrados todavía. Crea uno primero.
      </p>
    );
  }

  return (
    <div className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-2">
      {modules.map((module) => (
        <label
          key={module._id}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(module._id)}
            onChange={() => onToggle(module._id)}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <FontAwesomeIcon icon={resolveIcon(module.icono)} className="w-4 text-slate-400" />
          {module.nombreModulo}
        </label>
      ))}
    </div>
  );
}

export default ModulesPicker;
