import CreateUser from "../pages/User/CreateUser";
import Modules from "../pages/Modules/Modules";

// Add every page a module can point to here, keyed by component name.
const moduleComponents = {
  CreateUser,
  Modules,
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
