import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RotaProtegida = ({ children }) => {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RotaProtegida;
