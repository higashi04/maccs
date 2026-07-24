import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHammer, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useModules } from "../../context/ModulesContext";
import { resolveIcon } from "../../utils/iconRegistry";

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-sky-600 text-white shadow-lg shadow-sky-950/40"
      : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

/**
 * Navegación lateral de la app. En pantallas pequeñas se muestra como un
 * panel deslizable (drawer) con overlay; en escritorio permanece fija.
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
function Sidebar({ isOpen, onClose }) {
  const { modules, loading, error } = useModules();

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-lg shadow-lg shadow-sky-950/50">
              <FontAwesomeIcon icon={faHammer} />
            </span>
            <span className="text-lg font-bold leading-tight tracking-wide">
              Contaduría
              <br />
              Melgoza
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
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
    </>
  );
}

export default Sidebar;
