import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.zbarbe.zenni-ia.com.br'

const api = axios.create({
  baseURL: API_BASE
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface Client {
  id: string
  user_id: string
  date_of_birth?: string
  loyalty_points: number
  total_visits: number
  last_visit?: string
  user?: {
    name: string
    email: string
    phone?: string
  }
}

function Clientes() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/clients')
      setClients(response.data.clients || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const filteredClients = clients.filter(client =>
    client.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie sua base de clientes</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <span>+</span>
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-lg">
                    {client.user?.name?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{client.user?.name || 'Nome não informado'}</h3>
                  <p className="text-sm text-gray-500">{client.user?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pontos de fidelidade:</span>
                <span className="font-medium text-purple-600">{client.loyalty_points}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total de visitas:</span>
                <span className="font-medium">{client.total_visits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Última visita:</span>
                <span className="font-medium">
                  {client.last_visit
                    ? new Date(client.last_visit).toLocaleDateString('pt-BR')
                    : 'Nunca'
                  }
                </span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
                Editar
              </button>
              <button className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">👥</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? 'Tente ajustar os termos da busca'
              : 'Comece cadastrando seu primeiro cliente'
            }
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
            Novo Cliente
          </button>
        </div>
      )}
    </div>
  )
}

export default Clientes