import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useModules } from "../../context/ModulesContext";
import { useAuth } from "../../context/AuthContext";
import { resolveIcon } from "../../utils/iconRegistry";

/**
 * Página de inicio tras iniciar sesión: saluda al usuario y muestra accesos
 * directos a los módulos que tiene habilitados.
 */
function Home() {
  const { modules, loading, error } = useModules();
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
        Hola, {user?.username || "usuario"}
      </h2>
      <p className="mt-2 text-slate-500">
        Este es tu panel de inicio. Selecciona un módulo para comenzar a trabajar.
      </p>

      <div className="mt-8">
        {loading ? (
          <p className="text-slate-500">Cargando módulos...</p>
        ) : error ? (
          <p className="font-semibold text-red-600">{error}</p>
        ) : modules.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
            <h3 className="mb-2 text-xl font-semibold text-slate-900">Sin módulos asignados</h3>
            <p className="text-slate-500">
              Tu cuenta no tiene módulos habilitados. Contacta a un administrador para solicitar acceso.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Link
                key={module._id}
                to={module.ruta}
                className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-300/40 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-lg text-sky-600">
                  <FontAwesomeIcon icon={resolveIcon(module.icono)} />
                </span>
                <span className="flex-1 font-semibold text-slate-800">{module.nombreModulo}</span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-sky-600"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
