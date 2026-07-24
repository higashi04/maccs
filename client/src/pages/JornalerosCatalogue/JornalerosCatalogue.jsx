import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUsers } from "@fortawesome/free-solid-svg-icons";
import { getAllJornaleros } from "../../api/jornalerosApi";
import JornaleroForm from "./JornaleroForm";
import JornalerosTable from "./JornalerosTable";
import PrestamosModal from "./PrestamosModal";

const TABS = [
  { id: "registrar", label: "Registrar", icon: faUserPlus },
  { id: "jornaleros", label: "Jornaleros", icon: faUsers },
];

/**
 * Página de catálogo de jornaleros: permite registrar nuevos jornaleros,
 * consultar los activos y gestionar sus préstamos.
 */
const JornalerosCatalaogue = () => {
  const [activeTab, setActiveTab] = useState("registrar");
  const [jornaleros, setJornaleros] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [selectedJornalero, setSelectedJornalero] = useState(null);

  const loadJornaleros = async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await getAllJornaleros();
      setJornaleros(data);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadJornaleros();
  }, []);

  const handleCreated = async () => {
    await loadJornaleros();
    setActiveTab("jornaleros");
  };

  const updateJornaleroInList = (jornaleroActualizado) => {
    setJornaleros((prev) =>
      prev.map((jornalero) =>
        jornalero._id === jornaleroActualizado._id ? jornaleroActualizado : jornalero
      )
    );
  };

  const handlePrestamosUpdated = (jornaleroActualizado) => {
    updateJornaleroInList(jornaleroActualizado);
    setSelectedJornalero(jornaleroActualizado);
  };

  return (
    <div>
      <div className="mx-auto flex w-full max-w-3xl gap-1 overflow-x-auto border-b border-slate-200 sm:gap-2">
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
          <JornaleroForm onCreated={handleCreated} />
        ) : (
          <JornalerosTable
            jornaleros={jornaleros}
            loading={listLoading}
            error={listError}
            onManagePrestamos={setSelectedJornalero}
            onJornaleroUpdated={updateJornaleroInList}
          />
        )}
      </div>

      {selectedJornalero ? (
        <PrestamosModal
          jornalero={selectedJornalero}
          onClose={() => setSelectedJornalero(null)}
          onUpdated={handlePrestamosUpdated}
        />
      ) : null}
    </div>
  );
};

export default JornalerosCatalaogue;
