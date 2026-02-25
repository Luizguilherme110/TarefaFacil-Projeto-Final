import Header from '../components/Header'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Filter,
  Plus,
  Search,
  Star,
  X,
  Award,
  MessageSquare
} from 'lucide-react'
import { formatarData, textoDiasRestantes, calcularDiasRestantes, corPrioridade } from '../utils/helpers'

export default function Tarefas() {
  const { usuario } = useAuth()
  const [tarefas, setTarefas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('')
  const [filtroDisciplina, setFiltroDisciplina] = useState('')
  const [busca, setBusca] = useState('')

  // Modal de avaliação
  const [avaliarModal, setAvaliarModal] = useState(null)
  const [nota, setNota] = useState('')
  const [feedback, setFeedback] = useState('')
  const [avaliando, setAvaliando] = useState(false)

  const carregarTarefas = async () => {
    try {
      const params = new URLSearchParams()
      if (filtroStatus) params.append('status', filtroStatus)
      if (filtroPrioridade) params.append('prioridade', filtroPrioridade)
      if (filtroDisciplina) params.append('disciplina', filtroDisciplina)

      const res = await api.get(`/tarefas?${params.toString()}`)
      setTarefas(res.data.dados || [])
    } catch (err) {
      toast.error('Erro ao carregar tarefas')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarTarefas()
  }, [filtroStatus, filtroPrioridade, filtroDisciplina])

  const concluirTarefa = async (id) => {
    try {
      await api.patch(`/tarefas/${id}/concluir`)
      toast.success('Tarefa concluída!')
      carregarTarefas()
    } catch (err) {
      toast.error('Erro ao concluir tarefa')
    }
  }

  const reabrirTarefa = async (id) => {
    try {
      await api.patch(`/tarefas/${id}/reabrir`)
      toast.success('Tarefa reaberta')
      carregarTarefas()
    } catch (err) {
      toast.error('Erro ao reabrir tarefa')
    }
  }

  const excluirTarefa = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return
    try {
      await api.delete(`/tarefas/${id}`)
      toast.success('Tarefa excluída')
      carregarTarefas()
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Erro ao excluir tarefa')
    }
  }

  const abrirAvaliar = (tarefa) => {
    setAvaliarModal(tarefa)
    setNota('')
    setFeedback('')
  }

  const avaliarTarefa = async () => {
    if (!avaliarModal) return
    const notaNum = parseFloat(nota)
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      toast.error('Informe uma nota entre 0 e 10')
      return
    }
    setAvaliando(true)
    try {
      await api.patch(`/tarefas/${avaliarModal.id}/avaliar`, {
        nota: notaNum,
        feedback: feedback || ''
      })
      toast.success('Tarefa avaliada com sucesso!')
      setAvaliarModal(null)
      carregarTarefas()
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Erro ao avaliar tarefa')
    } finally {
      setAvaliando(false)
    }
  }

  // Filtrar por busca local
  const tarefasFiltradas = tarefas.filter(t => {
    if (!busca) return true
    const termo = busca.toLowerCase()
    return (
      t.titulo?.toLowerCase().includes(termo) ||
      t.disciplina?.toLowerCase().includes(termo) ||
      t.descricao?.toLowerCase().includes(termo)
    )
  })

  // Disciplinas únicas
  const disciplinas = [...new Set(tarefas.map(t => t.disciplina).filter(Boolean))]

  const getBorderColor = (tarefa) => {
    if (tarefa.status === 'AVALIADA') return 'border-l-purple-500'
    if (tarefa.status === 'CONCLUIDA') return 'border-l-green-500'
    if (tarefa.atrasada) return 'border-l-red-500'
    if (tarefa.prioridade === 'ALTA') return 'border-l-red-400'
    if (tarefa.prioridade === 'MEDIA') return 'border-l-yellow-400'
    return 'border-l-blue-400'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tarefas</h1>
            <p className="text-sm text-gray-500">{tarefas.length} tarefa(s) encontrada(s)</p>
          </div>
          {usuario?.role === 'PROFESSOR' && (
            <Link to="/tarefas/nova" className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
              <Plus className="h-5 w-5" /> Nova Tarefa
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar..."
                className="input pl-9 text-sm"
              />
            </div>
            {/* Status */}
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="input text-sm">
              <option value="">Todos os status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="AVALIADA">Avaliada</option>
            </select>
            {/* Prioridade */}
            <select value={filtroPrioridade} onChange={e => setFiltroPrioridade(e.target.value)} className="input text-sm">
              <option value="">Todas as prioridades</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>
            {/* Disciplina */}
            <select value={filtroDisciplina} onChange={e => setFiltroDisciplina(e.target.value)} className="input text-sm">
              <option value="">Todas as disciplinas</option>
              {disciplinas.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Tarefas */}
        {carregando ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : tarefasFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma tarefa encontrada</p>
            <p className="text-gray-400 text-sm mt-1">
              {usuario?.role === 'PROFESSOR' ? 'Crie uma nova tarefa para começar' : 'Aguarde o professor designar tarefas para você'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tarefasFiltradas.map(tarefa => {
              const dias = calcularDiasRestantes(tarefa.dataEntrega)
              const atrasada = tarefa.status === 'PENDENTE' && dias < 0
              const concluida = tarefa.status === 'CONCLUIDA'
              const avaliada = tarefa.status === 'AVALIADA'

              return (
                <div
                  key={tarefa.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${getBorderColor(tarefa)} p-4 transition-all hover:shadow-md`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold text-gray-900 ${(concluida || avaliada) ? 'line-through opacity-60' : ''}`}>
                          {tarefa.titulo}
                        </h3>
                        <span className={`badge ${corPrioridade(tarefa.prioridade)}`}>
                          {tarefa.prioridade}
                        </span>
                        {concluida && (
                          <span className="badge bg-green-100 text-green-700">Concluída</span>
                        )}
                        {avaliada && (
                          <span className="badge bg-purple-100 text-purple-700 flex items-center gap-1">
                            <Award className="h-3 w-3" /> Avaliada — {tarefa.nota}/10
                          </span>
                        )}
                        {tarefa.valorPontos && (
                          <span className="badge bg-indigo-100 text-indigo-700">
                            {tarefa.valorPontos} pts
                          </span>
                        )}
                        {atrasada && (
                          <span className="badge bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Atrasada
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                        <span>{tarefa.disciplina}</span>
                        <span>•</span>
                        <span>Entrega: {formatarData(tarefa.dataEntrega)}</span>
                        {tarefa.nomeAluno && usuario?.role === 'PROFESSOR' && (
                          <>
                            <span>•</span>
                            <span>Aluno: <strong>{tarefa.nomeAluno}</strong></span>
                          </>
                        )}
                        {tarefa.nomeProfessor && usuario?.role === 'ALUNO' && (
                          <>
                            <span>•</span>
                            <span>Prof: {tarefa.nomeProfessor}</span>
                          </>
                        )}
                        {!concluida && !avaliada && (
                          <>
                            <span>•</span>
                            <span className={atrasada ? 'text-red-600 font-medium' : dias <= 2 ? 'text-yellow-600 font-medium' : ''}>
                              {textoDiasRestantes(dias)}
                            </span>
                          </>
                        )}
                      </div>

                      {tarefa.descricao && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tarefa.descricao}</p>
                      )}

                      {/* Mostrar feedback do professor para o aluno */}
                      {avaliada && tarefa.feedbackProfessor && (
                        <div className="mt-2 bg-purple-50 rounded-lg p-3 border border-purple-200">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-purple-700 mb-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Feedback do Professor
                          </div>
                          <p className="text-sm text-purple-600">{tarefa.feedbackProfessor}</p>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Aluno: concluir tarefa */}
                      {!concluida && !avaliada && usuario?.role === 'ALUNO' && (
                        <button
                          onClick={() => concluirTarefa(tarefa.id)}
                          title="Marcar como concluída"
                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                      )}
                      {/* Professor: avaliar tarefa concluída */}
                      {concluida && usuario?.role === 'PROFESSOR' && (
                        <button
                          onClick={() => abrirAvaliar(tarefa)}
                          title="Avaliar tarefa"
                          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1.5 text-sm font-medium"
                        >
                          <Star className="h-4 w-4" /> Avaliar
                        </button>
                      )}
                      {/* Professor: reabrir tarefa concluída (antes de avaliar) */}
                      {concluida && usuario?.role === 'PROFESSOR' && (
                        <button
                          onClick={() => reabrirTarefa(tarefa.id)}
                          title="Reabrir tarefa"
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      )}
                      {usuario?.role === 'PROFESSOR' && (
                        <button
                          onClick={() => excluirTarefa(tarefa.id)}
                          title="Excluir tarefa"
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Avaliação */}
      {avaliarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAvaliarModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                Avaliar Tarefa
              </h2>
              <button onClick={() => setAvaliarModal(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">{avaliarModal.titulo}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {avaliarModal.disciplina} — Aluno: {avaliarModal.nomeAluno || 'N/A'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nota (0 a 10) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  placeholder="Ex: 8.5"
                  className="input text-lg font-bold text-center"
                />
                {/* Botões rápidos de nota */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {[0, 2, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button
                      key={n}
                      onClick={() => setNota(String(n))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        nota === String(n)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Feedback (opcional)
                </label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Deixe um comentário para o aluno..."
                  className="input resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAvaliarModal(null)}
                  className="btn flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={avaliarTarefa}
                  disabled={avaliando || !nota}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {avaliando ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Award className="h-4 w-4" />
                  )}
                  {avaliando ? 'Avaliando...' : 'Confirmar Avaliação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
