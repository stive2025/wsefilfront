/* eslint-disable react/prop-types */
import { useAuth } from '../../contexts/authContext';

const AbilityGuard = ({ 
  children, 
  abilities = [], 
  requireAll = false, 
  fallback = null 
}) => {
  const { hasAnyAbility, hasAllAbilities, loading } = useAuth();

  if (loading) return null;
  if (!abilities.length) return children;

  const hasPermission = requireAll 
    ? hasAllAbilities(abilities) 
    : hasAnyAbility(abilities);

  return hasPermission ? children : fallback;
};

export default AbilityGuard;