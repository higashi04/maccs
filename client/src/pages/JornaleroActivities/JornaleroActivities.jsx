import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { getJornaleros } from "../../api/jornalerosApi";
import { getOrdenesCompra } from "../../api/ordenesCompraApi";
import { getActividades } from "../../api/jornaleroActividadesApi";
import ActividadForm from "./ActividadForm";
import ActividadesTable from "./ActividadesTable";

const TABS = [
  { id: "registrar", label: "Registrar", icon: faClipboardList },
  { id: "historial", label: "Historial", icon: faClockRotateLeft },
];

/**
 * Construye la etiqueta de una orden de compra para los selects.
 * @param {Object} orden
 * @returns {string}
 */
const ordenLabel = (orden) =>
  orden.modeloSillas ? `${orden.ordenCompra} — ${orden.modeloSillas}` : orden.ordenCompra;

/**
 * Página de registro diario de actividades: permite seleccionar un jornalero activo
 * y una orden de compra, capturar el avance del día y consultar el historial.
 */
const JornaleroActivities = () => {
  const [activeTab, setActiveTab] = useState("registrar");
  const [jornaleros, setJornaleros] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [actividades, setActividades] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [jornaleroFiltro, setJornaleroFiltro] = useState(null);
  const [ordenFiltro, setOrdenFiltro] = useState(null);

  const jornaleroOptions = useMemo(
    () => jornaleros.map((jornalero) => ({ value: jornalero._id, label: jornalero.nombre })),
    [jornaleros]
  );

  const ordenCompraOptions = useMemo(
    () => ordenes.map((orden) => ({ value: orden._id, label: ordenLabel(orden) })),
    [ordenes]
  );

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [jornalerosData, ordenesData] = await Promise.all([
          getJornaleros(),
          getOrdenesCompra(),
        ]);
        setJornaleros(jornalerosData);
        setOrdenes(ordenesData);
      } catch (error) {
        setListError(error.message);
      } finally {
        setLoadingCatalogos(false);
      }
    };

    cargarCatalogos();
  }, []);

  /**
   * Carga el historial de actividades aplicando los filtros de jornalero y orden.
   * @param {{ jornalero: string|null, ordenCompra: string|null }} filtros
   */
  const loadActividades = async (filtros) => {
    setListLoading(true);
    setListError("");
    try {
      const data = await getActividades({
        jornalero: filtros.jornalero || undefined,
        ordenCompra: filtros.ordenCompra || undefined,
      });
      setActividades(data);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadActividades({ jornalero: jornaleroFiltro, ordenCompra: ordenFiltro });
  }, [jornaleroFiltro, ordenFiltro]);

  /**
   * Añade el registro recién creado al historial si encaja con los filtros activos.
   * @param {Object} actividad
   */
  const handleCreated = (actividad) => {
    const encajaJornalero = !jornaleroFiltro || jornaleroFiltro === actividad.jornalero?._id;
    const encajaOrden = !ordenFiltro || ordenFiltro === actividad.ordenCompra?._id;
    if (encajaJornalero && encajaOrden) {
      setActividades((prev) => [actividad, ...prev]);
    }
    setActiveTab("historial");
  };

  const handleDeleted = (actividadId) => {
    setActividades((prev) => prev.filter((actividad) => actividad._id !== actividadId));
  };

  return (
    <div>
      <div className="mx-auto flex w-full max-w-4xl gap-1 overflow-x-auto border-b border-slate-200 sm:gap-2 lg:max-w-5xl xl:max-w-6xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition sm:px-4 ${
              activeTab === tab.id
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FontAwesomeIcon icon={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "registrar" ? (
          <ActividadForm
            jornaleroOptions={jornaleroOptions}
            ordenCompraOptions={ordenCompraOptions}
            loadingCatalogos={loadingCatalogos}
            onCreated={handleCreated}
          />
        ) : (
          <ActividadesTable
            actividades={actividades}
            loading={listLoading}
            error={listError}
            jornaleroOptions={jornaleroOptions}
            ordenCompraOptions={ordenCompraOptions}
            jornaleroFiltro={jornaleroFiltro}
            ordenFiltro={ordenFiltro}
            onFiltroChange={setJornaleroFiltro}
            onOrdenFiltroChange={setOrdenFiltro}
            onDeleted={handleDeleted}
          />
        )}
      </div>
    </div>
  );
};

export default JornaleroActivities;
