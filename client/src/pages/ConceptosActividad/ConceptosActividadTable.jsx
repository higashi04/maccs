import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faListCheck,
  faPen,
  faRotateLeft,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { deleteConceptoActividad, updateConceptoActividad } from "../../api/conceptosActividadApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import { TIPOS_SILLA } from "../../constants/tiposSilla";

const formatTarifa = (valor) =>
  Number(valor || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const tarifasVacias = () =>
  TIPOS_SILLA.reduce((acumulado, tipo) => {
    acumulado[tipo.code] = "";
    return acumulado;
  }, {});

/**
 * Convierte el objeto de tarifas (strings) a números, descartando vacíos.
 * @param {Record<string, string>} tarifas
 * @returns {Record<string, number>}
 */
const limpiarTarifas = (tarifas) =>
  Object.entries(tarifas).reduce((acumulado, [code, valor]) => {
    if (valor !== "" && Number.isFinite(Number(valor))) acumulado[code] = Number(valor);
    return acumulado;
  }, {});

/**
 * Resumen legible de las tarifas configuradas (p. ej. "H $22 · B $42").
 * @param {Record<string, number>} [tarifas]
 * @returns {string}
 */
const resumenTarifas = (tarifas) => {
  const entradas = TIPOS_SILLA.filter((tipo) => Number(tarifas?.[tipo.code]) > 0).map(
    (tipo) => `${tipo.code} ${formatTarifa(tarifas[tipo.code])}`
  );
  return entradas.length ? entradas.join(" · ") : "—";
};

/**
 * Tabla del catálogo de actividades de jornaleros con edición en línea, baja y reactivación.
 * En pantallas pequeñas se muestra como una lista de tarjetas en vez de tabla.
 * @param {{
 *   conceptos: Array<Object>,
 *   loading: boolean,
 *   error: string,
 *   onConceptoUpdated: (concepto: Object) => void,
 * }} props
 */
const ConceptosActividadTable = ({ conceptos, loading, error, onConceptoUpdated }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
    tarifas: tarifasVacias(),
  });
  const [savingId, setSavingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  /**
   * Prepara la edición en línea de una actividad.
   * @param {Object} concepto
   */
  const startEditing = (concepto) => {
    setEditingId(concepto._id);
    setEditValues({
      nombre: concepto.nombre || "",
      descripcion: concepto.descripcion || "",
      activo: concepto.activo,
      tarifas: TIPOS_SILLA.reduce((acumulado, tipo) => {
        const valor = concepto.tarifas?.[tipo.code];
        acumulado[tipo.code] = valor != null ? String(valor) : "";
        return acumulado;
      }, {}),
    });
    setActionError("");
  };

  const cancelEditing = () => setEditingId(null);

  /**
   * Actualiza un campo base del formulario de edición en línea.
   * @param {string} campo
   * @param {string|boolean} valor
   */
  const setEditValue = (campo, valor) => {
    setEditValues((prev) => ({ ...prev, [campo]: valor }));
  };

  /**
   * Actualiza una tarifa del formulario de edición en línea.
   * @param {string} code
   * @param {string} valor
   */
  const setEditTarifa = (code, valor) => {
    setEditValues((prev) => ({ ...prev, tarifas: { ...prev.tarifas, [code]: valor } }));
  };

  /**
   * Guarda los cambios de una actividad editada en línea.
   * @param {string} conceptoId
   */
  const handleSaveEdit = async (conceptoId) => {
    setSavingId(conceptoId);
    setActionError("");
    try {
      const actualizado = await updateConceptoActividad(conceptoId, {
        nombre: editValues.nombre.trim(),
        descripcion: editValues.descripcion.trim(),
        activo: editValues.activo,
        tarifas: limpiarTarifas(editValues.tarifas),
      });
      onConceptoUpdated(actualizado);
      setEditingId(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  /**
   * Reactiva una actividad dada de baja.
   * @param {Object} concepto
   */
  const handleReactivar = async (concepto) => {
    setSavingId(concepto._id);
    setActionError("");
    try {
      const actualizado = await updateConceptoActividad(concepto._id, { activo: true });
      onConceptoUpdated(actualizado);
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
      const actualizado = await deleteConceptoActividad(pendingDelete._id);
      onConceptoUpdated(actualizado);
      setPendingDelete(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const statusBadge = (activo) => (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );

  const renderActions = (concepto) => (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={() => startEditing(concepto)}
        className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
        title="Editar"
      >
        <FontAwesomeIcon icon={faPen} />
      </button>
      {concepto.activo ? (
        <button
          type="button"
          disabled={savingId === concepto._id}
          onClick={() => setPendingDelete(concepto)}
          className="rounded-lg bg-red-50 px-2 py-1.5 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Eliminar"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      ) : (
        <button
          type="button"
          disabled={savingId === concepto._id}
          onClick={() => handleReactivar(concepto)}
          className="rounded-lg bg-emerald-50 px-2 py-1.5 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Reactivar"
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
      )}
    </div>
  );

  const renderEditActions = (conceptoId) => (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        disabled={savingId === conceptoId}
        onClick={() => handleSaveEdit(conceptoId)}
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

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500";

  const tarifasEditor = (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {TIPOS_SILLA.map((tipo) => (
        <label key={tipo.code} className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
          {tipo.code}
          <input
            type="number"
            min="0"
            step="0.01"
            value={editValues.tarifas[tipo.code]}
            onChange={(event) => setEditTarifa(tipo.code, event.target.value)}
            className={inputClass}
            placeholder="$"
          />
        </label>
      ))}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/40 sm:p-6 lg:max-w-5xl lg:p-8 xl:max-w-6xl">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 sm:text-2xl">
        <FontAwesomeIcon icon={faListCheck} className="text-sky-600" />
        Catálogo de actividades
      </h3>

      {actionError ? (
        <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Cargando actividades...</p>
      ) : error ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-700">{error}</p>
      ) : conceptos.length === 0 ? (
        <p className="text-slate-500">Aún no hay actividades registradas.</p>
      ) : (
        <>
          {/* Vista de tarjetas para pantallas pequeñas */}
          <div className="flex flex-col gap-3 md:hidden">
            {conceptos.map((concepto) => (
              <div key={concepto._id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
                {editingId === concepto._id ? (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editValues.nombre}
                      onChange={(event) => setEditValue("nombre", event.target.value)}
                      className={inputClass}
                      placeholder="Nombre de la actividad"
                    />
                    <input
                      type="text"
                      value={editValues.descripcion}
                      onChange={(event) => setEditValue("descripcion", event.target.value)}
                      className={inputClass}
                      placeholder="Descripción"
                    />
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Tarifa por tipo de silla
                      </p>
                      {tarifasEditor}
                    </div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={editValues.activo}
                        onChange={(event) => setEditValue("activo", event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      Activo
                    </label>
                    {renderEditActions(concepto._id)}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">{concepto.nombre}</span>
                      {statusBadge(concepto.activo)}
                    </div>
                    {concepto.descripcion ? (
                      <p className="text-sm text-slate-500">{concepto.descripcion}</p>
                    ) : null}
                    <p className="text-xs text-slate-500">
                      Tarifas: {resumenTarifas(concepto.tarifas)}
                    </p>
                    {renderActions(concepto)}
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
                  <th className="py-2 pr-4">Actividad</th>
                  <th className="py-2 pr-4">Descripción</th>
                  <th className="py-2 pr-4">Tarifas (por tipo de silla)</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {conceptos.map((concepto) => (
                  <tr key={concepto._id} className="border-b border-slate-100 align-top">
                    {editingId === concepto._id ? (
                      <>
                        <td className="py-2 pr-4">
                          <input
                            type="text"
                            value={editValues.nombre}
                            onChange={(event) => setEditValue("nombre", event.target.value)}
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
                        <td className="py-2 pr-4 min-w-[18rem]">{tarifasEditor}</td>
                        <td className="py-2 pr-4">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <input
                              type="checkbox"
                              checked={editValues.activo}
                              onChange={(event) => setEditValue("activo", event.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                            Activo
                          </label>
                        </td>
                        <td className="py-2 pr-4">{renderEditActions(concepto._id)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pr-4 font-medium text-slate-800">{concepto.nombre}</td>
                        <td className="py-2 pr-4 text-slate-600">{concepto.descripcion || "—"}</td>
                        <td className="py-2 pr-4 text-slate-600">{resumenTarifas(concepto.tarifas)}</td>
                        <td className="py-2 pr-4">{statusBadge(concepto.activo)}</td>
                        <td className="py-2 pr-4">{renderActions(concepto)}</td>
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
          title="Eliminar actividad"
          message={`¿Seguro que deseas eliminar "${pendingDelete.nombre}"? Se desactivará y dejará de aparecer al capturar actividades, pero los registros ya capturados con esta actividad se conservan.`}
          confirmLabel="Eliminar"
          confirming={savingId === pendingDelete._id}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
};

export default ConceptosActividadTable;
