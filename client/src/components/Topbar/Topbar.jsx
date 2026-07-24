import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useModules } from "../../context/ModulesContext";
import { useAuth } from "../../context/AuthContext";

const STATIC_TITLES = {
  "/modules/create": "Crear módulo",
  "/users/create": "Crear usuario",
  "/profiles/create": "Crear perfil",
};

/**
 * Barra superior con el título de la sección activa, el acceso al menú
 * móvil y las acciones de la sesión del usuario.
 * @param {{ onMenuClick: () => void }} props
 */
function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { modules } = useModules();
  const { user, logout } = useAuth();

  const heading = useMemo(() => {
    const activeModule = modules.find((module) => module.ruta === location.pathname);
    return activeModule?.nombreModulo || STATIC_TITLES[location.pathname] || "MACCS";
  }, [modules, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">{heading}</h1>
      </div>
      {user ? (
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden text-sm font-semibold text-slate-600 sm:inline">
            {user.username}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-3"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      ) : null}
    </header>
  );
}

export default Topbar;
