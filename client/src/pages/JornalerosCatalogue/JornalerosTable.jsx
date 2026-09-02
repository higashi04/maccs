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

const formatCantidad = (cantidad) =>
  Number(cantidad || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const getTotalPrestamos = (jornalero) =>
  (jornalero.prestamos || []).reduce((total, prestamo) => total + Number(prestamo.cantidad || 0), 0);

/**
 * Tabla de jornaleros con acceso a edición, baja/reactivación y gestión de préstamos.
 * En pantallas pequeñas se muestra como una lista de tarjetas en vez de tabla.
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

  const renderActions = (jornalero) => (
    <div className="flex flex-wrap justify-end gap-2">
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
  );

  const renderEditActions = (jornaleroId) => (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        disabled={savingId === jornaleroId}
        onClick={() => handleSaveEdit(jornaleroId)}
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
  );

  const statusBadge = (activo) => (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/40 sm:p-6 lg:max-w-5xl lg:p-8 xl:max-w-6xl">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 sm:text-2xl">
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
        <>
          {/* Vista de tarjetas para pantallas pequeñas */}
          <div className="flex flex-col gap-3 md:hidden">
            {jornaleros.map((jornalero) => (
              <div
                key={jornalero._id}
                className="rounded-xl border border-slate-200 p-4 shadow-sm"
              >
                {editingId === jornalero._id ? (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editValues.nombre}
                      onChange={(event) =>
                        setEditValues((prev) => ({ ...prev, nombre: event.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
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
                    {renderEditActions(jornalero._id)}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">{jornalero.nombre}</span>
                      {statusBadge(jornalero.activo)}
                    </div>
                    <p className="text-sm text-slate-500">
                      Préstamos pendientes:{" "}
                      <span className="font-semibold text-slate-700">
                        {jornalero.prestamos?.length || 0}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Total prestado:{" "}
                      <span className="font-semibold text-slate-700">
                        {formatCantidad(getTotalPrestamos(jornalero))}
                      </span>
                    </p>
                    {renderActions(jornalero)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vista de tabla para pantallas medianas en adelante */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4">Préstamos pendientes</th>
                  <th className="py-2 pr-4">Total prestado</th>
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
                        <td className="py-2 pr-4 text-slate-600">
                          {formatCantidad(getTotalPrestamos(jornalero))}
                        </td>
                        <td className="py-2 pr-4">{renderEditActions(jornalero._id)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pr-4 font-medium text-slate-800">{jornalero.nombre}</td>
                        <td className="py-2 pr-4">{statusBadge(jornalero.activo)}</td>
                        <td className="py-2 pr-4 text-slate-600">{jornalero.prestamos?.length || 0}</td>
                        <td className="py-2 pr-4 text-slate-600">
                          {formatCantidad(getTotalPrestamos(jornalero))}
                        </td>
                        <td className="py-2 pr-4">{renderActions(jornalero)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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
