import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useModules } from "../../context/ModulesContext";
import { useAuth } from "../../context/AuthContext";

const STATIC_TITLES = {
  "/modules/create": "Crear módulo",
  "/users/create": "Crear usuario",
  "/profiles/create": "Crear perfil",
};

function Topbar() {
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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-900">{heading}</h1>
      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-600">{user.username}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </header>
  );
}

export default Topbar;
