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

interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'admin' | 'barber' | 'client'
  avatar?: string
  created_at: string
  updated_at: string
  active: boolean
}

function UsersCrud() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'client' as 'admin' | 'barber' | 'client',
    avatar: ''
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/users')
      setUsers(response.data)
      setError('')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToSend = { ...formData }

      if (editingId) {
        if (!dataToSend.password) {
          delete dataToSend.password
        }
        await api.put(`/api/users/${editingId}`, dataToSend)
      } else {
        if (!dataToSend.password) {
          setError('Senha é obrigatória para novos usuários')
          return
        }
        await api.post('/api/users/register', dataToSend)
      }
      await fetchUsers()
      resetForm()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar usuário')
    }
  }

  const handleEdit = (user: User) => {
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || ''
    })
    setEditingId(user.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await api.delete(`/api/users/${id}`)
        await fetchUsers()
      } catch (error: any) {
        setError(error.response?.data?.error || 'Erro ao deletar usuário')
      }
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/api/users/${id}`, { active: !currentActive })
      await fetchUsers()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao atualizar status do usuário')
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      role: 'client',
      avatar: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'barber':
        return 'bg-blue-100 text-blue-800'
      case 'client':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'barber':
        return 'Barbeiro'
      case 'client':
        return 'Cliente'
      default:
        return role
    }
  }

  if (loading) {
    return <div className="p-8">Carregando usuários...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Novo Usuário'}
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
            {editingId ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome completo"
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />

            <input
              type="email"
              placeholder="Email"
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />

            <input
              type="password"
              placeholder={editingId ? "Nova senha (deixe vazio para manter)" : "Senha"}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />

            <input
              type="tel"
              placeholder="Telefone (opcional)"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />

            <select
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as any})}
            >
              <option value="client">Cliente</option>
              <option value="barber">Barbeiro</option>
              <option value="admin">Administrador</option>
            </select>

            <input
              type="url"
              placeholder="URL do avatar (opcional)"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.avatar}
              onChange={(e) => setFormData({...formData, avatar: e.target.value})}
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
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Papel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cadastrado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.avatar && (
                      <img className="h-10 w-10 rounded-full mr-3" src={user.avatar} alt="" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(user.id, user.active)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                      user.active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {user.active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum usuário encontrado
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersCrud