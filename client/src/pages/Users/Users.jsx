import { useEffect, useState } from "react";
import { getUsers } from "../../api/usersApi";
import UsersTable from "./UsersTable";

/**
 * Página de gestión de usuarios: lista los usuarios y permite a quien tenga el módulo
 * restablecer su contraseña sin depender de soporte técnico.
 */
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Marca localmente al usuario como pendiente de cambio de contraseña tras restablecerla.
   * @param {string} userId
   */
  const markPendingChange = (userId) => {
    setUsers((prev) =>
      prev.map((user) => (user._id === userId ? { ...user, mustChangePassword: true } : user))
    );
  };

  return (
    <UsersTable users={users} loading={loading} error={error} onUserUpdated={markPendingChange} />
  );
};

export default Users;
