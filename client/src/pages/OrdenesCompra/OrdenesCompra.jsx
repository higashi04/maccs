import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCirclePlus, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import { getAllOrdenesCompra } from "../../api/ordenesCompraApi";
import OrdenCompraForm from "./OrdenCompraForm";
import OrdenesCompraTable from "./OrdenesCompraTable";
import OrdenCompraDetalleModal from "./OrdenCompraDetalleModal";

const TABS = [
  { id: "ordenes", label: "Órdenes", icon: faFileInvoiceDollar },
  { id: "registrar", label: "Registrar", icon: faFileCirclePlus },
];

/**
 * Página de órdenes de compra: permite registrar nuevas órdenes,
 * consultarlas y gestionar su folio, monto esperado y estado.
 */
const OrdenesCompra = () => {
  const [activeTab, setActiveTab] = useState("ordenes");
  const [ordenes, setOrdenes] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [detalleOrden, setDetalleOrden] = useState(null);

  const loadOrdenes = async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await getAllOrdenesCompra();
      setOrdenes(data);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadOrdenes();
  }, []);

  const handleCreated = async () => {
    await loadOrdenes();
    setActiveTab("ordenes");
  };

  const updateOrdenInList = (ordenActualizada) => {
    setOrdenes((prev) =>
      prev.map((orden) => (orden._id === ordenActualizada._id ? ordenActualizada : orden))
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
          <OrdenCompraForm onCreated={handleCreated} />
        ) : (
          <OrdenesCompraTable
            ordenes={ordenes}
            loading={listLoading}
            error={listError}
            onOrdenUpdated={updateOrdenInList}
            onVerDetalle={setDetalleOrden}
          />
        )}
      </div>

      {detalleOrden ? (
        <OrdenCompraDetalleModal
          orden={detalleOrden}
          onClose={() => setDetalleOrden(null)}
        />
      ) : null}
    </div>
  );
};

export default OrdenesCompra;
