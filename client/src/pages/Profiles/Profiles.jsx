import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUsersGear } from "@fortawesome/free-solid-svg-icons";
import { getPerfiles } from "../../api/perfilesApi";
import ProfileForm from "./ProfileForm";
import ProfilesList from "./ProfilesList";
import EditProfileModal from "./EditProfileModal";

const TABS = [
  { id: "crear", label: "Crear", icon: faPlus },
  { id: "perfiles", label: "Perfiles", icon: faUsersGear },
];

/**
 * Página del módulo Perfiles: permite crear nuevos perfiles y editar los
 * existentes para agregar o quitar módulos.
 * @returns {JSX.Element}
 */
function Profiles() {
  const [activeTab, setActiveTab] = useState("crear");
  const [perfiles, setPerfiles] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [selectedPerfil, setSelectedPerfil] = useState(null);

  /**
   * Carga la lista de perfiles desde el servidor.
   */
  const loadPerfiles = async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await getPerfiles();
      setPerfiles(data);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadPerfiles();
  }, []);

  /**
   * Refresca la lista tras crear un perfil y cambia a la pestaña de perfiles.
   */
  const handleCreated = async () => {
    await loadPerfiles();
    setActiveTab("perfiles");
  };

  /**
   * Reemplaza en la lista el perfil actualizado.
   * @param {Object} perfilActualizado
   */
  const handleUpdated = (perfilActualizado) => {
    setPerfiles((prev) =>
      prev.map((perfil) =>
        perfil._id === perfilActualizado._id ? perfilActualizado : perfil
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
        {activeTab === "crear" ? (
          <ProfileForm onCreated={handleCreated} />
        ) : (
          <ProfilesList
            perfiles={perfiles}
            loading={listLoading}
            error={listError}
            onEdit={setSelectedPerfil}
          />
        )}
      </div>

      {selectedPerfil ? (
        <EditProfileModal
          perfil={selectedPerfil}
          onClose={() => setSelectedPerfil(null)}
          onUpdated={handleUpdated}
        />
      ) : null}
    </div>
  );
}

export default Profiles;
