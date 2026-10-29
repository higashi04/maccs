import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faHammer, faLock } from "@fortawesome/free-solid-svg-icons";
import { changePassword } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500";

/**
 * Pantalla obligatoria que se muestra cuando el usuario inició sesión con una contraseña
 * temporal. Bloquea el resto de la aplicación hasta que defina una contraseña nueva.
 */
function ChangePassword() {
  const { logout, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Envía el cambio de contraseña y, si es exitoso, actualiza el usuario en sesión
   * para liberar el acceso a la aplicación.
   * @param {import('react').FormEvent} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await changePassword(formData.currentPassword, formData.newPassword);
      updateUser(updatedUser);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const renderPasswordField = (name, label, placeholder) => (
    <label className="flex flex-col gap-2 font-semibold text-slate-700">
      {label}
      <div className="relative">
        <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          name={name}
          type={showPassword ? "text" : "password"}
          value={formData[name]}
          onChange={handleChange}
          required
          minLength={name === "currentPassword" ? undefined : 8}
          className={inputClass}
          placeholder={placeholder}
        />
        {name === "currentPassword" ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        ) : null}
      </div>
    </label>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-sky-100 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-slate-400/20 sm:p-8">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-xl text-white shadow-lg shadow-sky-950/30">
          <FontAwesomeIcon icon={faHammer} />
        </span>
        <h2 className="mb-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Cambia tu contraseña</h2>
        <p className="mb-6 text-slate-500">
          Ingresaste con una contraseña temporal. Define una nueva contraseña para continuar.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {renderPasswordField("currentPassword", "Contraseña temporal", "••••••••")}
          {renderPasswordField("newPassword", "Nueva contraseña", "Mínimo 8 caracteres")}
          {renderPasswordField("confirmPassword", "Confirmar nueva contraseña", "••••••••")}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-700">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={logout}
          className="mt-6 block w-full text-center font-semibold text-sky-600 hover:text-sky-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default ChangePassword;
