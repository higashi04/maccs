import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faHandHoldingDollar,
  faPen,
  faRotateLeft,
  faTrash,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { deleteJornalero, updateJornalero } from "../../api/jornalerosApi";
import ConfirmDialog from "../../components/ConfirmDialog";

/**
 * Tabla de jornaleros con acceso a edición, baja/reactivación y gestión de préstamos.
 * @param {{
 *   jornaleros: Array<Object>,
 *   loading: boolean,
 *   error: string,
 *   onManagePrestamos: (jornalero: Object) => void,
 *   onJornaleroUpdated: (jornalero: Object) => void,
 * }} props
 */
const JornalerosTable = ({ jornaleros, loading, error, onManagePrestamos, onJornaleroUpdated }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ nombre: "", activo: true });
  const [savingId, setSavingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const startEditing = (jornalero) => {
    setEditingId(jornalero._id);
    setEditValues({ nombre: jornalero.nombre, activo: jornalero.activo });
    setActionError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (jornaleroId) => {
    setSavingId(jornaleroId);
    setActionError("");
    try {
      const actualizado = await updateJornalero(jornaleroId, editValues);
      onJornaleroUpdated(actualizado);
      setEditingId(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActivo = async (jornalero) => {
    setSavingId(jornalero._id);
    setActionError("");
    try {
      const actualizado = await updateJornalero(jornalero._id, { activo: true });
      onJornaleroUpdated(actualizado);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setSavingId(pendingDelete._id);
    setActionError("");
    try {
      const actualizado = await deleteJornalero(pendingDelete._id);
      onJornaleroUpdated(actualizado);
      setPendingDelete(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-8 shadow-xl">
      <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <FontAwesomeIcon icon={faUsers} className="text-sky-600" />
        Jornaleros
      </h3>

      {actionError ? (
        <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Cargando jornaleros...</p>
      ) : error ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-700">{error}</p>
      ) : jornaleros.length === 0 ? (
        <p className="text-slate-500">Aún no hay jornaleros registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Préstamos pendientes</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {jornaleros.map((jornalero) => (
                <tr key={jornalero._id} className="border-b border-slate-100">
                  {editingId === jornalero._id ? (
                    <>
                      <td className="py-2 pr-4">
                        <input
                          type="text"
                          value={editValues.nombre}
                          onChange={(event) =>
                            setEditValues((prev) => ({ ...prev, nombre: event.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <input
                            type="checkbox"
                            checked={editValues.activo}
                            onChange={(event) =>
                              setEditValues((prev) => ({ ...prev, activo: event.target.checked }))
                            }
                            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          Activo
                        </label>
                      </td>
                      <td className="py-2 pr-4 text-slate-600">{jornalero.prestamos?.length || 0}</td>
                      <td className="py-2 pr-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={savingId === jornalero._id}
                            onClick={() => handleSaveEdit(jornalero._id)}
                            className="rounded-lg bg-emerald-100 px-2 py-1.5 text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Guardar"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
                            title="Cancelar"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 pr-4 font-medium text-slate-800">{jornalero.nombre}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            jornalero.activo
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {jornalero.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-slate-600">{jornalero.prestamos?.length || 0}</td>
                      <td className="py-2 pr-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onManagePrestamos(jornalero)}
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                          >
                            <FontAwesomeIcon icon={faHandHoldingDollar} />
                            Préstamos
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditing(jornalero)}
                            className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
                            title="Editar"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          {jornalero.activo ? (
                            <button
                              type="button"
                              disabled={savingId === jornalero._id}
                              onClick={() => setPendingDelete(jornalero)}
                              className="rounded-lg bg-red-50 px-2 py-1.5 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Eliminar"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={savingId === jornalero._id}
                              onClick={() => handleToggleActivo(jornalero)}
                              className="rounded-lg bg-emerald-50 px-2 py-1.5 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Reactivar"
                            >
                              <FontAwesomeIcon icon={faRotateLeft} />
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingDelete ? (
        <ConfirmDialog
          title="Eliminar jornalero"
          message={`¿Seguro que deseas eliminar a "${pendingDelete.nombre}"? Se desactivará y dejará de aparecer en las listas activas, pero su historial de préstamos se conservará.`}
          confirmLabel="Eliminar"
          confirming={savingId === pendingDelete._id}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
};

export default JornalerosTable;
