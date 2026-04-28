import { useState, useEffect, useRef } from 'react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { User, MapPin, AlignLeft, Camera, Save } from 'lucide-react'

export default function Perfil() {
  const { usuario, atualizarUsuario } = useAuth()
  const carregamentoIniciado = useRef(false)
  
  // Controle de loading
  const [carregandoPerfil, setCarregandoPerfil] = useState(true)
  const [salvando, setSalvando] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    biografia: '',
    fotoPerfil: '',
  })

  // Buscar dados completos do perfil na API
  useEffect(() => {
    if (!usuario || carregamentoIniciado.current) return
    carregamentoIniciado.current = true

    const buscarPerfil = async () => {
      try {
        const response = await api.get('/usuarios/perfil')
        if (response.data.sucesso) {
          const dados = response.data.dados
          setFormData({
            nome: dados.nome || '',
            endereco: dados.endereco || '',
            biografia: dados.biografia || '',
            fotoPerfil: dados.fotoPerfil || '',
          })
          
          // Se o AuthContext precisar de algum dado extra, podemos atualizar
          atualizarUsuario({
            ...usuario,
            nome: dados.nome,
            fotoPerfil: dados.fotoPerfil
          });
        }
      } catch (error) {
        toast.error('Não foi possível carregar os dados do perfil.', {
          id: 'perfil-carregar-erro',
        })
      } finally {
        setCarregandoPerfil(false)
      }
    }

    buscarPerfil()
  }, []) // executa uma vez ao montar o componente

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSalvando(true)

    try {
      const response = await api.put('/usuarios/perfil', formData)
      if (response.data.sucesso) {
        toast.success('Perfil atualizado com sucesso!')
        
        // Atualizar contexto (nome/foto costumam aparecer na Header)
        atualizarUsuario({
          ...usuario,
          nome: formData.nome,
          fotoPerfil: formData.fotoPerfil
        })
      }
    } catch (error) {
      toast.error(error.response?.data?.mensagem || 'Erro ao atualizar perfil')
    } finally {
      setSalvando(false)
    }
  }

  if (carregandoPerfil) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium">Carregando perfil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas informações pessoais e configurações do sistema.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Capa decorativa */}
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700"></div>
          
          <form onSubmit={handleSubmit} className="p-6 sm:p-10">
            
            {/* Seção da Foto de Perfil */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20 mb-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-100 overflow-hidden shrink-0 shadow-lg">
                  {formData.fotoPerfil ? (
                    <img 
                      src={formData.fotoPerfil} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = '' }} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700">
                      <User size={48} />
                    </div>
                  )}
                </div>
                {/* Ícone sobreposto para "editar foto" */}
                <span className="absolute bottom-2 right-2 bg-primary-600 p-2 rounded-full text-white shadow-sm border-2 border-white dark:border-gray-800">
                  <Camera size={16} />
                </span>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL da Foto de Perfil
                </label>
                <input
                  type="url"
                  name="fotoPerfil"
                  value={formData.fotoPerfil}
                  onChange={handleChange}
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Coloque um link direto para uma imagem na web.</p>
              </div>
            </div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} className="text-gray-400" />
                    <span>Nome Completo</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-colors"
                />
              </div>


              {/* Endereço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-gray-400" />
                    <span>Endereço</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="endereco"
                  placeholder="Rua, Número, Cidade"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-colors"
                />
              </div>

              {/* Biografia: Ocupando a linha toda */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlignLeft size={16} className="text-gray-400" />
                    <span>Biografia / Resumo</span>
                  </div>
                </label>
                <textarea
                  name="biografia"
                  rows="4"
                  placeholder="Conte um pouco sobre você..."
                  value={formData.biografia}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white resize-y transition-colors"
                ></textarea>
              </div>

            </div>

            {/* Ações */}
            <div className="mt-8 flex justify-end border-t border-gray-100 dark:border-gray-700 pt-6">
              <button
                type="submit"
                disabled={salvando}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {salvando ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Save size={18} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}
