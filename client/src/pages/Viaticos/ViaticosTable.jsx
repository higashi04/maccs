import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faPen,
  faReceipt,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { deleteViatico, updateViatico } from "../../api/viaticosApi";
import ConfirmDialog from "../../components/ConfirmDialog";

const formatMonto = (monto) =>
  Number(monto || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const formatFecha = (fecha) =>
  fecha ? new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/**
 * Etiqueta legible de un concepto (poblado o buscado en el catálogo).
 * @param {Object|string} concepto - concepto poblado o su id.
 * @param {Array<Object>} conceptos - catálogo para resolver ids.
 * @returns {string}
 */
const nombreConcepto = (concepto, conceptos) => {
  const doc =
    concepto && typeof concepto === "object"
      ? concepto
      : conceptos.find((item) => item._id === concepto);
  if (!doc) return "—";
  return doc.nombre ? `${doc.TipoViatico} — ${doc.nombre}` : doc.TipoViatico;
};

const toDateInput = (fecha) => (fecha ? new Date(fecha).toISOString().slice(0, 10) : "");

/**
 * Tabla de viáticos registrados con filtro por orden de compra, edición en línea
 * y baja lógica. En pantallas pequeñas se muestra como lista de tarjetas.
 * @param {{
 *   viaticos: Array<Object>,
 *   conceptos: Array<Object>,
 *   ordenes: Array<Object>,
 *   loading: boolean,
 *   error: string,
 *   filterOrden: string,
 *   onFilterChange: (ordenId: string) => void,
 *   onViaticoUpdated: (viatico: Object) => void,
 *   onViaticoRemoved: (viaticoId: string) => void,
 * }} props
 */
const ViaticosTable = ({
  viaticos,
  conceptos,
  ordenes,
  loading,
  error,
  filterOrden,
  onFilterChange,
  onViaticoUpdated,
  onViaticoRemoved,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ concepto: "", monto: "", fecha: "", descripcion: "" });
  const [savingId, setSavingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const total = useMemo(
    () => viaticos.reduce((suma, viatico) => suma + Number(viatico.monto || 0), 0),
    [viaticos]
  );

  const ordenFolio = (ordenCompra) => {
    const id = ordenCompra && typeof ordenCompra === "object" ? ordenCompra._id : ordenCompra;
    const doc = ordenes.find((orden) => orden._id === id);
    return doc?.ordenCompra || "—";
  };

  /**
   * Prepara la edición en línea de un viático.
   * @param {Object} viatico
   */
  const startEditing = (viatico) => {
    setEditingId(viatico._id);
    setEditValues({
      concepto: viatico.concepto?._id || viatico.concepto || "",
      monto: String(viatico.monto ?? ""),
      fecha: toDateInput(viatico.fecha),
      descripcion: viatico.descripcion || "",
    });
    setActionError("");
  };

  const cancelEditing = () => setEditingId(null);

  const setEditValue = (campo, valor) => setEditValues((prev) => ({ ...prev, [campo]: valor }));

  /**
   * Guarda los cambios de un viático editado en línea.
   * @param {string} viaticoId
   */
  const handleSaveEdit = async (viaticoId) => {
    setSavingId(viaticoId);
    setActionError("");
    try {
      const actualizado = await updateViatico(viaticoId, {
        concepto: editValues.concepto,
        monto: Number(editValues.monto) || 0,
        ...(editValues.fecha ? { fecha: editValues.fecha } : {}),
        descripcion: editValues.descripcion.trim(),
      });
      onViaticoUpdated(actualizado);
      setEditingId(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  /**
   * Confirma la baja lógica del viático seleccionado.
   */
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setSavingId(pendingDelete._id);
    setActionError("");
    try {
      await deleteViatico(pendingDelete._id);
      onViaticoRemoved(pendingDelete._id);
      setPendingDelete(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500";

  const conceptoSelect = (
    <select
      value={editValues.concepto}
      onChange={(event) => setEditValue("concepto", event.target.value)}
      className={inputClass}
    >
      <option value="">Concepto</option>
      {conceptos.map((concepto) => (
        <option key={concepto._id} value={concepto._id}>
          {concepto.TipoViatico}
          {concepto.nombre ? ` — ${concepto.nombre}` : ""}
        </option>
      ))}
    </select>
  );

  const renderEditActions = (viaticoId) => (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        disabled={savingId === viaticoId}
        onClick={() => handleSaveEdit(viaticoId)}
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

  const renderActions = (viatico) => (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={() => startEditing(viatico)}
        className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
        title="Editar"
      >
        <FontAwesomeIcon icon={faPen} />
      </button>
      <button
        type="button"
        disabled={savingId === viatico._id}
        onClick={() => setPendingDelete(viatico)}
        className="rounded-lg bg-red-50 px-2 py-1.5 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        title="Eliminar"
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/40 sm:p-6 lg:max-w-5xl lg:p-8 xl:max-w-6xl">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 sm:text-2xl">
        <FontAwesomeIcon icon={faReceipt} className="text-sky-600" />
        Viáticos registrados
      </h3>

      <label className="mb-4 flex flex-col gap-1 text-xs font-semibold text-slate-600 sm:max-w-xs">
        Filtrar por orden de compra
        <select
          value={filterOrden}
          onChange={(event) => onFilterChange(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Todas las órdenes</option>
          {ordenes.map((orden) => (
            <option key={orden._id} value={orden._id}>
              {orden.ordenCompra}
              {orden.modeloSillas ? ` — ${orden.modeloSillas}` : ""}
            </option>
          ))}
        </select>
      </label>

      {actionError ? (
        <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Cargando viáticos...</p>
      ) : error ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-700">{error}</p>
      ) : viaticos.length === 0 ? (
        <p className="text-slate-500">No hay viáticos registrados para el filtro seleccionado.</p>
      ) : (
        <>
          {/* Vista de tarjetas para pantallas pequeñas */}
          <div className="flex flex-col gap-3 md:hidden">
            {viaticos.map((viatico) => (
              <div key={viatico._id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
                {editingId === viatico._id ? (
                  <div className="flex flex-col gap-3">
                    {conceptoSelect}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editValues.monto}
                      onChange={(event) => setEditValue("monto", event.target.value)}
                      className={inputClass}
                      placeholder="Monto"
                    />
                    <input
                      type="date"
                      value={editValues.fecha}
                      onChange={(event) => setEditValue("fecha", event.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={editValues.descripcion}
                      onChange={(event) => setEditValue("descripcion", event.target.value)}
                      className={inputClass}
                      placeholder="Descripción"
                    />
                    {renderEditActions(viatico._id)}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">
                        {nombreConcepto(viatico.concepto, conceptos)}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatMonto(viatico.monto)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Orden:{" "}
                      <span className="font-mono font-semibold text-slate-700">
                        {ordenFolio(viatico.ordenCompra)}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500">Fecha: {formatFecha(viatico.fecha)}</p>
                    {viatico.descripcion ? (
                      <p className="text-sm text-slate-500">{viatico.descripcion}</p>
                    ) : null}
                    {renderActions(viatico)}
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
                  <th className="py-2 pr-4">Orden</th>
                  <th className="py-2 pr-4">Concepto</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Descripción</th>
                  <th className="py-2 pr-4 text-right">Monto</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {viaticos.map((viatico) => (
                  <tr key={viatico._id} className="border-b border-slate-100">
                    {editingId === viatico._id ? (
                      <>
                        <td className="py-2 pr-4 font-mono text-slate-600">
                          {ordenFolio(viatico.ordenCompra)}
                        </td>
                        <td className="py-2 pr-4">{conceptoSelect}</td>
                        <td className="py-2 pr-4">
                          <input
                            type="date"
                            value={editValues.fecha}
                            onChange={(event) => setEditValue("fecha", event.target.value)}
                            className={inputClass}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="text"
                            value={editValues.descripcion}
                            onChange={(event) => setEditValue("descripcion", event.target.value)}
                            className={inputClass}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValues.monto}
                            onChange={(event) => setEditValue("monto", event.target.value)}
                            className={inputClass}
                          />
                        </td>
                        <td className="py-2 pr-4">{renderEditActions(viatico._id)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pr-4 font-mono font-medium text-slate-700">
                          {ordenFolio(viatico.ordenCompra)}
                        </td>
                        <td className="py-2 pr-4 font-medium text-slate-800">
                          {nombreConcepto(viatico.concepto, conceptos)}
                        </td>
                        <td className="py-2 pr-4 text-slate-600">{formatFecha(viatico.fecha)}</td>
                        <td className="py-2 pr-4 text-slate-600">{viatico.descripcion || "—"}</td>
                        <td className="py-2 pr-4 text-right font-semibold text-slate-800">
                          {formatMonto(viatico.monto)}
                        </td>
                        <td className="py-2 pr-4">{renderActions(viatico)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-slate-700">
                  <td className="py-3 pr-4 font-semibold" colSpan={4}>
                    Total
                  </td>
                  <td className="py-3 pr-4 text-right text-base font-bold">{formatMonto(total)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 md:hidden">
            <span className="text-sm font-semibold text-slate-500">Total</span>
            <span className="text-lg font-bold text-slate-800">{formatMonto(total)}</span>
          </div>
        </>
      )}

      {pendingDelete ? (
        <ConfirmDialog
          title="Eliminar viático"
          message={`¿Seguro que deseas eliminar este viático por ${formatMonto(
            pendingDelete.monto
          )}? Se desactivará y dejará de contar en los totales de la orden.`}
          confirmLabel="Eliminar"
          confirming={savingId === pendingDelete._id}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
};

export default ViaticosTable;
