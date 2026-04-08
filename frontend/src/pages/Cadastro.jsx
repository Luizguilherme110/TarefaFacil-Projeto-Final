import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { User, Mail, Lock, CheckSquare, GraduationCap, BookOpen } from 'lucide-react';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [role, setRole] = useState('ALUNO');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setCarregando(true);

    const sucesso = await cadastrar(nome, email, senha, role);

    if (sucesso) {
      navigate('/');
    }

    setCarregando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <ThemeToggle />
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary-600 text-white p-3 sm:p-4 rounded-2xl mb-4">
            <CheckSquare className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Tarefa<span className="text-primary-600">Fácil</span>
          </h1>
          <p className="text-gray-600">
            Crie sua conta e comece a organizar suas tarefas
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Criar nova conta
          </h2>

          {erro && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tipo de Usuário */}
            <div>
              <label className="label">Eu sou</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('ALUNO')}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    role === 'ALUNO'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <GraduationCap className="h-6 w-6" />
                  <span className="font-medium text-sm">Aluno</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PROFESSOR')}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    role === 'PROFESSOR'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <BookOpen className="h-6 w-6" />
                  <span className="font-medium text-sm">Professor</span>
                </button>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="label">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input pl-10"
                  placeholder="Seu nome"
                  required
                  minLength={3}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="input pl-10"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 8 caracteres, com letra e número
              </p>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="label">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="input pl-10"
                  placeholder="Digite a senha novamente"
                  required
                />
              </div>
            </div>

            {/* Botão Cadastrar */}
            <button
              type="submit"
              disabled={carregando}
              className="btn btn-primary w-full py-3 text-lg"
            >
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-8 text-sm">
          Ao criar uma conta, você concorda com nossos Termos de Uso
        </p>
      </div>
    </div>
  );
};

export default Cadastro;
