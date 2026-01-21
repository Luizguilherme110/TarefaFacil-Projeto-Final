import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Plus,
  TrendingUp
} from 'lucide-react';
import { textoDiasRestantes, corPrioridade } from '../utils/helpers';

const Dashboard = () => {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const response = await api.get('/tarefas/dashboard');
      setDados(response.data.dados);
    } catch (error) {
      toast.error('Erro ao carregar dashboard');
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título e Botão Nova Tarefa */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo! Aqui está um resumo das suas tarefas
            </p>
          </div>
          <Link
            to="/tarefas/nova"
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nova Tarefa</span>
          </Link>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tarefas Pendentes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {dados?.resumo.tarefasPendentes || 0}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Pendentes</h3>
          </div>

          {/* Tarefas Concluídas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {dados?.resumo.tarefasConcluidas || 0}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Concluídas</h3>
          </div>

          {/* Tarefas Atrasadas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {dados?.resumo.tarefasAtrasadas || 0}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Atrasadas</h3>
          </div>

          {/* Tarefas da Semana */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {dados?.resumo.tarefasSemana || 0}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Nesta Semana</h3>
          </div>
        </div>

        {/* Tarefas Recentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Tarefas Recentes
            </h2>
            <Link
              to="/tarefas"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Ver todas →
            </Link>
          </div>

          {dados?.tarefasRecentes?.length > 0 ? (
            <div className="space-y-3">
              {dados.tarefasRecentes.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className={`p-4 border rounded-lg ${
                    tarefa.atrasada
                      ? 'border-red-200 bg-red-50'
                      : tarefa.venceHoje
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {tarefa.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tarefa.disciplina}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${corPrioridade(tarefa.prioridade)}`}>
                        {tarefa.prioridade}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {textoDiasRestantes(tarefa.diasRestantes)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma tarefa cadastrada ainda</p>
              <Link
                to="/tarefas/nova"
                className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block"
              >
                Criar sua primeira tarefa
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
