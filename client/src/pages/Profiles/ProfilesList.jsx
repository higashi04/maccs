import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

/**
 * Lista de perfiles registrados con la opción de editar cada uno.
 * @param {{
 *   perfiles: Array<Object>,
 *   loading: boolean,
 *   error: string,
 *   onEdit: (perfil: Object) => void,
 * }} props
 * @returns {JSX.Element}
 */
function ProfilesList({ perfiles, loading, error, onEdit }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8 lg:max-w-5xl xl:max-w-6xl">
      <h2 className="mb-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Perfiles</h2>
      <p className="mb-6 text-slate-500">
        Edita los perfiles existentes para agregar o quitar módulos.
      </p>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Cargando perfiles...</p>
      ) : perfiles.length === 0 ? (
        <p className="text-sm text-slate-500">No hay perfiles registrados todavía.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {perfiles.map((perfil) => (
            <li
              key={perfil._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-800">{perfil.nombrePerfil}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {(perfil.modulos || []).length > 0
                    ? (perfil.modulos || [])
                        .map((modulo) =>
                          typeof modulo === "string" ? modulo : modulo?.nombreModulo
                        )
                        .filter(Boolean)
                        .join(", ")
                    : "Sin módulos asignados"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEdit(perfil)}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                <FontAwesomeIcon icon={faPen} />
                Editar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProfilesList;
