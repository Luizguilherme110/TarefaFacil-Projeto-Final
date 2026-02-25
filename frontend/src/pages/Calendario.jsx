import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { recessos } from '../data/recessos'

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function gerarMatrizMes(ano, mes) {
  const primeiro = new Date(ano, mes, 1)
  const ultimo = new Date(ano, mes + 1, 0)

  const dias = []
  const inicioOffset = primeiro.getDay() // 0..6
  // preencher dias anteriores do mês anterior
  for (let i = 0; i < inicioOffset; i++) {
    dias.push(null)
  }

  for (let d = 1; d <= ultimo.getDate(); d++) {
    dias.push(new Date(ano, mes, d))
  }

  // completar a última semana
  while (dias.length % 7 !== 0) dias.push(null)

  // partir em semanas
  const semanas = []
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(dias.slice(i, i + 7))
  }
  return semanas
}

export default function Calendario() {
  const { usuario, carregando } = useAuth()
  const hoje = new Date()
  const [anoMes, setAnoMes] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() })
  const [tarefasPorData, setTarefasPorData] = useState({})
  const [selecionado, setSelecionado] = useState(null)

  const semanas = useMemo(() => gerarMatrizMes(anoMes.ano, anoMes.mes), [anoMes])
  const diasMes = useMemo(() => semanas.flat().filter(Boolean), [semanas])

  // state para feriados & recessos
  const [holidaysMap, setHolidaysMap] = useState({})
  const [recessMap, setRecessMap] = useState({})

  useEffect(() => {
    if (carregando) return
    // Buscar tarefas do mês atual
    const fetchTarefas = async () => {
      try {
        const from = new Date(anoMes.ano, anoMes.mes, 1).toISOString()
        const to = new Date(anoMes.ano, anoMes.mes + 1, 0, 23, 59, 59).toISOString()
        const res = await api.get(`/tarefas/calendario?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
        // Espera-se que o backend retorne uma lista de tarefas com uma data (`dataEntrega`|`prazo`|`data`) - normalizar
        const lista = res.data?.dados || []
        const mapa = {}
        lista.forEach(t => {
          const dt = t.dataEntrega || t.prazo || t.data || t.createdAt || t.criadoEm || t.dataPrevista
          if (!dt) return
          const key = new Date(dt).toISOString().slice(0,10)
          if (!mapa[key]) mapa[key] = []
          mapa[key].push(t)
        })
        setTarefasPorData(mapa)
      } catch (error) {
        console.error('Erro ao carregar tarefas do calendário', error)
        setTarefasPorData({})
      }
    }
      // Buscar feriados públicos (Nager.Date) e tarefas
      const fetchAll = async () => {
        // buscar tarefas
        await fetchTarefas()

        // buscar feriados públicos para o país BR
        try {
          const ano = anoMes.ano
          const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${ano}/BR`)
          if (res.ok) {
            const feriados = await res.json()
            const mapaF = {}
            feriados.forEach(f => {
              const key = new Date(f.date).toISOString().slice(0,10)
              mapaF[key] = { nome: f.localName || f.name, tipo: 'feriado' }
            })
            setHolidaysMap(mapaF)
          } else {
            setHolidaysMap({})
          }
        } catch (err) {
          console.error('Erro ao buscar feriados públicos', err)
          setHolidaysMap({})
        }

        // mapear recessos locais
        const mapaR = {}
        try {
          recessos.forEach(r => {
            const inicio = new Date(r.inicio)
            const fim = new Date(r.fim)
            for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
              const key = new Date(d).toISOString().slice(0,10)
              mapaR[key] = { nome: r.nome, tipo: 'recesso' }
            }
          })
          setRecessMap(mapaR)
        } catch (err) {
          console.error('Erro ao mapear recessos', err)
          setRecessMap({})
        }
      }

      fetchAll()
  }, [anoMes, carregando])

  const voltarMes = () => setAnoMes(s => {
    const m = s.mes - 1
    if (m < 0) return { ano: s.ano - 1, mes: 11 }
    return { ...s, mes: m }
  })

  const avancarMes = () => setAnoMes(s => {
    const m = s.mes + 1
    if (m > 11) return { ano: s.ano + 1, mes: 0 }
    return { ...s, mes: m }
  })

  if (!usuario && !carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">Por favor faça login.</div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Calendário</h1>
            <div className="text-sm text-gray-500">Visualização mensal</div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={voltarMes} className="btn">‹</button>
            <div className="px-3 py-2 bg-white rounded shadow text-sm sm:text-base">
              <strong>{new Date(anoMes.ano, anoMes.mes).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</strong>
            </div>
            <button onClick={avancarMes} className="btn">›</button>
          </div>
        </div>

        {/* Legenda */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 border border-red-600 rounded-sm" />
            <span className="text-sm text-gray-700">Feriado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-400 border border-blue-600 rounded-sm" />
            <span className="text-sm text-gray-700">Recesso</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 border border-green-600 rounded-sm" />
            <span className="text-sm text-gray-700">Tarefa</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {/* Mobile: grade compacta */}
          <div className="md:hidden">
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-600 mb-2">
              {diasSemana.map(d => (
                <div key={d} className="font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {semanas.map((sem, si) => (
                sem.map((dia, di) => {
                  const key = dia ? dia.toISOString().slice(0,10) : `empty-${si}-${di}`
                  const tarefas = dia ? (tarefasPorData[key] || []) : []
                  const isHoje = dia && (dia.toDateString() === (new Date()).toDateString())
                  const feriado = holidaysMap[key]
                  const recesso = recessMap[key]

                  const dayBg = dia ? (feriado ? 'bg-red-300' : recesso ? 'bg-blue-300' : 'bg-white') : 'bg-transparent'

                  return (
                    <div key={key} className={`min-h-[60px] p-1 border rounded text-center ${dayBg} ${isHoje ? 'ring-2 ring-primary-500' : ''} ${feriado ? 'border-red-600' : ''} ${recesso ? 'border-blue-600' : ''}`}>
                      {dia ? (
                        <div className="flex flex-col h-full">
                          <div className="text-xs font-medium text-gray-900">{dia.getDate()}</div>
                          
                          <div className="mt-1 flex-1 flex flex-wrap gap-px justify-center content-start">
                            {feriado && (
                              <div className="w-1.5 h-1.5 bg-red-600 rounded-full" title={feriado.nome} />
                            )}
                            {recesso && (
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" title={recesso.nome} />
                            )}
                            {tarefas.slice(0,2).map((t, idx) => (
                              <div key={idx} className="w-1.5 h-1.5 bg-green-600 rounded-full" title={t.titulo || t.nome || 'Tarefa'} />
                            ))}
                            {tarefas.length > 2 && (
                              <div className="text-xs font-semibold text-primary-600">+{tarefas.length - 2}</div>
                            )}
                          </div>
                          
                          <button onClick={() => setSelecionado(key)} className="text-xs text-primary-600 hover:underline mt-1">
                            Ver
                          </button>
                        </div>
                      ) : (
                        <div className="h-full" />
                      )}
                    </div>
                  )
                })
              ))}
            </div>
          </div>

          {/* Desktop: grade mensal */}
          <div className="hidden md:block">
            <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-600 mb-2">
              {diasSemana.map(d => (
                <div key={d} className="font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {semanas.map((sem, si) => (
                sem.map((dia, di) => {
                  const key = dia ? dia.toISOString().slice(0,10) : `empty-${si}-${di}`
                  const tarefas = dia ? (tarefasPorData[key] || []) : []
                  const isHoje = dia && (dia.toDateString() === (new Date()).toDateString())
                  const feriado = holidaysMap[key]
                  const recesso = recessMap[key]

                  const dayBg = dia ? (feriado ? 'bg-red-300' : recesso ? 'bg-blue-300' : 'bg-white') : 'bg-transparent'

                  return (
                    <div key={key} className={`min-h-[100px] p-2 border rounded ${dayBg} ${isHoje ? 'ring-2 ring-primary-500' : ''} ${feriado ? 'border-red-600' : ''} ${recesso ? 'border-blue-600' : ''}`}>
                      {dia ? (
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="text-sm font-medium text-gray-900">{dia.getDate()}</div>
                            <div className="text-xs text-gray-500">{dia.toLocaleString('pt-BR', { weekday: 'short' })}</div>
                          </div>

                          <div className="mt-2 space-y-1">
                            {feriado && (
                              <div className="text-xs inline-block bg-red-400 text-red-900 px-2 py-1 rounded mb-1 font-semibold">{feriado.nome}</div>
                            )}
                            {recesso && (
                              <div className="text-xs inline-block bg-blue-400 text-blue-900 px-2 py-1 rounded mb-1 font-semibold">{recesso.nome}</div>
                            )}
                            {tarefas.slice(0,3).map((t, idx) => (
                              <div key={idx} className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded">{t.titulo || t.nome || t.descricao || 'Tarefa'}</div>
                            ))}
                            {tarefas.length > 3 && (
                              <div className="text-xs text-gray-500">+{tarefas.length - 3} adicionais</div>
                            )}
                          </div>

                          <div className="mt-2">
                            <button onClick={() => setSelecionado(key)} className="text-xs text-primary-600 hover:underline">Ver detalhes</button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full" />
                      )}
                    </div>
                  )
                })
              ))}
            </div>
          </div>
        </div>

        {selecionado && (
          <div className="mt-6 bg-white rounded shadow p-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Tarefas em {selecionado}</h2>
              <button onClick={() => setSelecionado(null)} className="text-sm text-gray-500">Fechar</button>
            </div>

            <div className="mt-3 space-y-2">
              {(tarefasPorData[selecionado] || []).map((t, i) => (
                <div key={i} className="p-3 border rounded">
                  <div className="font-medium">{t.titulo || t.nome || 'Tarefa'}</div>
                  <div className="text-sm text-gray-600">{t.descricao || t.descricaoCurta || ''}</div>
                </div>
              ))}
              {(!tarefasPorData[selecionado] || tarefasPorData[selecionado].length === 0) && (
                <div className="text-gray-500">Nenhuma tarefa neste dia.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
 
