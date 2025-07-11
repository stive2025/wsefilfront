/* eslint-disable react/prop-types */
// src/components/auth/ProtectedRoute.jsx (corrección rápida)
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ requiredAbilities = [], redirectTo = '/login' }) => {
  const { user, loading, initialCheckDone, hasAnyAbility } = useAuth();

  // Log para depuración
  // useEffect(() => {
    // console.log("ProtectedRoute - Estado:", {
    //   user: !!user,
    //   userDetails: user ? {
    //     name: user.name,
    //     abilities: user.abilities ? user.abilities.length : 0
    //   } : null,
    //   loading,
    //   initialCheckDone,
    //   requiredAbilities,
    //   requiereAbilitiesLength: requiredAbilities.length,
    //   // CORRECCIÓN: No intentar llamar hasAnyAbility si user es null
    //   userHasAbility: user && requiredAbilities.length > 0 ? hasAnyAbility(requiredAbilities) : 'N/A'
    // });
  // }, [user, loading, initialCheckDone, requiredAbilities, hasAnyAbility]);

  if (!initialCheckDone || loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // CORRECCIÓN: Si no hay abilities requeridas, permitir acceso directamente
  if (requiredAbilities.length === 0) {
    return <Outlet />;
  }

  if (!hasAnyAbility(requiredAbilities)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;