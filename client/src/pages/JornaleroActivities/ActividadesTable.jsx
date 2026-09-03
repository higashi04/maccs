import { useMemo, useState } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClockRotateLeft,
  faPen,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { deleteActividad, updateActividad } from "../../api/jornaleroActividadesApi";
import ConfirmDialog from "../../components/ConfirmDialog";

const formatFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const formatMonto = (monto) =>
  Number(monto || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const toDateInput = (fecha) => (fecha ? new Date(fecha).toISOString().slice(0, 10) : "");

/**
 * Etiqueta legible de una actividad (poblada o buscada en el catálogo).
 * @param {Object|string} actividad - actividad poblada o su id.
 * @param {Array<Object>} conceptos - catálogo para resolver ids.
 * @returns {string}
 */
const nombreActividad = (actividad, conceptos) => {
  const doc =
    actividad && typeof actividad === "object"
      ? actividad
      : conceptos.find((item) => item._id === actividad);
  if (!doc) return "—";
  return doc.descripcion ? `${doc.nombre} — ${doc.descripcion}` : doc.nombre;
};

const selectControlClass = {
  control: () =>
    "!rounded-lg !border-slate-300 !text-sm !shadow-none focus-within:!border-sky-500 focus-within:!ring-2 focus-within:!ring-sky-500",
};

/**
 * Historial de actividades registradas, filtrable por jornalero y por orden de compra,
 * con edición en línea y baja lógica. En pantallas pequeñas se muestra como tarjetas.
 * @param {{
 *   actividades: Array<Object>,
 *   conceptos: Array<Object>,
 *   loading: boolean,
 *   error: string,
 *   jornaleroOptions: Array<{ value: string, label: string }>,
 *   ordenCompraOptions: Array<{ value: string, label: string }>,
 *   jornaleroFiltro: string|null,
 *   ordenFiltro: string|null,
 *   onFiltroChange: (jornaleroId: string|null) => void,
 *   onOrdenFiltroChange: (ordenId: string|null) => void,
 *   onActividadUpdated: (actividad: Object) => void,
 *   onDeleted: (actividadId: string) => void,
 * }} props
 */
const ActividadesTable = ({
  actividades,
  conceptos,
  loading,
  error,
  jornaleroOptions,
  ordenCompraOptions,
  jornaleroFiltro,
  ordenFiltro,
  onFiltroChange,
  onOrdenFiltroChange,
  onActividadUpdated,
  onDeleted,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    actividad: "",
    cantidad: "",
    fecha: "",
    descripcion: "",
  });
  const [savingId, setSavingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const conceptoOptions = useMemo(
    () =>
      conceptos.map((concepto) => ({
        value: concepto._id,
        label: concepto.descripcion
          ? `${concepto.nombre} — ${concepto.descripcion}`
          : concepto.nombre,
      })),
    [conceptos]
  );

  const filtroValue = useMemo(
    () => jornaleroOptions.find((option) => option.value === jornaleroFiltro) || null,
    [jornaleroOptions, jornaleroFiltro]
  );

  const ordenFiltroValue = useMemo(
    () => ordenCompraOptions.find((option) => option.value === ordenFiltro) || null,
    [ordenCompraOptions, ordenFiltro]
  );

  const totalSalario = useMemo(
    () => actividades.reduce((suma, actividad) => suma + Number(actividad.salarioJornalero || 0), 0),
    [actividades]
  );

  /**
   * Prepara la edición en línea de una actividad.
   * @param {Object} actividad
   */
  const startEditing = (actividad) => {
    setEditingId(actividad._id);
    setEditValues({
      actividad: actividad.actividad?._id || actividad.actividad || "",
      cantidad: String(actividad.cantidad ?? ""),
      fecha: toDateInput(actividad.fecha),
      descripcion: actividad.descripcion || "",
    });
    setActionError("");
  };

  const cancelEditing = () => setEditingId(null);

  const setEditValue = (campo, valor) => setEditValues((prev) => ({ ...prev, [campo]: valor }));

  /**
   * Guarda los cambios de una actividad editada en línea. El salario se recalcula en el servidor.
   * @param {string} actividadId
   */
  const handleSaveEdit = async (actividadId) => {
    setSavingId(actividadId);
    setActionError("");
    try {
      const actualizada = await updateActividad(actividadId, {
        actividad: editValues.actividad,
        cantidad: Number(editValues.cantidad) || 0,
        ...(editValues.fecha ? { fecha: editValues.fecha } : {}),
        descripcion: editValues.descripcion.trim(),
      });
      onActividadUpdated(actualizada);
      setEditingId(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  /**
   * Confirma la baja lógica de la actividad seleccionada.
   */
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setSavingId(pendingDelete._id);
    setActionError("");
    try {
      await deleteActividad(pendingDelete._id);
      onDeleted(pendingDelete._id);
      setPendingDelete(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500";

  const actividadSelect = (
    <Select
      options={conceptoOptions}
      value={conceptoOptions.find((option) => option.value === editValues.actividad) || null}
      onChange={(selected) => setEditValue("actividad", selected ? selected.value : "")}
      isClearable
      placeholder="Actividad"
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 50 }) }}
      classNames={selectControlClass}
    />
  );

  const renderEditActions = (actividadId) => (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        disabled={savingId === actividadId}
        onClick={() => handleSaveEdit(actividadId)}
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

  const renderActions = (actividad) => (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={() => startEditing(actividad)}
        className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
        title="Editar"
      >
        <FontAwesomeIcon icon={faPen} />
      </button>
      <button
        type="button"
        disabled={savingId === actividad._id}
        onClick={() => setPendingDelete(actividad)}
        className="rounded-lg bg-red-50 px-2 py-1.5 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        title="Eliminar"
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );

  const ordenFolio = (ordenCompra) => {
    if (!ordenCompra) return "—";
    if (typeof ordenCompra === "object") return ordenCompra.ordenCompra || "—";
    const doc = ordenCompraOptions.find((option) => option.value === ordenCompra);
    return doc?.label || "—";
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/40 sm:p-6 lg:max-w-5xl lg:p-8 xl:max-w-6xl">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          <FontAwesomeIcon icon={faClockRotateLeft} className="text-sky-600" />
          Historial de actividades
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:w-auto">
          <div className="w-full sm:w-56">
            <Select
              inputId="filtroJornalero"
              options={jornaleroOptions}
              value={filtroValue}
              onChange={(selected) => onFiltroChange(selected ? selected.value : null)}
              isClearable
              placeholder="Filtrar por jornalero"
              noOptionsMessage={() => "No hay jornaleros"}
              classNames={selectControlClass}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              inputId="filtroOrden"
              options={ordenCompraOptions}
              value={ordenFiltroValue}
              onChange={(selected) => onOrdenFiltroChange(selected ? selected.value : null)}
              isClearable
              placeholder="Filtrar por orden"
              noOptionsMessage={() => "No hay órdenes de compra"}
              classNames={selectControlClass}
            />
          </div>
        </div>
      </div>

      {actionError ? (
        <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Cargando actividades...</p>
      ) : error ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-700">{error}</p>
      ) : actividades.length === 0 ? (
        <p className="text-slate-500">No hay actividades registradas para el filtro seleccionado.</p>
      ) : (
        <>
          {/* Vista de tarjetas para pantallas pequeñas */}
          <div className="flex flex-col gap-3 md:hidden">
            {actividades.map((actividad) => (
              <div key={actividad._id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
                {editingId === actividad._id ? (
                  <div className="flex flex-col gap-3">
                    {actividadSelect}
                    <input
                      type="number"
                      min="0"
                      value={editValues.cantidad}
                      onChange={(event) => setEditValue("cantidad", event.target.value)}
                      className={inputClass}
                      placeholder="Cantidad"
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
                    {renderEditActions(actividad._id)}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">
                        {nombreActividad(actividad.actividad, conceptos)}
                      </span>
                      <span className="font-semibold text-slate-800">{actividad.cantidad ?? 0}</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {actividad.jornalero?.nombre || "Jornalero eliminado"} ·{" "}
                      {formatFecha(actividad.fecha)}
                      {actividad.modelo ? ` · ${actividad.modelo}` : ""}
                    </p>
                    <p className="text-sm text-slate-500">
                      Orden:{" "}
                      <span className="font-mono font-semibold text-slate-700">
                        {ordenFolio(actividad.ordenCompra)}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Salario:{" "}
                      <span className="font-semibold text-slate-700">
                        {formatMonto(actividad.salarioJornalero)}
                      </span>
                    </p>
                    {actividad.descripcion ? (
                      <p className="text-sm text-slate-500">{actividad.descripcion}</p>
                    ) : null}
                    {renderActions(actividad)}
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
                  <th className="py-2 pr-4">Jornalero</th>
                  <th className="py-2 pr-4">Orden</th>
                  <th className="py-2 pr-4">Actividad</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Modelo</th>
                  <th className="py-2 pr-4 text-right">Cantidad</th>
                  <th className="py-2 pr-4 text-right">Salario</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((actividad) => (
                  <tr key={actividad._id} className="border-b border-slate-100">
                    {editingId === actividad._id ? (
                      <>
                        <td className="py-2 pr-4 text-slate-600">
                          {actividad.jornalero?.nombre || "—"}
                        </td>
                        <td className="py-2 pr-4 font-mono text-slate-600">
                          {ordenFolio(actividad.ordenCompra)}
                        </td>
                        <td className="py-2 pr-4 min-w-[12rem]">{actividadSelect}</td>
                        <td className="py-2 pr-4">
                          <input
                            type="date"
                            value={editValues.fecha}
                            onChange={(event) => setEditValue("fecha", event.target.value)}
                            className={inputClass}
                          />
                        </td>
                        <td className="py-2 pr-4 text-slate-500">{actividad.modelo || "—"}</td>
                        <td className="py-2 pr-4">
                          <input
                            type="number"
                            min="0"
                            value={editValues.cantidad}
                            onChange={(event) => setEditValue("cantidad", event.target.value)}
                            className={inputClass}
                          />
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-400">—</td>
                        <td className="py-2 pr-4">{renderEditActions(actividad._id)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pr-4 font-medium text-slate-800">
                          {actividad.jornalero?.nombre || "Jornalero eliminado"}
                        </td>
                        <td className="py-2 pr-4 font-mono font-medium text-slate-700">
                          {ordenFolio(actividad.ordenCompra)}
                        </td>
                        <td className="py-2 pr-4 font-medium text-slate-800">
                          {nombreActividad(actividad.actividad, conceptos)}
                        </td>
                        <td className="py-2 pr-4 text-slate-600">{formatFecha(actividad.fecha)}</td>
                        <td className="py-2 pr-4 text-slate-600">{actividad.modelo || "—"}</td>
                        <td className="py-2 pr-4 text-right font-semibold text-slate-800">
                          {actividad.cantidad ?? 0}
                        </td>
                        <td className="py-2 pr-4 text-right font-semibold text-slate-800">
                          {formatMonto(actividad.salarioJornalero)}
                        </td>
                        <td className="py-2 pr-4">{renderActions(actividad)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-slate-700">
                  <td className="py-3 pr-4 font-semibold" colSpan={6}>
                    Total salario
                  </td>
                  <td className="py-3 pr-4 text-right text-base font-bold">
                    {formatMonto(totalSalario)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 md:hidden">
            <span className="text-sm font-semibold text-slate-500">Total salario</span>
            <span className="text-lg font-bold text-slate-800">{formatMonto(totalSalario)}</span>
          </div>
        </>
      )}

      {pendingDelete ? (
        <ConfirmDialog
          title="Eliminar actividad"
          message={`¿Seguro que deseas eliminar la actividad "${nombreActividad(
            pendingDelete.actividad,
            conceptos
          )}" de "${
            pendingDelete.jornalero?.nombre || "este jornalero"
          }" del ${formatFecha(pendingDelete.fecha)}? Se desactivará y dejará de contar en los totales.`}
          confirmLabel="Eliminar"
          confirming={savingId === pendingDelete._id}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
};

export default ActividadesTable;
