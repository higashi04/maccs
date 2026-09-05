import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faHammer, faLock } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await login(formData.email, formData.password);
      navigate("/", { replace: true });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-sky-100 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-slate-400/20 sm:p-8">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-xl text-white shadow-lg shadow-sky-950/30">
          <FontAwesomeIcon icon={faHammer} />
        </span>
        <h2 className="mb-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Iniciar sesión</h2>
        <p className="mb-6 text-slate-500">Ingresa tus credenciales para continuar.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <Link to="/forgot-password" className="self-end text-sm text-sky-600 hover:text-sky-700 font-semibold">
            ¿Olvidaste tu contraseña?
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {message.text ? (
          <p className="mt-4 px-3 py-2 rounded-lg font-semibold bg-red-100 text-red-700">
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default Login;
