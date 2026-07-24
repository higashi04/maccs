import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faPen,
  faPlus,
  faTimes,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { addPrestamo, pagarPrestamo, updatePrestamo } from "../../api/jornalerosApi";

const initialNewPrestamo = { fecha: "", cantidad: "" };

const toInputDate = (fecha) => (fecha ? new Date(fecha).toISOString().slice(0, 10) : "");
const formatDate = (fecha) => (fecha ? new Date(fecha).toLocaleDateString("es-MX") : "-");
const formatCantidad = (cantidad) =>
  Number(cantidad || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

/**
 * Modal para gestionar los préstamos de un jornalero: agregar nuevos,
 * editar los pendientes y marcarlos como pagados.
 * @param {{
 *   jornalero: Object,
 *   onClose: () => void,
 *   onUpdated: (jornalero: Object) => void,
 * }} props
 */
const PrestamosModal = ({ jornalero, onClose, onUpdated }) => {
  const [newPrestamo, setNewPrestamo] = useState(initialNewPrestamo);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState(initialNewPrestamo);
  const [busyId, setBusyId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const prestamosPendientes = jornalero.prestamos || [];
  const prestamosPagados = jornalero.prestamosPagados || [];

  const handleAddSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const actualizado = await addPrestamo(jornalero._id, {
        fecha: newPrestamo.fecha,
        cantidad: Number(newPrestamo.cantidad),
      });
      setNewPrestamo(initialNewPrestamo);
      onUpdated(actualizado);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (prestamo) => {
    setEditingId(prestamo._id);
    setEditValues({ fecha: toInputDate(prestamo.fecha), cantidad: prestamo.cantidad });
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues(initialNewPrestamo);
  };

  const handleEditSave = async (prestamoId) => {
    setBusyId(prestamoId);
    setError("");
    try {
      const actualizado = await updatePrestamo(jornalero._id, prestamoId, {
        fecha: editValues.fecha,
        cantidad: Number(editValues.cantidad),
      });
      onUpdated(actualizado);
      cancelEditing();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handlePagar = async (prestamoId) => {
    setBusyId(prestamoId);
    setError("");
    try {
      const actualizado = await pagarPrestamo(jornalero._id, prestamoId);
      onUpdated(actualizado);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:p-4">
      <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[85vh] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Préstamos de {jornalero.nombre}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <form onSubmit={handleAddSubmit} className="mb-6 flex flex-wrap items-end gap-3">
            <label className="flex flex-1 min-w-[140px] flex-col gap-1 text-sm font-semibold text-slate-700">
              Fecha
              <input
                type="date"
                required
                value={newPrestamo.fecha}
                onChange={(event) =>
                  setNewPrestamo((prev) => ({ ...prev, fecha: event.target.value }))
                }
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="flex flex-1 min-w-[120px] flex-col gap-1 text-sm font-semibold text-slate-700 sm:flex-none">
              Cantidad
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={newPrestamo.cantidad}
                onChange={(event) =>
                  setNewPrestamo((prev) => ({ ...prev, cantidad: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:w-32"
                placeholder="0.00"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            >
              <FontAwesomeIcon icon={faPlus} />
              {submitting ? "Agregando..." : "Agregar préstamo"}
            </button>
          </form>

          {error ? (
            <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            Pendientes
          </h4>
          {prestamosPendientes.length === 0 ? (
            <p className="mb-6 text-sm text-slate-500">Sin préstamos pendientes.</p>
          ) : (
            <ul className="mb-6 flex flex-col gap-2">
              {prestamosPendientes.map((prestamo) => (
                <li
                  key={prestamo._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
                >
                  {editingId === prestamo._id ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="date"
                          value={editValues.fecha}
                          onChange={(event) =>
                            setEditValues((prev) => ({ ...prev, fecha: event.target.value }))
                          }
                          className="rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editValues.cantidad}
                          onChange={(event) =>
                            setEditValues((prev) => ({ ...prev, cantidad: event.target.value }))
                          }
                          className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyId === prestamo._id}
                          onClick={() => handleEditSave(prestamo._id)}
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
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm">
                        <span className="font-semibold text-slate-800">
                          {formatCantidad(prestamo.cantidad)}
                        </span>
                        <span className="ml-2 text-slate-500">{formatDate(prestamo.fecha)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(prestamo)}
                          className="rounded-lg bg-sky-50 px-2 py-1.5 text-sky-700 transition hover:bg-sky-100"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          type="button"
                          disabled={busyId === prestamo._id}
                          onClick={() => handlePagar(prestamo._id)}
                          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busyId === prestamo._id ? "Procesando..." : "Marcar pagado"}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            Pagados
          </h4>
          {prestamosPagados.length === 0 ? (
            <p className="text-sm text-slate-500">Sin préstamos pagados.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {prestamosPagados.map((prestamo) => (
                <li
                  key={prestamo._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500"
                >
                  <div>
                    <span className="font-semibold text-slate-700">
                      {formatCantidad(prestamo.cantidad)}
                    </span>
                    <span className="ml-2">{formatDate(prestamo.fecha)}</span>
                  </div>
                  <span>Pagado el {formatDate(prestamo.fechaPago)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrestamosModal;
