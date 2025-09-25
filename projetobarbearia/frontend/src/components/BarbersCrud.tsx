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

interface Barber {
  id: string
  barbershop_id: string
  name: string
  email?: string
  phone?: string
  specialties: string[]
  status: 'active' | 'inactive' | 'vacation'
  rating: number
  work_schedule?: any
  hire_date?: string
  address?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Barbershop {
  id: string
  name: string
}

function BarbersCrud() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    barbershop_id: '',
    name: '',
    email: '',
    phone: '',
    specialties: '',
    status: 'active' as 'active' | 'inactive' | 'vacation',
    hire_date: '',
    address: '',
    avatar_url: ''
  })

  const fetchBarbers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/barbers')
      setBarbers(response.data)
      setError('')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao carregar barbeiros')
    } finally {
      setLoading(false)
    }
  }

  const fetchBarbershops = async () => {
    try {
      const response = await api.get('/api/barbershops')
      setBarbershops(response.data)
    } catch (error) {
      console.error('Erro ao carregar barbearias:', error)
    }
  }

  useEffect(() => {
    fetchBarbers()
    fetchBarbershops()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToSend = {
        user_id: formData.barbershop_id ? undefined : formData.barbershop_id, // Only for new barbers
        barbershop_id: formData.barbershop_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
        status: formData.status,
        hire_date: formData.hire_date || undefined,
        address: formData.address,
        avatar_url: formData.avatar_url,
        schedule: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '08:00', end: '16:00' }
        }
      }

      if (editingId) {
        await api.put(`/api/barbers/${editingId}`, dataToSend)
      } else {
        // For new barbers, we need to create a user first
        const userResponse = await api.post('/api/users/register', {
          email: formData.email,
          password: '123456', // Default password
          name: formData.name,
          phone: formData.phone,
          role: 'barber'
        })
        dataToSend.user_id = userResponse.data.id
        await api.post('/api/barbers', dataToSend)
      }
      await fetchBarbers()
      resetForm()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar barbeiro')
    }
  }

  const handleEdit = (barber: Barber) => {
    setFormData({
      barbershop_id: barber.barbershop_id,
      name: barber.name,
      email: barber.email || '',
      phone: barber.phone || '',
      specialties: barber.specialties.join(', '),
      status: barber.status,
      hire_date: barber.hire_date ? barber.hire_date.split('T')[0] : '',
      address: barber.address || '',
      avatar_url: barber.avatar_url || ''
    })
    setEditingId(barber.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este barbeiro?')) {
      try {
        await api.delete(`/api/barbers/${id}`)
        await fetchBarbers()
      } catch (error: any) {
        setError(error.response?.data?.error || 'Erro ao deletar barbeiro')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      barbershop_id: '',
      name: '',
      email: '',
      phone: '',
      specialties: '',
      status: 'active',
      hire_date: '',
      address: '',
      avatar_url: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="p-8">Carregando barbeiros...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Barbeiros</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Novo Barbeiro'}
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
            {editingId ? 'Editar Barbeiro' : 'Novo Barbeiro'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.barbershop_id}
              onChange={(e) => setFormData({...formData, barbershop_id: e.target.value})}
            >
              <option value="">Selecione uma barbearia</option>
              {barbershops.map((barbershop) => (
                <option key={barbershop.id} value={barbershop.id}>
                  {barbershop.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Nome do barbeiro"
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />

            <input
              type="email"
              placeholder="Email"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />

            <input
              type="tel"
              placeholder="Telefone"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />

            <input
              type="text"
              placeholder="Especialidades (separadas por vírgula)"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              value={formData.specialties}
              onChange={(e) => setFormData({...formData, specialties: e.target.value})}
            />

            <select
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="vacation">Férias</option>
            </select>

            <input
              type="date"
              placeholder="Data de contratação"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.hire_date}
              onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
            />

            <input
              type="text"
              placeholder="Endereço"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />

            <input
              type="url"
              placeholder="URL do avatar"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              value={formData.avatar_url}
              onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
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
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Especialidades
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avaliação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {barbers.map((barber) => (
              <tr key={barber.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {barber.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {barber.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {barber.phone || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {barber.specialties.join(', ') || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    barber.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : barber.status === 'vacation'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {barber.status === 'active' ? 'Ativo' : barber.status === 'vacation' ? 'Férias' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {barber.rating}/5
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(barber)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(barber.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {barbers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum barbeiro encontrado
          </div>
        )}
      </div>
    </div>
  )
}

export default BarbersCrud