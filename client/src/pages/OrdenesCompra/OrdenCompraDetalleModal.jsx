import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faHammer,
  faSackDollar,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getViaticosByOrden } from "../../api/viaticosApi";
import { getActividades } from "../../api/jornaleroActividadesApi";

const formatMonto = (monto) =>
  Number(monto || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const formatFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

/**
 * Etiqueta legible de un concepto de viático poblado desde el servidor.
 * @param {Object|string|null} concepto - concepto poblado (`{ TipoViatico, nombre }`) o su id.
 * @returns {string}
 */
const nombreConcepto = (concepto) => {
  if (!concepto || typeof concepto !== "object") return "Concepto";
  return concepto.nombre ? `${concepto.TipoViatico} — ${concepto.nombre}` : concepto.TipoViatico;
};

/**
 * Etiqueta legible de una actividad del catálogo poblada desde el servidor.
 * @param {Object|string|null} actividad - actividad poblada (`{ nombre, descripcion }`) o su id.
 * @returns {string}
 */
const nombreActividad = (actividad) => {
  if (!actividad || typeof actividad !== "object") return "Actividad";
  return actividad.descripcion ? `${actividad.nombre} — ${actividad.descripcion}` : actividad.nombre;
};

/**
 * Modal de detalle de una orden de compra: concentra los gastos (viáticos) y el
 * avance en trabajos (actividades de jornaleros) ligados a la orden por su id de Mongo.
 * @param {{ orden: Object, onClose: () => void }} props
 */
const OrdenCompraDetalleModal = ({ orden, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viaticos, setViaticos] = useState([]);
  const [actividades, setActividades] = useState([]);

  useEffect(() => {
    if (!orden?._id) return;

    let cancelado = false;
    const cargarDetalle = async () => {
      setLoading(true);
      setError("");
      try {
        const [viaticosData, actividadesData] = await Promise.all([
          getViaticosByOrden(orden._id),
          getActividades({ ordenCompra: orden._id }),
        ]);
        if (cancelado) return;
        setViaticos(viaticosData);
        setActividades(actividadesData);
      } catch (err) {
        if (!cancelado) setError(err.message);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargarDetalle();
    return () => {
      cancelado = true;
    };
  }, [orden?._id]);

  const totalGastado = useMemo(
    () => viaticos.reduce((suma, viatico) => suma + Number(viatico.monto || 0), 0),
    [viaticos]
  );

  const montoEsperado = Number(orden?.MontoEsperado || 0);

  /** Cantidades y salario agrupados por actividad del catálogo, más el total de mano de obra. */
  const avance = useMemo(() => {
    const acumulado = new Map();
    for (const act of actividades) {
      const id = act.actividad?._id || act.actividad || "sin-actividad";
      const label = nombreActividad(act.actividad);
      const previo = acumulado.get(id) || { key: id, label, cantidad: 0, salario: 0 };
      previo.cantidad += Number(act.cantidad) || 0;
      previo.salario += Number(act.salarioJornalero) || 0;
      acumulado.set(id, previo);
    }
    const porCampo = [...acumulado.values()].filter((campo) => campo.cantidad > 0);
    const totalManoObra = actividades.reduce(
      (suma, act) => suma + (Number(act.salarioJornalero) || 0),
      0
    );
    return { porCampo, totalManoObra };
  }, [actividades]);

  /** Restante del monto esperado tras descontar viáticos y mano de obra. */
  const restanteTrasManoObra = montoEsperado - totalGastado - avance.totalManoObra;

  /**
   * Porcentaje del monto esperado que representa el restante (0 si no hay monto esperado).
   * @type {number}
   */
  const restantePct = montoEsperado > 0 ? restanteTrasManoObra / montoEsperado : 0;

  /**
   * Semáforo del restante según su porcentaje del monto esperado:
   * verde > 50%, amarillo 35–50%, rojo < 35%.
   * @type {{ text: string, bg: string, border: string }}
   */
  const restanteTono =
    montoEsperado > 0 && restantePct >= 0.5
      ? { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" }
      : montoEsperado > 0 && restantePct >= 0.35
        ? { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
        : { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
          <div>
            <p className="font-mono text-sm font-semibold text-sky-600">{orden?.ordenCompra}</p>
            <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
              {orden?.modeloSillas || "Orden de compra"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {orden?.cantidadSillas ?? 0} sillas · Monto esperado {formatMonto(montoEsperado)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-600 transition hover:bg-slate-200"
            title="Cerrar"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <p className="text-slate-500">Cargando detalle de la orden...</p>
          ) : error ? (
            <p className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-700">{error}</p>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Scorecard: restante tras descontar viáticos y mano de obra */}
              <div className={`rounded-xl border p-4 ${restanteTono.border} ${restanteTono.bg}`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Restante tras mano de obra y viáticos
                    </p>
                    <p className={`text-2xl font-bold sm:text-3xl ${restanteTono.text}`}>
                      {formatMonto(restanteTrasManoObra)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p className={`text-sm font-semibold ${restanteTono.text}`}>
                      {montoEsperado > 0 ? `${Math.round(restantePct * 100)}% del monto esperado` : "Sin monto esperado"}
                    </p>
                    <p className="mt-0.5">
                      Esperado {formatMonto(montoEsperado)} · Viáticos {formatMonto(totalGastado)} · Mano de
                      obra {formatMonto(avance.totalManoObra)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gastos / viáticos */}
              <section>
                <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <FontAwesomeIcon icon={faSackDollar} className="text-sky-600" />
                  Gastos (viáticos)
                </h4>

                {viaticos.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay viáticos registrados para esta orden.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2 pr-4">Concepto</th>
                          <th className="py-2 pr-4">Fecha</th>
                          <th className="py-2 pr-4">Descripción</th>
                          <th className="py-2 pr-4 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viaticos.map((viatico) => (
                          <tr key={viatico._id} className="border-b border-slate-100">
                            <td className="py-2 pr-4 font-medium text-slate-800">
                              {nombreConcepto(viatico.concepto)}
                            </td>
                            <td className="py-2 pr-4 text-slate-600">{formatFecha(viatico.fecha)}</td>
                            <td className="py-2 pr-4 text-slate-600">{viatico.descripcion || "—"}</td>
                            <td className="py-2 pr-4 text-right font-semibold text-slate-800">
                              {formatMonto(viatico.monto)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Avance en trabajos / actividades */}
              <section>
                <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <FontAwesomeIcon icon={faHammer} className="text-sky-600" />
                  Avance en trabajos
                </h4>

                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Actividades capturadas</p>
                    <p className="text-lg font-bold text-slate-800">{actividades.length}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Sillas de la orden</p>
                    <p className="text-lg font-bold text-slate-800">{orden?.cantidadSillas ?? 0}</p>
                  </div>
                </div>

                {actividades.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay actividades de jornaleros registradas para esta orden.
                  </p>
                ) : (
                  <>
                    {avance.porCampo.length > 0 ? (
                      <div className="mb-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        {avance.porCampo.map((campo) => (
                          <div
                            key={campo.key}
                            className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-600"
                          >
                            <span>{campo.label}</span>
                            <span className="font-semibold text-slate-800">
                              {campo.cantidad} · {formatMonto(campo.salario)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="py-2 pr-4">Jornalero</th>
                            <th className="py-2 pr-4">Fecha</th>
                            <th className="py-2 pr-4">Actividad</th>
                            <th className="py-2 pr-4 text-right">Cantidad</th>
                            <th className="py-2 pr-4 text-right">Salario</th>
                          </tr>
                        </thead>
                        <tbody>
                          {actividades.map((actividad) => (
                            <tr key={actividad._id} className="border-b border-slate-100">
                              <td className="py-2 pr-4 font-medium text-slate-800">
                                {actividad.jornalero?.nombre || "Jornalero eliminado"}
                              </td>
                              <td className="py-2 pr-4 text-slate-600">
                                {formatFecha(actividad.fecha)}
                              </td>
                              <td className="py-2 pr-4 text-slate-600">
                                {nombreActividad(actividad.actividad)}
                              </td>
                              <td className="py-2 pr-4 text-right font-semibold text-slate-800">
                                {Number(actividad.cantidad) || 0}
                              </td>
                              <td className="py-2 pr-4 text-right font-semibold text-slate-800">
                                {formatMonto(actividad.salarioJornalero)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>

              {/* Balance de la orden: monto esperado menos viáticos y mano de obra */}
              <section>
                <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <FontAwesomeIcon icon={faSackDollar} className="text-sky-600" />
                  Balance de la orden
                </h4>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-slate-500">Monto esperado</span>
                    <span className="font-semibold text-slate-800">{formatMonto(montoEsperado)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-sm">
                    <span className="text-slate-500">− Viáticos</span>
                    <span className="font-semibold text-slate-800">{formatMonto(totalGastado)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-sm">
                    <span className="text-slate-500">− Mano de obra</span>
                    <span className="font-semibold text-slate-800">
                      {formatMonto(avance.totalManoObra)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-semibold text-slate-600">Restante tras mano de obra y viáticos</span>
                    <span className={`text-base font-bold ${restanteTono.text}`}>
                      {formatMonto(restanteTrasManoObra)}
                      {montoEsperado > 0 ? (
                        <span className="ml-2 text-xs font-semibold">
                          ({Math.round(restantePct * 100)}%)
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>
              </section>

              {/* Criterio pendiente de definir con el stakeholder */}
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="flex items-start gap-2 text-sm text-amber-800">
                  <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-amber-500" />
                  <span>
                    Pendiente de definir con el stakeholder: cuándo se considera que una orden está
                    lista para ser surtida al cliente.
                  </span>
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdenCompraDetalleModal;
