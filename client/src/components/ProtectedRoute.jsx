import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ModulesProvider } from "../context/ModulesContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-sky-100">
        <p className="font-semibold text-slate-600">Cargando...</p>
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
