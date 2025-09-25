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
  preferences?: any
  loyalty_points: number
  total_visits: number
  last_visit?: string
  created_at: string
  updated_at: string
  user?: {
    name: string
    email: string
    phone?: string
  }
}

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}

function ClientsCrud() {
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    user_id: '',
    date_of_birth: '',
    preferences_notes: '',
    preferred_barbers: '',
    preferred_services: ''
  })

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/clients')
      setClients(response.data)
      setError('')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users')
      const clientUsers = response.data.filter((user: User) => user.role === 'client')
      setUsers(clientUsers)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  useEffect(() => {
    fetchClients()
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const preferences = {
        preferred_barbers: formData.preferred_barbers.split(',').map(s => s.trim()).filter(s => s),
        preferred_services: formData.preferred_services.split(',').map(s => s.trim()).filter(s => s),
        notes: formData.preferences_notes
      }

      const dataToSend = {
        user_id: formData.user_id,
        date_of_birth: formData.date_of_birth || undefined,
        preferences: Object.keys(preferences).some(key => preferences[key as keyof typeof preferences]) ? preferences : undefined
      }

      if (editingId) {
        await api.put(`/api/clients/${editingId}`, dataToSend)
      } else {
        // If creating a new client and no user selected, create a new user first
        if (!formData.user_id) {
          setError('Por favor, selecione um usuário ou crie um novo usuário primeiro')
          return
        }
        await api.post('/api/clients', dataToSend)
      }
      await fetchClients()
      resetForm()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar cliente')
    }
  }

  const handleEdit = (client: Client) => {
    setFormData({
      user_id: client.user_id,
      date_of_birth: client.date_of_birth ? client.date_of_birth.split('T')[0] : '',
      preferences_notes: client.preferences?.notes || '',
      preferred_barbers: client.preferences?.preferred_barbers?.join(', ') || '',
      preferred_services: client.preferences?.preferred_services?.join(', ') || ''
    })
    setEditingId(client.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        await api.delete(`/api/clients/${id}`)
        await fetchClients()
      } catch (error: any) {
        setError(error.response?.data?.error || 'Erro ao deletar cliente')
      }
    }
  }

  const updateLoyaltyPoints = async (id: string, points: number) => {
    const newPoints = prompt('Digite a nova pontuação:', points.toString())
    if (newPoints !== null && !isNaN(Number(newPoints))) {
      try {
        await api.put(`/api/clients/${id}`, { loyalty_points: parseInt(newPoints) })
        await fetchClients()
      } catch (error: any) {
        setError(error.response?.data?.error || 'Erro ao atualizar pontos de fidelidade')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      user_id: '',
      date_of_birth: '',
      preferences_notes: '',
      preferred_barbers: '',
      preferred_services: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const availableUsers = users.filter(user =>
    !clients.some(client => client.user_id === user.id) || editingId
  )

  if (loading) {
    return <div className="p-8">Carregando clientes...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Clientes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Novo Cliente'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.user_id}
              onChange={(e) => setFormData({...formData, user_id: e.target.value})}
            >
              <option value="">Selecione um usuário</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>

            <input
              type="date"
              placeholder="Data de nascimento"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
            />

            <textarea
              placeholder="Notas sobre preferências"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              rows={3}
              value={formData.preferences_notes}
              onChange={(e) => setFormData({...formData, preferences_notes: e.target.value})}
            />

            <input
              type="text"
              placeholder="Barbeiros preferidos (separados por vírgula)"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.preferred_barbers}
              onChange={(e) => setFormData({...formData, preferred_barbers: e.target.value})}
            />

            <input
              type="text"
              placeholder="Serviços preferidos (separados por vírgula)"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.preferred_services}
              onChange={(e) => setFormData({...formData, preferred_services: e.target.value})}
            />

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Nascimento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pontos Fidelidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Visitas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Visita
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {client.user?.name || 'Nome não encontrado'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {client.user?.email || 'Email não encontrado'}
                    </div>
                    {client.user?.phone && (
                      <div className="text-sm text-gray-500">{client.user.phone}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.date_of_birth
                    ? new Date(client.date_of_birth).toLocaleDateString('pt-BR')
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => updateLoyaltyPoints(client.id, client.loyalty_points)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    {client.loyalty_points} pontos
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.total_visits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.last_visit
                    ? new Date(client.last_visit).toLocaleDateString('pt-BR')
                    : 'Nunca'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(client)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum cliente encontrado
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientsCrud