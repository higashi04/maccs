import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ModulesContext = createContext(null);

export function ModulesProvider({ children }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/modules/read");
      if (!response.ok) {
        throw new Error("No se pudieron cargar los módulos");
      }
      const data = await response.json();
      setModules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return (
    <ModulesContext.Provider value={{ modules, loading, error, refresh: fetchModules }}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error("useModules must be used within a ModulesProvider");
  }
  return context;
}
