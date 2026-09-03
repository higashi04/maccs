import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHammer, faListCheck } from "@fortawesome/free-solid-svg-icons";
import { getAllConceptosActividad } from "../../api/conceptosActividadApi";
import ConceptoActividadForm from "./ConceptoActividadForm";
import ConceptosActividadTable from "./ConceptosActividadTable";

const TABS = [
  { id: "registrar", label: "Registrar", icon: faHammer },
  { id: "catalogo", label: "Catálogo", icon: faListCheck },
];

/**
 * Página del catálogo de actividades de jornaleros: permite registrar nuevas
 * actividades y editar/dar de baja las existentes.
 */
const ConceptosActividad = () => {
  const [activeTab, setActiveTab] = useState("registrar");
  const [conceptos, setConceptos] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  /**
   * Carga el catálogo completo (activas e inactivas) desde el servidor.
   */
  const loadConceptos = async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await getAllConceptosActividad();
      setConceptos(data);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadConceptos();
  }, []);

  /**
   * Refresca la lista tras crear una actividad y cambia a la pestaña del catálogo.
   */
  const handleCreated = async () => {
    await loadConceptos();
    setActiveTab("catalogo");
  };

  /**
   * Reemplaza una actividad en la lista local con su versión actualizada.
   * @param {Object} conceptoActualizado
   */
  const updateConceptoInList = (conceptoActualizado) => {
    setConceptos((prev) =>
      prev.map((concepto) =>
        concepto._id === conceptoActualizado._id ? conceptoActualizado : concepto
      )
    );
  };

  return (
    <div>
      <div className="mx-auto flex w-full max-w-3xl gap-1 overflow-x-auto border-b border-slate-200 sm:gap-2 lg:max-w-5xl xl:max-w-6xl">
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
          <ConceptoActividadForm onCreated={handleCreated} />
        ) : (
          <ConceptosActividadTable
            conceptos={conceptos}
            loading={listLoading}
            error={listError}
            onConceptoUpdated={updateConceptoInList}
          />
        )}
      </div>
    </div>
  );
};

export default ConceptosActividad;
