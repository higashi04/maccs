import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useModules } from "../../context/ModulesContext";

const STATIC_TITLES = {
  "/modules/create": "Crear módulo",
  "/users/create": "Crear usuario",
};

function Topbar() {
  const location = useLocation();
  const { modules } = useModules();

  const heading = useMemo(() => {
    const activeModule = modules.find((module) => module.ruta === location.pathname);
    return activeModule?.nombreModulo || STATIC_TITLES[location.pathname] || "MACCS";
  }, [modules, location.pathname]);

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-900">{heading}</h1>
    </header>
  );
}

export default Topbar;
