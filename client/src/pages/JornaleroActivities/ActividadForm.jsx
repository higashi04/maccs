import { useMemo, useState } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faPlus,
  faTrashCan,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { createActividades } from "../../api/jornaleroActividadesApi";
import { tipoSillaLabel } from "../../constants/tiposSilla";

/**
 * Devuelve la fecha de hoy en formato `YYYY-MM-DD` para inputs de tipo date.
 * @returns {string}
 */
const hoy = () => new Date().toISOString().slice(0, 10);

/**
 * Crea una fila vacía de captura de actividad.
 * @returns {{ actividad: string, cantidad: string, descripcion: string }}
 */
const filaVacia = () => ({ actividad: "", cantidad: "", descripcion: "" });

const formatMonto = (monto) =>
  Number(monto || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const selectClassNames = {
  control: () =>
    "!rounded-lg !border-slate-300 !text-sm !shadow-none focus-within:!border-sky-500 focus-within:!ring-2 focus-within:!ring-sky-500",
};

/**
 * Formulario de captura masiva de actividades: liga N actividades de un jornalero
 * a una orden de compra en un solo envío, tomando las actividades del catálogo.
 * El salario se calcula con la tarifa del catálogo y el tipo de silla de la orden.
 * @param {{
 *   jornaleroOptions: Array<{ value: string, label: string }>,
 *   ordenCompraOptions: Array<{ value: string, label: string }>,
 *   ordenes: Array<Object>,
 *   conceptos: Array<Object>,
 *   loadingCatalogos: boolean,
 *   catalogError: string,
 *   onCreated: (actividades: Array<Object>) => void,
 * }} props
 */
const ActividadForm = ({
  jornaleroOptions,
  ordenCompraOptions,
  ordenes,
  conceptos,
  loadingCatalogos,
  catalogError,
  onCreated,
}) => {
  const [jornalero, setJornalero] = useState(null);
  const [ordenCompra, setOrdenCompra] = useState(null);
  const [fecha, setFecha] = useState(hoy());
  const [filas, setFilas] = useState([filaVacia()]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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

  const conceptoPorId = useMemo(
    () => new Map(conceptos.map((concepto) => [concepto._id, concepto])),
    [conceptos]
  );

  const ordenSeleccionada = useMemo(
    () => ordenes.find((orden) => orden._id === ordenCompra) || null,
    [ordenes, ordenCompra]
  );

  const tipoSilla = ordenSeleccionada?.tipoSilla || "";

  /**
   * Tarifa de una actividad para el tipo de silla de la orden seleccionada.
   * @param {string} actividadId
   * @returns {number}
   */
  const tarifaDe = (actividadId) => {
    if (!tipoSilla) return 0;
    return Number(conceptoPorId.get(actividadId)?.tarifas?.[tipoSilla]) || 0;
  };

  const salarioDia = useMemo(
    () =>
      filas.reduce((suma, fila) => {
        const cantidad = Number(fila.cantidad) || 0;
        return suma + cantidad * tarifaDe(fila.actividad);
      }, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filas, tipoSilla, conceptoPorId]
  );

  /**
   * Actualiza un campo de una fila concreta.
   * @param {number} index
   * @param {string} campo
   * @param {string} valor
   */
  const setFila = (index, campo, valor) => {
    setFilas((prev) => prev.map((fila, i) => (i === index ? { ...fila, [campo]: valor } : fila)));
  };

  const agregarFila = () => setFilas((prev) => [...prev, filaVacia()]);

  /**
   * Elimina una fila de captura; siempre deja al menos una.
   * @param {number} index
   */
  const quitarFila = (index) => {
    setFilas((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  /**
   * Valida y envía la captura masiva de actividades.
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!jornalero) {
      setMessage({ type: "error", text: "Selecciona un jornalero" });
      return;
    }
    if (!ordenCompra) {
      setMessage({ type: "error", text: "Selecciona una orden de compra" });
      return;
    }

    const filasValidas = filas.filter((fila) => fila.actividad && Number(fila.cantidad) > 0);
    if (filasValidas.length === 0) {
      setMessage({ type: "error", text: "Captura al menos una actividad con cantidad" });
      return;
    }

    const payload = filasValidas.map((fila) => ({
      actividad: fila.actividad,
      cantidad: Number(fila.cantidad),
      ...(fila.descripcion.trim() ? { descripcion: fila.descripcion.trim() } : {}),
    }));

    setSubmitting(true);
    try {
      const creadas = await createActividades(
        { jornalero, ordenCompra, ...(fecha ? { fecha } : {}) },
        payload
      );
      setMessage({
        type: "success",
        text: `${creadas.length} actividad(es) registrada(s) correctamente`,
      });
      setFilas([filaVacia()]);
      onCreated?.(creadas);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8 lg:max-w-5xl xl:max-w-6xl">
      <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
        <FontAwesomeIcon icon={faClipboardList} className="text-sky-600" />
        Registrar actividades
      </h2>
      <p className="mb-6 text-slate-500">
        Selecciona un jornalero y la orden de compra, luego agrega las actividades del día. El
        salario se calcula con la tarifa del catálogo según el tipo de silla de la orden.
      </p>

      {catalogError ? (
        <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {catalogError}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Jornalero
            <Select
              inputId="jornalero"
              options={jornaleroOptions}
              value={jornaleroOptions.find((option) => option.value === jornalero) || null}
              onChange={(selected) => setJornalero(selected ? selected.value : null)}
              isLoading={loadingCatalogos}
              isClearable
              placeholder="Selecciona un jornalero"
              noOptionsMessage={() => "No hay jornaleros activos"}
              classNames={selectClassNames}
            />
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Orden de compra
            <Select
              inputId="ordenCompra"
              options={ordenCompraOptions}
              value={ordenCompraOptions.find((option) => option.value === ordenCompra) || null}
              onChange={(selected) => setOrdenCompra(selected ? selected.value : null)}
              isLoading={loadingCatalogos}
              isClearable
              placeholder="Selecciona una orden"
              noOptionsMessage={() => "No hay órdenes de compra activas"}
              classNames={selectClassNames}
            />
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Fecha
            <input
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
              required
              className={inputClass}
            />
          </label>
        </div>

        {ordenSeleccionada ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <span className="font-semibold text-slate-500">Modelo:</span>
            <span className="text-slate-800">{ordenSeleccionada.modeloSillas || "—"}</span>
            <span className="font-semibold text-slate-500">Tipo de silla:</span>
            {tipoSilla ? (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
                {tipoSillaLabel(tipoSilla)} ({tipoSilla})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                sin tipo de silla — no se calculará salario
              </span>
            )}
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Actividades</h3>

          {filas.map((fila, index) => {
            const importe = (Number(fila.cantidad) || 0) * tarifaDe(fila.actividad);
            return (
              <div key={index} className="rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Actividad {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => quitarFila(index)}
                    disabled={filas.length === 1}
                    className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Quitar actividad"
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 lg:col-span-5">
                    Actividad
                    <Select
                      inputId={`actividad-${index}`}
                      options={conceptoOptions}
                      value={conceptoOptions.find((option) => option.value === fila.actividad) || null}
                      onChange={(selected) =>
                        setFila(index, "actividad", selected ? selected.value : "")
                      }
                      isLoading={loadingCatalogos}
                      isClearable
                      placeholder="Selecciona una actividad"
                      noOptionsMessage={() => "No hay actividades en el catálogo"}
                      classNames={selectClassNames}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 lg:col-span-2">
                    Cantidad
                    <input
                      type="number"
                      min="0"
                      value={fila.cantidad}
                      onChange={(event) => setFila(index, "cantidad", event.target.value)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </label>

                  <div className="flex flex-col gap-1 text-xs font-semibold text-slate-600 lg:col-span-2">
                    Importe
                    <span className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
                      {formatMonto(importe)}
                    </span>
                  </div>

                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 lg:col-span-3">
                    <span className="flex items-baseline gap-1">
                      Descripción
                      <span className="font-normal text-slate-400">Opcional</span>
                    </span>
                    <input
                      type="text"
                      value={fila.descripcion}
                      onChange={(event) => setFila(index, "descripcion", event.target.value)}
                      className={inputClass}
                      placeholder="Detalle de la actividad"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={agregarFila}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
        >
          <FontAwesomeIcon icon={faPlus} />
          Agregar actividad
        </button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
          <div className="flex items-center justify-between gap-6 rounded-lg bg-slate-50 px-4 py-3 lg:flex-1">
            <span className="text-sm font-semibold text-slate-500">Salario del día (estimado)</span>
            <span className="text-lg font-bold text-slate-800">{formatMonto(salarioDia)}</span>
          </div>

          <button
            type="submit"
            disabled={submitting || loadingCatalogos}
            className="rounded-lg bg-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none lg:shrink-0 lg:px-8"
          >
            {submitting ? "Registrando..." : "Registrar actividades"}
          </button>
        </div>
      </form>

      {message.text ? (
        <p
          className={`mt-4 rounded-lg px-3 py-2 font-semibold ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
};

export default ActividadForm;
