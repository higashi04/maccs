import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { getJornaleros } from "../../api/jornalerosApi";
import { getActividades } from "../../api/jornaleroActividadesApi";
import ActividadForm from "./ActividadForm";
import ActividadesTable from "./ActividadesTable";

const TABS = [
  { id: "registrar", label: "Registrar", icon: faClipboardList },
  { id: "historial", label: "Historial", icon: faClockRotateLeft },
];

/**
 * Página de registro diario de actividades: permite seleccionar un jornalero activo,
 * capturar el avance del día y consultar el historial de registros.
 */
const JornaleroActivities = () => {
  const [activeTab, setActiveTab] = useState("registrar");
  const [jornaleros, setJornaleros] = useState([]);
  const [loadingJornaleros, setLoadingJornaleros] = useState(true);
  const [actividades, setActividades] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [jornaleroFiltro, setJornaleroFiltro] = useState(null);

  const jornaleroOptions = useMemo(
    () => jornaleros.map((jornalero) => ({ value: jornalero._id, label: jornalero.nombre })),
    [jornaleros]
  );

  useEffect(() => {
    const cargarJornaleros = async () => {
      try {
        const data = await getJornaleros();
        setJornaleros(data);
      } catch (error) {
        setListError(error.message);
      } finally {
        setLoadingJornaleros(false);
      }
    };

    cargarJornaleros();
  }, []);

  const loadActividades = async (jornaleroId) => {
    setListLoading(true);
    setListError("");
    try {
      const data = await getActividades(jornaleroId || undefined);
      setActividades(data);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadActividades(jornaleroFiltro);
  }, [jornaleroFiltro]);

  const handleCreated = async (actividad) => {
    if (!jornaleroFiltro || jornaleroFiltro === actividad.jornalero?._id) {
      setActividades((prev) => [actividad, ...prev]);
    }
    setActiveTab("historial");
  };

  const handleDeleted = (actividadId) => {
    setActividades((prev) => prev.filter((actividad) => actividad._id !== actividadId));
  };

  return (
    <div>
      <div className="mx-auto flex w-full max-w-4xl gap-1 overflow-x-auto border-b border-slate-200 sm:gap-2">
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
            loadingJornaleros={loadingJornaleros}
            onCreated={handleCreated}
          />
        ) : (
          <ActividadesTable
            actividades={actividades}
            loading={listLoading}
            error={listError}
            jornaleroOptions={jornaleroOptions}
            jornaleroFiltro={jornaleroFiltro}
            onFiltroChange={setJornaleroFiltro}
            onDeleted={handleDeleted}
          />
        )}
      </div>
    </div>
  );
};

export default JornaleroActivities;
