import Header from '../components/Header'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Users } from 'lucide-react'

export default function NovaTarefa() {
  const { usuario, carregando } = useAuth();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [disciplina, setDisciplina] = useState('')
  const [prioridade, setPrioridade] = useState('MEDIA')
  const [dataEntrega, setDataEntrega] = useState('')
  const [alunoId, setAlunoId] = useState('')
  const [valorPontos, setValorPontos] = useState('')
  const [alunos, setAlunos] = useState([])
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!carregando && usuario?.role !== 'PROFESSOR') {
      navigate('/');
    }
  }, [usuario, carregando, navigate]);

  // Carregar lista de alunos
  useEffect(() => {
    const carregarAlunos = async () => {
      try {
        const res = await api.get('/usuarios/alunos')
        setAlunos(res.data.dados || [])
      } catch (err) {
        console.error('Erro ao carregar alunos:', err)
      }
    }
    if (usuario?.role === 'PROFESSOR') {
      carregarAlunos()
    }
  }, [usuario])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!titulo || !disciplina || !dataEntrega || !alunoId) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSalvando(true)
    try {
      await api.post('/tarefas', {
        titulo,
        descricao: descricao || null,
        disciplina,
        prioridade,
        dataEntrega,
        alunoId: parseInt(alunoId),
        valorPontos: valorPontos ? parseFloat(valorPontos) : null
      })
      toast.success('Tarefa criada e designada com sucesso!')
      navigate('/tarefas')
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao criar tarefa'
      const erros = err.response?.data?.erros
      if (erros && erros.length > 0) {
        erros.forEach(e => toast.error(e.mensagem))
      } else {
        toast.error(msg)
      }
    } finally {
      setSalvando(false)
    }
  }

  // Data mínima = hoje
  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-5 w-5 mr-1" /> Voltar
        </button>

        <h1 className="text-2xl font-bold mb-6">Criar Nova Tarefa</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
          {/* Selecionar Aluno */}
          <div>
            <label className="label flex items-center gap-2">
              <Users className="h-4 w-4" /> Designar para aluno *
            </label>
            <select
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              className="input w-full"
              required
            >
              <option value="">Selecione um aluno...</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} ({a.email})
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="label">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="input w-full"
              placeholder="Ex: Trabalho de Matemática"
              required
              maxLength={100}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="label">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="input w-full"
              placeholder="Descreva os detalhes da tarefa..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Disciplina */}
          <div>
            <label className="label">Disciplina *</label>
            <input
              type="text"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              className="input w-full"
              placeholder="Ex: Matemática"
              required
              maxLength={50}
            />
          </div>

          {/* Prioridade, Data e Pontos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Prioridade *</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className="input w-full"
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>
            <div>
              <label className="label">Data de Entrega *</label>
              <input
                type="date"
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
                className="input w-full"
                min={hoje}
                required
              />
            </div>
            <div>
              <label className="label">Valor em Pontos</label>
              <input
                type="number"
                value={valorPontos}
                onChange={(e) => setValorPontos(e.target.value)}
                className="input w-full"
                placeholder="Ex: 10"
                min="0"
                max="1000"
                step="0.5"
              />
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="btn btn-primary flex items-center gap-2 px-6 py-2.5"
            >
              <Save className="h-5 w-5" />
              {salvando ? 'Salvando...' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
