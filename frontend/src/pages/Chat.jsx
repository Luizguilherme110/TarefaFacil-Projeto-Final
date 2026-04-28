import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageCircle, Send } from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatarHora = (dataIso) => {
  if (!dataIso) return '';
  return new Date(dataIso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Chat() {
  const { usuario } = useAuth();
  const [conversas, setConversas] = useState([]);
  const [contatoSelecionado, setContatoSelecionado] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [carregandoConversas, setCarregandoConversas] = useState(true);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const labelContato = useMemo(() => {
    if (!usuario) return 'Contato';
    return usuario.role === 'PROFESSOR' ? 'Aluno' : 'Professor';
  }, [usuario]);

  const carregarConversas = async () => {
    try {
      const response = await api.get('/chat/conversas');
      const lista = response.data?.dados || [];
      setConversas(lista);
      if (!contatoSelecionado && lista.length > 0) {
        setContatoSelecionado(lista[0]);
      }
    } catch (error) {
      toast.error('Não foi possível carregar as conversas.');
    } finally {
      setCarregandoConversas(false);
    }
  };

  const carregarMensagens = async (contatoId) => {
    if (!contatoId) return;
    setCarregandoMensagens(true);
    try {
      const response = await api.get(`/chat/mensagens/${contatoId}`);
      setMensagens(response.data?.dados || []);
    } catch (error) {
      toast.error('Não foi possível carregar as mensagens.');
    } finally {
      setCarregandoMensagens(false);
    }
  };

  useEffect(() => {
    carregarConversas();
  }, []);

  useEffect(() => {
    if (!contatoSelecionado?.id) return;
    carregarMensagens(contatoSelecionado.id);
  }, [contatoSelecionado?.id]);

  useEffect(() => {
    if (!contatoSelecionado?.id) return undefined;

    const intervalo = setInterval(() => {
      carregarConversas();
      carregarMensagens(contatoSelecionado.id);
    }, 10000);

    return () => clearInterval(intervalo);
  }, [contatoSelecionado?.id]);

  const enviarMensagem = async () => {
    const texto = novaMensagem.trim();
    if (!texto || !contatoSelecionado?.id || enviando) return;

    setEnviando(true);
    try {
      const response = await api.post(`/chat/mensagens/${contatoSelecionado.id}`, {
        conteudo: texto
      });
      setNovaMensagem('');
      setMensagens((mensagensAtuais) => [...mensagensAtuais, response.data.dados]);
      carregarConversas();
    } catch (error) {
      toast.error(error.response?.data?.mensagem || 'Não foi possível enviar a mensagem.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Converse com {usuario?.role === 'PROFESSOR' ? 'seus alunos' : 'seus professores'}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[70vh]">
          <aside className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Conversas</h2>
            </div>
            <div className="max-h-[65vh] overflow-y-auto">
              {carregandoConversas ? (
                <p className="p-4 text-sm text-gray-500">Carregando contatos...</p>
              ) : conversas.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">Nenhum contato disponível.</p>
              ) : (
                conversas.map((contato) => (
                  <button
                    key={contato.id}
                    type="button"
                    onClick={() => setContatoSelecionado(contato)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      contatoSelecionado?.id === contato.id ? 'bg-primary-50 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{contato.nome}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{labelContato}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {contato.ultimaMensagem?.conteudo || 'Sem mensagens ainda'}
                        </p>
                      </div>
                      {contato.naoLidas > 0 && (
                        <span className="min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                          {contato.naoLidas > 9 ? '9+' : contato.naoLidas}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {contatoSelecionado ? contatoSelecionado.nome : 'Selecione uma conversa'}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh]">
              {!contatoSelecionado ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <MessageCircle className="h-10 w-10 mb-2" />
                  <p>Escolha um contato para iniciar a conversa.</p>
                </div>
              ) : carregandoMensagens ? (
                <p className="text-sm text-gray-500">Carregando mensagens...</p>
              ) : mensagens.length === 0 ? (
                <p className="text-sm text-gray-500">Sem mensagens por enquanto.</p>
              ) : (
                mensagens.map((mensagem) => {
                  const enviadaPorMim = mensagem.remetenteId === usuario?.id;
                  return (
                    <div
                      key={mensagem.id}
                      className={`flex ${enviadaPorMim ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                          enviadaPorMim
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p>{mensagem.conteudo}</p>
                        <p className={`mt-1 text-[11px] ${enviadaPorMim ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {formatarHora(mensagem.criadoEm)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      enviarMensagem();
                    }
                  }}
                  disabled={!contatoSelecionado || enviando}
                  placeholder={contatoSelecionado ? 'Digite sua mensagem...' : 'Selecione um contato'}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={enviarMensagem}
                  disabled={!contatoSelecionado || !novaMensagem.trim() || enviando}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
