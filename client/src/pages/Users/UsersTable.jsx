import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faUsers } from "@fortawesome/free-solid-svg-icons";
import { resetUserPassword } from "../../api/usersApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import TempPasswordModal from "./TempPasswordModal";

/**
 * Lista de usuarios con la acción de restablecer contraseña. Al confirmar, el servidor
 * genera una contraseña temporal que se muestra una sola vez.
 * En pantallas pequeñas se muestra como tarjetas en vez de tabla.
 * @param {{
 *   users: Array<Object>,
 *   loading: boolean,
 *   error: string,
 *   onUserUpdated: (userId: string) => void,
 * }} props
 */
const UsersTable = ({ users, loading, error, onUserUpdated }) => {
  const { user: currentUser } = useAuth();
  const [pendingReset, setPendingReset] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [tempResult, setTempResult] = useState(null);

  /**
   * Solicita al servidor restablecer la contraseña del usuario seleccionado.
   */
  const confirmReset = async () => {
    if (!pendingReset) return;
    setResetting(true);
    setActionError("");
    try {
      const result = await resetUserPassword(pendingReset._id);
      setTempResult(result);
      onUserUpdated(pendingReset._id);
      setPendingReset(null);
    } catch (err) {
      setActionError(err.message);
      setPendingReset(null);
    } finally {
      setResetting(false);
    }
  };

  const isSelf = (user) => String(user._id) === String(currentUser?.id || currentUser?._id);

  const pendingBadge = (user) =>
    user.mustChangePassword ? (
      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
        Pendiente de cambio
      </span>
    ) : null;

  const renderAction = (user) =>
    isSelf(user) ? (
      <span className="text-xs text-slate-400">Tu cuenta</span>
    ) : (
      <button
        type="button"
        onClick={() => setPendingReset(user)}
        className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
        title="Restablecer contraseña"
      >
        <FontAwesomeIcon icon={faKey} />
        Restablecer
      </button>
    );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/40 sm:p-6 lg:max-w-5xl lg:p-8 xl:max-w-6xl">
      <h3 className="mb-1 flex items-center gap-2 text-xl font-semibold text-slate-900 sm:text-2xl">
        <FontAwesomeIcon icon={faUsers} className="text-sky-600" />
        Usuarios
      </h3>
      <p className="mb-4 text-sm text-slate-500">
        Restablece la contraseña de un usuario que no puede ingresar. Se generará una contraseña
        temporal que deberá cambiar en su siguiente inicio de sesión.
      </p>

      {actionError ? (
        <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Cargando usuarios...</p>
      ) : error ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-700">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-slate-500">No hay usuarios registrados.</p>
      ) : (
        <>
          {/* Vista de tarjetas para pantallas pequeñas */}
          <div className="flex flex-col gap-3 md:hidden">
            {users.map((user) => (
              <div key={user._id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800">{user.username}</span>
                  {pendingBadge(user)}
                </div>
                <p className="break-all text-sm text-slate-500">{user.email}</p>
                <p className="text-sm text-slate-500">Perfil: {user.perfil?.nombrePerfil || "—"}</p>
                <div className="flex justify-end">{renderAction(user)}</div>
              </div>
            ))}
          </div>

          {/* Vista de tabla para pantallas medianas en adelante */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4">Usuario</th>
                  <th className="py-2 pr-4">Correo</th>
                  <th className="py-2 pr-4">Perfil</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-800">{user.username}</td>
                    <td className="py-2 pr-4 text-slate-600">{user.email}</td>
                    <td className="py-2 pr-4 text-slate-600">{user.perfil?.nombrePerfil || "—"}</td>
                    <td className="py-2 pr-4">{pendingBadge(user)}</td>
                    <td className="py-2 pr-4 text-right">{renderAction(user)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pendingReset ? (
        <ConfirmDialog
          title="Restablecer contraseña"
          message={`¿Restablecer la contraseña de "${pendingReset.username}"? Su contraseña actual dejará de funcionar y se generará una temporal que deberá cambiar al iniciar sesión.`}
          confirmLabel="Restablecer"
          confirming={resetting}
          onConfirm={confirmReset}
          onCancel={() => setPendingReset(null)}
        />
      ) : null}

      {tempResult ? (
        <TempPasswordModal
          username={tempResult.username}
          email={tempResult.email}
          tempPassword={tempResult.tempPassword}
          onClose={() => setTempResult(null)}
        />
      ) : null}
    </div>
  );
};

export default UsersTable;
