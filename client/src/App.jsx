import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ModulesProvider } from "./context/ModulesContext";
import AppLayout from "./layout/AppLayout";
import Modules from "./pages/Modules/Modules";
import CreateUser from "./pages/User/CreateUser";
import DynamicModulePage from "./pages/DynamicModule/DynamicModulePage";

function App() {
  return (
    <ModulesProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/modules/create" replace />} />
            <Route path="/modules/create" element={<Modules />} />
            <Route path="/users/create" element={<CreateUser />} />
            <Route path="*" element={<DynamicModulePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ModulesProvider>
  );
}

export default App;