import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ModulesProvider } from "../context/ModulesContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-300">
        <p className="text-slate-600 font-semibold">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ModulesProvider>
      <Outlet />
    </ModulesProvider>
  );
}

export default ProtectedRoute;
