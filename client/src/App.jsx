import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import Login from "./pages/Login/Login";
import Modules from "./pages/Modules/Modules";
import CreateUser from "./pages/User/CreateUser";
import Profiles from "./pages/Profiles/Profiles";
import DynamicModulePage from "./pages/DynamicModule/DynamicModulePage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/modules/create" replace />} />
              <Route path="/modules/create" element={<Modules />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/profiles/create" element={<Profiles />} />
              <Route path="*" element={<DynamicModulePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;