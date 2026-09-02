import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faFileInvoiceDollar,
  faPen,
  faRotateLeft,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { deleteOrdenCompra, updateOrdenCompra } from "../../api/ordenesCompraApi";
import ConfirmDialog from "../../components/ConfirmDialog";

const formatMonto = (monto) =>
  Number(monto || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const initialEditValues = {
  modeloSillas: "",
  cantidadSillas: 0,
  MontoEsperado: 0,
  active: true,
};

/**
 * Tabla de órdenes de compra con acceso a edición y baja/reactivación.
 * El folio es asignado por el sistema y se muestra en solo lectura.
 * En pantallas pequeñas se muestra como una lista de tarjetas en vez de tabla.
 * @param {{
 *   ordenes: Array<Object>,
 *   loading: boolean,
 *   error: string,
 *   onOrdenUpdated: (orden: Object) => void,
 * }} props
 */
const OrdenesCompraTable = ({ ordenes, loading, error, onOrdenUpdated }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState(initialEditValues);
  const [savingId, setSavingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const startEditing = (orden) => {
    setEditingId(orden._id);
    setEditValues({
      modeloSillas: orden.modeloSillas ?? "",
      cantidadSillas: orden.cantidadSillas ?? 0,
      MontoEsperado: orden.MontoEsperado ?? 0,
      active: orden.active,
    });
    setActionError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (ordenId) => {
    setSavingId(ordenId);
    setActionError("");
    try {
      const actualizada = await updateOrdenCompra(ordenId, {
        modeloSillas: editValues.modeloSillas.trim(),
        cantidadSillas: Number(editValues.cantidadSillas) || 0,
        MontoEsperado: Number(editValues.MontoEsperado) || 0,
        active: editValues.active,
      });
      onOrdenUpdated(actualizada);
      setEditingId(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleReactivar = async (orden) => {
    setSavingId(orden._id);
    setActionError("");
    try {
      const actualizada = await updateOrdenCompra(orden._id, { active: true });
      onOrdenUpdated(actualizada);
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
      const actualizada = await deleteOrdenCompra(pendingDelete._id);
      onOrdenUpdated(actualizada);
      setPendingDelete(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const statusBadge = (active) => (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
      }`}
    >
      {active ? "Activa" : "Inactiva"}
    </span>
  );

  const renderActions = (orden) => (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={() => startEditing(orden)}
        className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
        title="Editar"
      >
        <FontAwesomeIcon icon={faPen} />
      </button>
      {orden.active ? (
        <button
          type="button"
          disabled={savingId === orden._id}
          onClick={() => setPendingDelete(orden)}
          className="rounded-lg bg-red-50 px-2 py-1.5 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Eliminar"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      ) : (
        <button
          type="button"
          disabled={savingId === orden._id}
          onClick={() => handleReactivar(orden)}
          className="rounded-lg bg-emerald-50 px-2 py-1.5 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Reactivar"
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
      )}
    </div>
  );

  const renderEditActions = (ordenId) => (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        disabled={savingId === ordenId}
        onClick={() => handleSaveEdit(ordenId)}
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

  const editModeloInput = (
    <input
      type="text"
      value={editValues.modeloSillas}
      onChange={(event) =>
        setEditValues((prev) => ({ ...prev, modeloSillas: event.target.value }))
      }
      className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
    />
  );

  const editCantidadInput = (
    <input
      type="number"
      min="0"
      value={editValues.cantidadSillas}
      onChange={(event) =>
        setEditValues((prev) => ({ ...prev, cantidadSillas: event.target.value }))
      }
      className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
    />
  );

  const editMontoInput = (
    <input
      type="number"
      min="0"
      step="0.01"
      value={editValues.MontoEsperado}
      onChange={(event) =>
        setEditValues((prev) => ({ ...prev, MontoEsperado: event.target.value }))
      }
      className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
    />
  );

  const editActivaCheckbox = (
    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
      <input
        type="checkbox"
        checked={editValues.active}
        onChange={(event) =>
          setEditValues((prev) => ({ ...prev, active: event.target.checked }))
        }
        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
      />
      Activa
    </label>
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/40 sm:p-6 lg:max-w-5xl lg:p-8 xl:max-w-6xl">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 sm:text-2xl">
        <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-sky-600" />
        Órdenes de compra
      </h3>

      {actionError ? (
        <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Cargando órdenes de compra...</p>
      ) : error ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-700">{error}</p>
      ) : ordenes.length === 0 ? (
        <p className="text-slate-500">Aún no hay órdenes de compra registradas.</p>
      ) : (
        <>
          {/* Vista de tarjetas para pantallas pequeñas */}
          <div className="flex flex-col gap-3 md:hidden">
            {ordenes.map((orden) => (
              <div key={orden._id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-slate-800">
                    {orden.ordenCompra}
                  </span>
                  {editingId === orden._id ? editActivaCheckbox : statusBadge(orden.active)}
                </div>

                {editingId === orden._id ? (
                  <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                      Modelo de sillas
                      {editModeloInput}
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                      Cantidad de sillas
                      {editCantidadInput}
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                      Monto esperado
                      {editMontoInput}
                    </label>
                    {renderEditActions(orden._id)}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-slate-500">
                      Modelo:{" "}
                      <span className="font-semibold text-slate-700">{orden.modeloSillas}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Cantidad:{" "}
                      <span className="font-semibold text-slate-700">
                        {orden.cantidadSillas ?? 0}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Monto esperado:{" "}
                      <span className="font-semibold text-slate-700">
                        {formatMonto(orden.MontoEsperado)}
                      </span>
                    </p>
                    {renderActions(orden)}
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
                  <th className="py-2 pr-4">Folio</th>
                  <th className="py-2 pr-4">Modelo</th>
                  <th className="py-2 pr-4">Cantidad</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4">Monto esperado</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => (
                  <tr key={orden._id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-mono font-medium text-slate-800">
                      {orden.ordenCompra}
                    </td>
                    {editingId === orden._id ? (
                      <>
                        <td className="py-2 pr-4">{editModeloInput}</td>
                        <td className="py-2 pr-4">{editCantidadInput}</td>
                        <td className="py-2 pr-4">{editActivaCheckbox}</td>
                        <td className="py-2 pr-4">{editMontoInput}</td>
                        <td className="py-2 pr-4">{renderEditActions(orden._id)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pr-4 text-slate-600">{orden.modeloSillas}</td>
                        <td className="py-2 pr-4 text-slate-600">{orden.cantidadSillas ?? 0}</td>
                        <td className="py-2 pr-4">{statusBadge(orden.active)}</td>
                        <td className="py-2 pr-4 text-slate-600">
                          {formatMonto(orden.MontoEsperado)}
                        </td>
                        <td className="py-2 pr-4">{renderActions(orden)}</td>
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
          title="Eliminar orden de compra"
          message={`¿Seguro que deseas eliminar la orden "${pendingDelete.ordenCompra}"? Se desactivará y dejará de aparecer en las listas activas, pero su historial se conservará.`}
          confirmLabel="Eliminar"
          confirming={savingId === pendingDelete._id}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
};

export default OrdenesCompraTable;
