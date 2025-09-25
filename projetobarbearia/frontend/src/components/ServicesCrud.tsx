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

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  category: string
  active: boolean
  barbershop_id: string
  created_at: string
  updated_at: string
}

interface Barbershop {
  id: string
  name: string
}

function ServicesCrud() {
  const [services, setServices] = useState<Service[]>([])
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    barbershop_id: ''
  })

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/services')
      setServices(response.data)
      setError('')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao carregar serviços')
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
    fetchServices()
    fetchBarbershops()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      }

      if (editingId) {
        await api.put(`/api/services/${editingId}`, dataToSend)
      } else {
        await api.post('/api/services', dataToSend)
      }
      await fetchServices()
      resetForm()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar serviço')
    }
  }

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      barbershop_id: service.barbershop_id
    })
    setEditingId(service.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este serviço?')) {
      try {
        await api.delete(`/api/services/${id}`)
        await fetchServices()
      } catch (error: any) {
        setError(error.response?.data?.error || 'Erro ao deletar serviço')
      }
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/api/services/${id}`, { active: !currentActive })
      await fetchServices()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao atualizar status do serviço')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      barbershop_id: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
    }
    return `${minutes}min`
  }

  if (loading) {
    return <div className="p-8">Carregando serviços...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Serviços</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Novo Serviço'}
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
            {editingId ? 'Editar Serviço' : 'Novo Serviço'}
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
              placeholder="Nome do serviço"
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />

            <textarea
              placeholder="Descrição do serviço"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />

            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Preço (R$)"
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />

            <input
              type="number"
              min="1"
              placeholder="Duração (minutos)"
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
            />

            <input
              type="text"
              placeholder="Categoria"
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
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
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duração
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    {service.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {service.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatPrice(service.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDuration(service.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(service.id, service.active)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                      service.active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {service.active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {services.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum serviço encontrado
          </div>
        )}
      </div>
    </div>
  )
}

export default ServicesCrud