import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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
  Moon,
  Bell,
  MessageCircle
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Header = () => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [carregandoNotificacoes, setCarregandoNotificacoes] = useState(false);
  const notificacoesRef = useRef(null);
  const [temaEscuro, setTemaEscuro] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (temaEscuro) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [temaEscuro]);

  useEffect(() => {
    setMenuAberto(false);
    setNotificacoesAbertas(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickFora = (event) => {
      if (notificacoesRef.current && !notificacoesRef.current.contains(event.target)) {
        setNotificacoesAbertas(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const carregarNotificacoes = async (mostrarLoading = true) => {
    if (!usuario) return;

    try {
      if (mostrarLoading) setCarregandoNotificacoes(true);
      const response = await api.get('/tarefas/notificacoes');
      setNotificacoes(response.data.dados || []);
    } catch (error) {
      setNotificacoes([]);
    } finally {
      if (mostrarLoading) setCarregandoNotificacoes(false);
    }
  };

  useEffect(() => {
    if (!usuario) return;

    carregarNotificacoes();
    const intervalo = setInterval(() => carregarNotificacoes(false), 60000);

    return () => clearInterval(intervalo);
  }, [usuario, location.pathname]);

  const toggleTema = () => {
    const novo = !temaEscuro;
    setTemaEscuro(novo);
    try {
      localStorage.setItem('theme', novo ? 'dark' : 'light');
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleNotificacoes = async () => {
    if (!notificacoesAbertas) {
      await carregarNotificacoes();
    }

    setNotificacoesAbertas((valorAtual) => !valorAtual);
  };

  const corNotificacao = (nivel) => {
    if (nivel === 'urgente') return 'bg-red-500';
    if (nivel === 'alerta') return 'bg-yellow-500';
    if (nivel === 'sucesso') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const menuItems = [
    { nome: 'Dashboard', icone: LayoutDashboard, caminho: '/' },
    { nome: 'Tarefas', icone: CheckSquare, caminho: '/tarefas' },
    { nome: 'Calendário', icone: Calendar, caminho: '/calendario' },
    { nome: 'Estatísticas', icone: BarChart3, caminho: '/estatisticas' },
    { nome: 'Chat', icone: MessageCircle, caminho: '/chat' },
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

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative" ref={notificacoesRef}>
              <button
                onClick={toggleNotificacoes}
                aria-label="Abrir notificações"
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {notificacoes.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {notificacoes.length > 9 ? '9+' : notificacoes.length}
                  </span>
                )}
              </button>

              {notificacoesAbertas && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notificações</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {usuario?.role === 'PROFESSOR'
                        ? 'Atualizações das tarefas dos alunos'
                        : 'Lembretes e retornos do professor'}
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {carregandoNotificacoes ? (
                      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Carregando notificações...</div>
                    ) : notificacoes.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Nenhuma notificação no momento.</div>
                    ) : (
                      notificacoes.map((notificacao) => (
                        <Link
                          key={notificacao.id}
                          to={notificacao.rota || '/tarefas'}
                          onClick={() => setNotificacoesAbertas(false)}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${corNotificacao(notificacao.nivel)}`}></span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{notificacao.titulo}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 break-words">{notificacao.mensagem}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <Link
                      to="/tarefas"
                      onClick={() => setNotificacoesAbertas(false)}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      Ver tarefas
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
