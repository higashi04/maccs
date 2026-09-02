import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faReceipt, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { createViaticos } from "../../api/viaticosApi";

/**
 * Devuelve la fecha de hoy en formato `YYYY-MM-DD` para inputs de tipo date.
 * @returns {string}
 */
const hoy = () => new Date().toISOString().slice(0, 10);

/**
 * Crea una fila vacía de captura de viático.
 * @returns {{ concepto: string, monto: string, fecha: string, descripcion: string }}
 */
const filaVacia = () => ({ concepto: "", monto: "", fecha: hoy(), descripcion: "" });

const formatMonto = (monto) =>
  Number(monto || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

/**
 * Formulario de captura masiva de viáticos: liga N viáticos a una orden de compra
 * en un solo envío, tomando los conceptos del catálogo.
 * @param {{
 *   ordenes: Array<Object>,
 *   conceptos: Array<Object>,
 *   catalogLoading: boolean,
 *   catalogError: string,
 *   onCreated: (viaticos: Array<Object>) => void,
 * }} props
 */
const ViaticosForm = ({ ordenes, conceptos, catalogLoading, catalogError, onCreated }) => {
  const [ordenCompra, setOrdenCompra] = useState("");
  const [filas, setFilas] = useState([filaVacia()]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const total = useMemo(
    () => filas.reduce((suma, fila) => suma + (Number(fila.monto) || 0), 0),
    [filas]
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
   * Valida y envía la captura masiva de viáticos.
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!ordenCompra) {
      setMessage({ type: "error", text: "Selecciona una orden de compra" });
      return;
    }

    const filasValidas = filas.filter((fila) => fila.concepto && Number(fila.monto) > 0);
    if (filasValidas.length === 0) {
      setMessage({ type: "error", text: "Captura al menos un viático con concepto y monto" });
      return;
    }

    const payload = filasValidas.map((fila) => ({
      concepto: fila.concepto,
      monto: Number(fila.monto),
      ...(fila.fecha ? { fecha: fila.fecha } : {}),
      ...(fila.descripcion.trim() ? { descripcion: fila.descripcion.trim() } : {}),
    }));

    setSubmitting(true);
    try {
      const creados = await createViaticos(ordenCompra, payload);
      setMessage({
        type: "success",
        text: `${creados.length} viático(s) registrado(s) correctamente`,
      });
      setFilas([filaVacia()]);
      onCreated?.(creados);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8 lg:max-w-5xl xl:max-w-6xl">
      <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
        <FontAwesomeIcon icon={faReceipt} className="text-sky-600" />
        Capturar viáticos
      </h2>
      <p className="mb-6 text-slate-500">
        Selecciona una orden de compra y agrega los viáticos que quieras ligar a ella.
      </p>

      {catalogError ? (
        <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {catalogError}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 font-semibold text-slate-700 lg:max-w-md">
          Orden de compra
          <select
            value={ordenCompra}
            onChange={(event) => setOrdenCompra(event.target.value)}
            required
            disabled={catalogLoading}
            className={selectClass}
          >
            <option value="">
              {catalogLoading ? "Cargando órdenes..." : "Selecciona una orden"}
            </option>
            {ordenes.map((orden) => (
              <option key={orden._id} value={orden._id}>
                {orden.ordenCompra}
                {orden.modeloSillas ? ` — ${orden.modeloSillas}` : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-4">
          {filas.map((fila, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Viático {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => quitarFila(index)}
                  disabled={filas.length === 1}
                  className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Quitar viático"
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 lg:col-span-4">
                  Concepto
                  <select
                    value={fila.concepto}
                    onChange={(event) => setFila(index, "concepto", event.target.value)}
                    disabled={catalogLoading}
                    className={selectClass}
                  >
                    <option value="">Selecciona un concepto</option>
                    {conceptos.map((concepto) => (
                      <option key={concepto._id} value={concepto._id}>
                        {concepto.TipoViatico}
                        {concepto.nombre ? ` — ${concepto.nombre}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 lg:col-span-2">
                  Monto
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={fila.monto}
                    onChange={(event) => setFila(index, "monto", event.target.value)}
                    className={selectClass}
                    placeholder="0.00"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 lg:col-span-3">
                  Fecha
                  <input
                    type="date"
                    value={fila.fecha}
                    onChange={(event) => setFila(index, "fecha", event.target.value)}
                    className={selectClass}
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 lg:col-span-3">
                  <span className="flex items-baseline gap-1">
                    Descripción
                    <span className="font-normal text-slate-400">Opcional</span>
                  </span>
                  <input
                    type="text"
                    value={fila.descripcion}
                    onChange={(event) => setFila(index, "descripcion", event.target.value)}
                    className={selectClass}
                    placeholder="Detalle del gasto"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={agregarFila}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
        >
          <FontAwesomeIcon icon={faPlus} />
          Agregar viático
        </button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
          <div className="flex items-center justify-between gap-6 rounded-lg bg-slate-50 px-4 py-3 lg:flex-1">
            <span className="text-sm font-semibold text-slate-500">Total a registrar</span>
            <span className="text-lg font-bold text-slate-800">{formatMonto(total)}</span>
          </div>

          <button
            type="submit"
            disabled={submitting || catalogLoading}
            className="rounded-lg bg-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none lg:shrink-0 lg:px-8"
          >
            {submitting ? "Registrando..." : "Registrar viáticos"}
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

export default ViaticosForm;
