import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faHammer } from "@fortawesome/free-solid-svg-icons";
import { requestPasswordReset } from "../../api/authApi";

/**
 * Página donde el usuario solicita un enlace para restablecer su contraseña.
 */
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const data = await requestPasswordReset(email);
      setMessage({ type: "success", text: data?.message || "Si el correo está registrado, se envia un enlace de restablecimiento." });
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
        <h2 className="mb-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Recuperar contraseña</h2>
        <p className="mb-6 text-slate-500">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 font-semibold text-slate-700">
            Correo electrónico
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="usuario@correo.com"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        {message.text ? (
          <p
            className={`mt-4 px-3 py-2 rounded-lg font-semibold ${
              message.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </p>
        ) : null}

        <Link to="/login" className="mt-6 block text-center text-sky-600 hover:text-sky-700 font-semibold">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
