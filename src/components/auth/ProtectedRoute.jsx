
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '/src/services/authService.js'; // Ajusta la ruta

const ProtectedRoute = () => {
  // Si el usuario está autenticado, muestra el componente hijo
  // Si no, redirige al login
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;