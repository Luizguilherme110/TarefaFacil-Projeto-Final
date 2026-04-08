import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Header = () => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [temaEscuro, setTemaEscuro] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved) return saved === 'dark'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    if (temaEscuro) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [temaEscuro])

  const toggleTema = () => {
    const novo = !temaEscuro
    setTemaEscuro(novo)
    try { localStorage.setItem('theme', novo ? 'dark' : 'light') } catch (e) {}
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  

  const menuItems = [
    { nome: 'Dashboard', icone: LayoutDashboard, caminho: '/' },
    { nome: 'Tarefas', icone: CheckSquare, caminho: '/tarefas' },
    { nome: 'Calendário', icone: Calendar, caminho: '/calendario' },
    { nome: 'Estatísticas', icone: BarChart3, caminho: '/estatisticas' },
    { nome: 'Perfil', icone: User, caminho: '/perfil' },
  ];

  const estaAtivo = (caminho) => {
    return location.pathname === caminho;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-1.5 sm:p-2 rounded-lg">
              <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              Tarefa<span className="text-primary-600">Fácil</span>
            </span>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex space-x-1">
            {menuItems.map((item) => {
              const Icone = item.icone;
              const ativo = estaAtivo(item.caminho);
              
              return (
                <Link
                  key={item.caminho}
                  to={item.caminho}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    ativo
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icone className="h-5 w-5" />
                  <span className="font-medium">{item.nome}</span>
                </Link>
              );
            })}
          </nav>

          {/* Usuário e Logout + Tema */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center shrink-0 border border-gray-300 dark:border-gray-600">
                {usuario?.fotoPerfil ? (
                  <img src={usuario.fotoPerfil} alt={usuario.nome} className="w-full h-full object-cover" onError={(e) => { e.target.src = '' }} />
                ) : (
                  <User size={18} className="text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {usuario?.nome?.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={toggleTema}
              aria-label="Alternar tema"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {temaEscuro ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>

          {/* Botão Tema mobile + Menu Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTema}
              aria-label="Alternar tema"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {temaEscuro ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
            </button>
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {menuAberto ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {menuAberto && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icone = item.icone;
                const ativo = estaAtivo(item.caminho);
                
                return (
                  <Link
                    key={item.caminho}
                    to={item.caminho}
                    onClick={() => setMenuAberto(false)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${
                      ativo
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icone className="h-5 w-5" />
                    <span className="font-medium">{item.nome}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                    {usuario?.fotoPerfil ? (
                      <img src={usuario.fotoPerfil} alt={usuario.nome} className="w-full h-full object-cover" onError={(e) => { e.target.src = '' }} />
                    ) : (
                      <User size={20} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{usuario?.nome}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{usuario?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuAberto(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
