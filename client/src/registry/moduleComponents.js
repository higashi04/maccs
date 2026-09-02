import CreateUser from "../pages/User/CreateUser";
import Modules from "../pages/Modules/Modules";
import Profiles from "../pages/Profiles/Profiles";
import JornalerosCatalaogue from "../pages/JornalerosCatalogue/JornalerosCatalogue";
import JornalerosActivities from "../pages/JornaleroActivities/JornaleroActivities";
import Viaticos from "../pages/Viaticos/Viaticos";
import OrdenesCompra from "../pages/OrdenesCompra/OrdenesCompra";
import ConceptosViatico from "../pages/ConceptosViatico/ConceptosViatico";

// Add every page a module can point to here, keyed by component name.
const moduleComponents = {
  CreateUser,
  Modules,
  Profiles,
  JornalerosCatalaogue,
  JornalerosActivities,
  Viaticos,
  OrdenesCompra,
  ConceptosViatico,
};

// Accepts either a plain key ("CreateUser") or a JSX-looking string
// ("<CreateUser />") and extracts the identifier — never evaluates it.
export function resolveModuleComponent(componente) {
  if (!componente) return null;
  const match = componente.match(/[A-Za-z_][A-Za-z0-9_]*/);
  const key = match ? match[0] : null;
  return key ? moduleComponents[key] || null : null;
}

export default moduleComponents;
