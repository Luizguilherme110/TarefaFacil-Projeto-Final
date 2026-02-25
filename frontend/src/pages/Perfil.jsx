import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'

export default function Perfil() {
  const { usuario } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Perfil</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-700">Nome: {usuario?.nome}</p>
          <p className="text-gray-700">Email: {usuario?.email}</p>
        </div>
      </div>
    </div>
  )
}
