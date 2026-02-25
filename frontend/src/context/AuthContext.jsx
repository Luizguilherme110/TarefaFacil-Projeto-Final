import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Carregar usuário do localStorage ao iniciar
    const usuarioSalvo = localStorage.getItem('usuario');
    const tokenSalvo = localStorage.getItem('token');

    if (usuarioSalvo && tokenSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }

    setCarregando(false);
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      const { usuario: usuarioData, token } = response.data.dados;

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuarioData));

      setUsuario(usuarioData);

      toast.success(`Bem-vindo, ${usuarioData.nome}!`);

      return true;
    } catch (error) {
      const mensagem = error.response?.data?.mensagem || 'Erro ao fazer login';
      toast.error(mensagem);
      return false;
    }
  };

  const cadastrar = async (nome, email, senha, role) => {
    try {
      const response = await api.post('/auth/register', { nome, email, senha, role });
      
      const { usuario: usuarioData, token } = response.data.dados;

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuarioData));

      setUsuario(usuarioData);

      toast.success('Conta criada com sucesso!');

      return true;
    } catch (error) {
      const mensagem = error.response?.data?.mensagem || 'Erro ao criar conta';
      const erros = error.response?.data?.erros;

      if (erros && erros.length > 0) {
        erros.forEach(erro => toast.error(erro.mensagem));
      } else {
        toast.error(mensagem);
      }

      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    toast.success('Logout realizado com sucesso');
  };

  const atualizarUsuario = (novosDados) => {
    const usuarioAtualizado = { ...usuario, ...novosDados };
    setUsuario(usuarioAtualizado);
    localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        autenticado: !!usuario,
        login,
        cadastrar,
        logout,
        atualizarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
