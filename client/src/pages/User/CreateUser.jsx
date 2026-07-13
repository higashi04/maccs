import { useEffect, useState } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { apiFetch } from "../../utils/api";

function CreateUser() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    perfil: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await apiFetch("/api/perfiles/read");
        if (!response.ok) throw new Error("No se pudieron cargar los perfiles");
        const data = await response.json();
        setProfiles(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, []);

  const profileOptions = profiles.map((profile) => ({
    value: profile._id,
    label: profile.nombrePerfil,
  }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, perfil: selectedOption ? selectedOption.value : null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (formData.password !== formData.confirmPassword) {
      setLoading(false);
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    try {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          perfil: formData.perfil,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo crear el usuario");
      }

      setMessage({ type: "success", text: "Usuario creado correctamente" });
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        perfil: null,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-300 p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl p-8 shadow-xl">
        <h2 className="mb-2 text-3xl font-semibold text-slate-900">Crear usuario</h2>
        <p className="mb-6 text-slate-500">Registra un nuevo usuario en el sistema.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Usuario
            <div className="relative">
              <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Nombre de usuario"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Correo electrónico
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="usuario@correo.com"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Contraseña
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Confirmar contraseña
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </label>

          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Perfil
            <Select
              inputId="perfil"
              name="perfil"
              options={profileOptions}
              value={profileOptions.find((option) => option.value === formData.perfil) || null}
              onChange={handleProfileChange}
              isLoading={loadingProfiles}
              isClearable
              placeholder="Selecciona un perfil"
              noOptionsMessage={() => "No hay perfiles registrados"}
              classNames={{
                control: () =>
                  "!rounded-lg !border-slate-300 !text-sm !shadow-none focus-within:!border-sky-500 focus-within:!ring-2 focus-within:!ring-sky-500",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 px-4 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
          >
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </form>

        {message.text ? (
          <p
            className={`mt-4 px-3 py-2 rounded-lg font-semibold ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default CreateUser;
