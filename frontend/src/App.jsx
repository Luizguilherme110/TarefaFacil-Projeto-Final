import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import RotaProtegida from './components/RotaProtegida';

// Páginas Públicas
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';

// Páginas Protegidas
import Dashboard from './pages/Dashboard';
import Tarefas from './pages/Tarefas';
import NovaTarefa from './pages/NovaTarefa';
import Calendario from './pages/Calendario';
import Estatisticas from './pages/Estatisticas';
import Perfil from './pages/Perfil';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Rotas Protegidas */}
          <Route
            path="/"
            element={
              <RotaProtegida>
                <Dashboard />
              </RotaProtegida>
            }
          />
          <Route
            path="/tarefas"
            element={
              <RotaProtegida>
                <Tarefas />
              </RotaProtegida>
            }
          />
          <Route
            path="/tarefas/nova"
            element={
              <RotaProtegida>
                <NovaTarefa />
              </RotaProtegida>
            }
          />
          <Route
            path="/calendario"
            element={
              <RotaProtegida>
                <Calendario />
              </RotaProtegida>
            }
          />
          <Route
            path="/estatisticas"
            element={
              <RotaProtegida>
                <Estatisticas />
              </RotaProtegida>
            }
          />
          <Route
            path="/perfil"
            element={
              <RotaProtegida>
                <Perfil />
              </RotaProtegida>
            }
          />

          {/* Rota padrão - redirecionar para dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
