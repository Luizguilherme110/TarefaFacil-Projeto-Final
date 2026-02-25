import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  BarChart3,
  Award,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  Star,
  TrendingUp,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'

export default function Estatisticas() {
  const { usuario } = useAuth()
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get('/tarefas/estatisticas')
        setDados(res.data.dados)
      } catch {
        toast.error('Erro ao carregar estatísticas')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const corNota = (nota) => {
    if (nota >= 8) return 'text-green-600'
    if (nota >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const bgNota = (nota) => {
    if (nota >= 8) return 'bg-green-100 border-green-200'
    if (nota >= 6) return 'bg-yellow-100 border-yellow-200'
    return 'bg-red-100 border-red-200'
  }

  const barColor = (media) => {
    if (media >= 8) return 'bg-green-500'
    if (media >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!dados) return null

  const isProfessor = usuario?.role === 'PROFESSOR'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary-600" />
            Estatísticas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isProfessor ? 'Visão geral das tarefas que você criou para os alunos' : 'Seu desempenho acadêmico'}
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dados.totalTarefas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Concluídas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dados.tarefasConcluidas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avaliadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dados.tarefasAvaliadas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Média</p>
                <p className={`text-2xl font-bold ${dados.mediaNotas > 0 ? corNota(dados.mediaNotas) : 'text-gray-400'}`}>
                  {dados.mediaNotas > 0 ? `${dados.mediaNotas}` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progresso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Taxa de conclusão */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Taxa de Conclusão
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="currentColor" strokeWidth="8"
                    strokeDasharray={`${dados.taxaConclusao * 2.51} 251`}
                    strokeLinecap="round"
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{dados.taxaConclusao}%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Concluídas</span>
                    <span className="font-medium text-green-600">{dados.tarefasConcluidas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Pendentes</span>
                    <span className="font-medium text-yellow-600">{dados.tarefasPendentes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total</span>
                    <span className="font-medium text-gray-900 dark:text-white">{dados.totalTarefas}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Média por disciplina */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Média por Disciplina
            </h3>
            {dados.mediasPorDisciplina?.length > 0 ? (
              <div className="space-y-3">
                {dados.mediasPorDisciplina.map((disc) => (
                  <div key={disc.disciplina}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{disc.disciplina}</span>
                      <span className={`font-bold ${corNota(disc.media)}`}>{disc.media}</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor(disc.media)}`}
                        style={{ width: `${(disc.media / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{disc.total} tarefa(s) avaliada(s)</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-400">Nenhuma avaliação ainda</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribuição por disciplina */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Tarefas por Disciplina
          </h3>
          {dados.porDisciplina?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dados.porDisciplina.map((d) => (
                <div key={d.disciplina} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{d.disciplina}</span>
                  <span className="text-sm font-bold text-primary-600">{d._count.id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Nenhuma tarefa registrada</p>
          )}
        </div>

        {/* Últimas avaliações */}
        {dados.tarefasComNota?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Últimas Avaliações
            </h3>
            <div className="space-y-3">
              {dados.tarefasComNota.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className={`rounded-lg p-4 border ${bgNota(tarefa.nota)}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{tarefa.titulo}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{tarefa.disciplina}</span>
                        {isProfessor && tarefa.usuario?.nome && (
                          <>
                            <span>•</span>
                            <span>Aluno: {tarefa.usuario.nome}</span>
                          </>
                        )}
                        {!isProfessor && tarefa.criadoPor?.nome && (
                          <>
                            <span>•</span>
                            <span>Prof: {tarefa.criadoPor.nome}</span>
                          </>
                        )}
                      </div>
                      {tarefa.feedbackProfessor && (
                        <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-600">
                          <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>{tarefa.feedbackProfessor}</span>
                        </div>
                      )}
                    </div>
                    <div className={`text-3xl font-black ${corNota(tarefa.nota)} shrink-0`}>
                      {tarefa.nota}<span className="text-base font-normal opacity-60">/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
