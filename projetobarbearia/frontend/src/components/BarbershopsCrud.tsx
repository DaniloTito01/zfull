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

interface Barbershop {
  id: string
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

function BarbershopsCrud() {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: ''
  })

  const fetchBarbershops = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/barbershops')
      setBarbershops(response.data)
      setError('')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao carregar barbearias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBarbershops()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/api/barbershops/${editingId}`, formData)
      } else {
        await api.post('/api/barbershops', formData)
      }
      await fetchBarbershops()
      resetForm()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar barbearia')
    }
  }

  const handleEdit = (barbershop: Barbershop) => {
    setFormData({
      name: barbershop.name,
      cnpj: barbershop.cnpj || '',
      email: barbershop.email || '',
      phone: barbershop.phone || '',
      address: barbershop.address || '',
      city: barbershop.city || '',
      state: barbershop.state || '',
      postal_code: barbershop.postal_code || ''
    })
    setEditingId(barbershop.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta barbearia?')) {
      try {
        await api.delete(`/api/barbershops/${id}`)
        await fetchBarbershops()
      } catch (error: any) {
        setError(error.response?.data?.error || 'Erro ao deletar barbearia')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      cnpj: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="p-8">Carregando barbearias...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Barbearias</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Nova Barbearia'}
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
            {editingId ? 'Editar Barbearia' : 'Nova Barbearia'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome da barbearia"
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="CNPJ"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.cnpj}
              onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
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
              placeholder="Endereço"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
            <input
              type="text"
              placeholder="Cidade"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            />
            <input
              type="text"
              placeholder="Estado (UF)"
              maxLength={2}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
            />
            <input
              type="text"
              placeholder="CEP"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.postal_code}
              onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
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
                CNPJ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cidade
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
            {barbershops.map((barbershop) => (
              <tr key={barbershop.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {barbershop.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {barbershop.cnpj || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {barbershop.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {barbershop.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {barbershop.city || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    barbershop.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {barbershop.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(barbershop)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(barbershop.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {barbershops.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma barbearia encontrada
          </div>
        )}
      </div>
    </div>
  )
}

export default BarbershopsCrud