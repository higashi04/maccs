import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { getViaticos } from "../../api/viaticosApi";
import { getOrdenesCompra } from "../../api/ordenesCompraApi";
import { getConceptosViatico } from "../../api/conceptosViaticoApi";
import ViaticosForm from "./ViaticosForm";
import ViaticosTable from "./ViaticosTable";

const TABS = [
  { id: "capturar", label: "Capturar", icon: faReceipt },
  { id: "registrados", label: "Registrados", icon: faListCheck },
];

/**
 * Página de viáticos: captura masiva de viáticos ligados a una orden de compra
 * (usando el catálogo de conceptos) y consulta/edición de los ya registrados.
 */
const Viaticos = () => {
  const [activeTab, setActiveTab] = useState("capturar");

  const [ordenes, setOrdenes] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const [viaticos, setViaticos] = useState([]);
  const [filterOrden, setFilterOrden] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  /**
   * Carga las órdenes de compra activas y el catálogo de conceptos activos.
   */
  const loadCatalogos = async () => {
    setCatalogLoading(true);
    setCatalogError("");
    try {
      const [ordenesData, conceptosData] = await Promise.all([
        getOrdenesCompra(),
        getConceptosViatico(),
      ]);
      setOrdenes(ordenesData);
      setConceptos(conceptosData);
    } catch (error) {
      setCatalogError(error.message);
    } finally {
      setCatalogLoading(false);
    }
  };

  /**
   * Carga los viáticos, opcionalmente filtrados por orden de compra.
   * @param {string} ordenId - id de la orden por la que filtrar (vacío = todas).
   */
  const loadViaticos = async (ordenId) => {
    setListLoading(true);
    setListError("");
    try {
      const data = await getViaticos(ordenId ? { ordenCompra: ordenId } : {});
      setViaticos(data);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogos();
  }, []);

  useEffect(() => {
    loadViaticos(filterOrden);
  }, [filterOrden]);

  /**
   * Tras registrar viáticos, refresca la lista y cambia a la pestaña de consulta.
   */
  const handleCreated = async () => {
    await loadViaticos(filterOrden);
    setActiveTab("registrados");
  };

  /**
   * Reemplaza un viático en la lista local con su versión actualizada.
   * @param {Object} viaticoActualizado
   */
  const updateViaticoInList = (viaticoActualizado) => {
    setViaticos((prev) =>
      prev.map((viatico) =>
        viatico._id === viaticoActualizado._id ? viaticoActualizado : viatico
      )
    );
  };

  /**
   * Quita un viático de la lista local tras su baja.
   * @param {string} viaticoId
   */
  const removeViaticoFromList = (viaticoId) => {
    setViaticos((prev) => prev.filter((viatico) => viatico._id !== viaticoId));
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
        {activeTab === "capturar" ? (
          <ViaticosForm
            ordenes={ordenes}
            conceptos={conceptos}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
            onCreated={handleCreated}
          />
        ) : (
          <ViaticosTable
            viaticos={viaticos}
            conceptos={conceptos}
            ordenes={ordenes}
            loading={listLoading}
            error={listError}
            filterOrden={filterOrden}
            onFilterChange={setFilterOrden}
            onViaticoUpdated={updateViaticoInList}
            onViaticoRemoved={removeViaticoFromList}
          />
        )}
      </div>
    </div>
  );
};

export default Viaticos;
