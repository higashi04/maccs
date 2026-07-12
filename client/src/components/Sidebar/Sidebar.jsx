import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHammer, faPlus, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { useModules } from "../../context/ModulesContext";
import { resolveIcon } from "../../utils/iconRegistry";

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`;

function Sidebar() {
  const { modules, loading, error } = useModules();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-2 px-6 py-5 text-xl font-bold tracking-wide">
        <FontAwesomeIcon icon={faHammer} className="text-sky-400" />
        Contaduría Melgoza
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {loading ? (
          <p className="px-3 py-2 text-sm text-slate-400">Cargando módulos...</p>
        ) : error ? (
          <p className="px-3 py-2 text-sm text-red-400">{error}</p>
        ) : modules.length === 0 ? (
          <p className="px-3 py-2 text-sm text-slate-400">Sin módulos registrados</p>
        ) : (
          modules.map((module) => (
            <NavLink key={module._id} to={module.ruta} className={linkClasses}>
              <FontAwesomeIcon icon={resolveIcon(module.icono)} className="w-4" />
              {module.nombreModulo}
            </NavLink>
          ))
        )}
      </nav>


    </aside>
  );
}

export default Sidebar;
