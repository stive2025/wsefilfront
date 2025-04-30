/* eslint-disable react/prop-types */
// src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';

const ProtectedRoute = ({ requiredAbilities = [], redirectTo = '/login' }) => {
  const { user, loading, initialCheckDone, hasAnyAbility } = useAuth();

  if (!initialCheckDone || loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredAbilities.length > 0 && !hasAnyAbility(requiredAbilities)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
export default ProtectedRoute;