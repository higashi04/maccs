import { useMemo, useState } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faClockRotateLeft,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { deleteActividad } from "../../api/jornaleroActividadesApi";
import { ACTIVIDADES_CAMPOS } from "../../constants/actividadesCampos";
import ConfirmDialog from "../../components/ConfirmDialog";

const CAMPOS_PIEZAS = ACTIVIDADES_CAMPOS.filter(
  (campo) => campo.key !== "porDia" && campo.key !== "porHora"
);

const totalPiezas = (actividad) =>
  CAMPOS_PIEZAS.reduce((total, campo) => total + (Number(actividad[campo.key]) || 0), 0);

const formatFecha = (fecha) => (fecha ? new Date(fecha).toLocaleDateString("es-MX") : "-");

/**
 * Historial de actividades diarias registradas, filtrable por jornalero.
 * Cada registro puede expandirse para ver el detalle de cada actividad capturada.
 * @param {{
 *   actividades: Array<Object>,
 *   loading: boolean,
 *   error: string,
 *   jornaleroOptions: Array<{ value: string, label: string }>,
 *   jornaleroFiltro: string|null,
 *   onFiltroChange: (jornaleroId: string|null) => void,
 *   onDeleted: (actividadId: string) => void,
 * }} props
 */
const ActividadesTable = ({
  actividades,
  loading,
  error,
  jornaleroOptions,
  jornaleroFiltro,
  onFiltroChange,
  onDeleted,
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState("");

  const filtroValue = useMemo(
    () => jornaleroOptions.find((option) => option.value === jornaleroFiltro) || null,
    [jornaleroOptions, jornaleroFiltro]
  );

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete._id);
    setActionError("");
    try {
      await deleteActividad(pendingDelete._id);
      onDeleted(pendingDelete._id);
      setPendingDelete(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const renderDetalle = (actividad) => (
    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
      {ACTIVIDADES_CAMPOS.map((campo) => (
        <div key={campo.key} className="flex justify-between gap-2 text-slate-600">
          <span>{campo.label}</span>
          <span className="font-semibold text-slate-800">{actividad[campo.key] ?? 0}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/40 sm:p-6 lg:p-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-900 sm:text-2xl">
          <FontAwesomeIcon icon={faClockRotateLeft} className="text-sky-600" />
          Historial de actividades
        </h3>
        <div className="w-full sm:w-64">
          <Select
            inputId="filtroJornalero"
            options={jornaleroOptions}
            value={filtroValue}
            onChange={(selected) => onFiltroChange(selected ? selected.value : null)}
            isClearable
            placeholder="Filtrar por jornalero"
            noOptionsMessage={() => "No hay jornaleros"}
            classNames={{
              control: () =>
                "!rounded-lg !border-slate-300 !text-sm !shadow-none focus-within:!border-sky-500 focus-within:!ring-2 focus-within:!ring-sky-500",
            }}
          />
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
        <p className="text-slate-500">Aún no hay actividades registradas.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {actividades.map((actividad) => (
            <div key={actividad._id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">
                    {actividad.jornalero?.nombre || "Jornalero eliminado"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatFecha(actividad.fecha)}
                    {actividad.modelo ? ` · ${actividad.modelo}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Piezas</p>
                    <p className="font-semibold text-slate-800">{totalPiezas(actividad)}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpanded(actividad._id)}
                    className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
                    title="Ver detalle"
                  >
                    <FontAwesomeIcon icon={expandedId === actividad._id ? faChevronUp : faChevronDown} />
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === actividad._id}
                    onClick={() => setPendingDelete(actividad)}
                    className="rounded-lg bg-red-50 px-2 py-1.5 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Eliminar"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              {expandedId === actividad._id ? (
                <div className="mt-3">{renderDetalle(actividad)}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {pendingDelete ? (
        <ConfirmDialog
          title="Eliminar registro"
          message={`¿Seguro que deseas eliminar el registro de actividades de "${
            pendingDelete.jornalero?.nombre || "este jornalero"
          }" del ${formatFecha(pendingDelete.fecha)}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          confirming={deletingId === pendingDelete._id}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
};

export default ActividadesTable;
