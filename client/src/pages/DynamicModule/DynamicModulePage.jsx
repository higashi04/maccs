import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useModules } from "../../context/ModulesContext";
import { resolveModuleComponent } from "../../registry/moduleComponents";

function DynamicModulePage() {
  const location = useLocation();
  const { modules, loading } = useModules();

  const module = useMemo(
    () => modules.find((item) => item.ruta === location.pathname),
    [modules, location.pathname]
  );

  if (loading) {
    return <p className="text-slate-500">Cargando módulo...</p>;
  }

  if (!module) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-xl">
        <h2 className="mb-2 text-2xl font-semibold text-slate-900">Página no encontrada</h2>
        <p className="mb-6 text-slate-500">
          La ruta {location.pathname} no corresponde a ningún módulo registrado.
        </p>
        <Link to="/" className="font-semibold text-sky-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const ModuleComponent = resolveModuleComponent(module.componente);

  if (!ModuleComponent) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-2 text-2xl font-semibold text-slate-900">{module.nombreModulo}</h2>
        <p className="text-slate-500">
          Este módulo aún no tiene una vista implementada. Componente asignado:{" "}
          <span className="font-mono text-slate-700">{module.componente || "N/A"}</span>
        </p>
      </div>
    );
  }

  return <ModuleComponent />;
}

export default DynamicModulePage;
