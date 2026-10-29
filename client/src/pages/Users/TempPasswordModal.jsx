import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faKey } from "@fortawesome/free-solid-svg-icons";

/**
 * Modal que muestra una sola vez la contraseña temporal generada para un usuario.
 * @param {{
 *   username: string,
 *   email: string,
 *   tempPassword: string,
 *   onClose: () => void,
 * }} props
 */
const TempPasswordModal = ({ username, email, tempPassword, onClose }) => {
  const [copied, setCopied] = useState(false);

  /**
   * Copia la contraseña temporal al portapapeles.
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <FontAwesomeIcon icon={faKey} />
          </span>
          <h3 className="text-lg font-semibold text-slate-900">Contraseña temporal generada</h3>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          Entrega esta contraseña a <span className="font-semibold">{username}</span> ({email}). Se
          muestra una sola vez y deberá cambiarla al iniciar sesión.
        </p>

        <div className="mb-4 flex items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-lg bg-slate-100 px-3 py-3 text-center font-mono text-lg font-bold tracking-wider text-slate-900">
            {tempPassword}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-sky-600 px-3 py-3 text-white transition hover:bg-sky-700"
            title="Copiar"
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TempPasswordModal;
