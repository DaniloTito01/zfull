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

interface Appointment {
  id: string
  client_id: string
  barber_id: string
  service_id: string
  barbershop_id: string
  appointment_date: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  total_price: number
  created_at: string
  updated_at: string
  client?: { user?: { name: string; email: string } }
  barber?: { name: string }
  service?: { name: string; price: number; duration: number }
  barbershop?: { name: string }
}

interface Client {
  id: string
  user?: { name: string; email: string }
}

interface Barber {
  id: string
  name: string
  barbershop_id: string
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
  barbershop_id: string
}

interface Barbershop {
  id: string
  name: string
}

function AppointmentsCrud() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    client_id: '',
    barber_id: '',
    service_id: '',
    barbershop_id: '',
    appointment_date: '',
    appointment_time: '',
    status: 'scheduled' as 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
    notes: ''
  })

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/appointments')
      setAppointments(response.data)
      setError('')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedData = async () => {
    try {
      const [clientsRes, barbersRes, servicesRes, barbershopsRes] = await Promise.all([
        api.get('/api/clients'),
        api.get('/api/barbers'),
        api.get('/api/services'),
        api.get('/api/barbershops')
      ])

      setClients(clientsRes.data)
      setBarbers(barbersRes.data)
      setServices(servicesRes.data)
      setBarbershops(barbershopsRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error)
    }
  }

  useEffect(() => {
    fetchAppointments()
    fetchRelatedData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedService = services.find(s => s.id === formData.service_id)

      const dataToSend = {
        client_id: formData.client_id,
        barber_id: formData.barber_id,
        service_id: formData.service_id,
        barbershop_id: formData.barbershop_id,
        appointment_date: formData.appointment_date,
        start_time: formData.appointment_time,
        status: formData.status,
        notes: formData.notes || undefined
      }

      if (editingId) {
        await api.put(`/api/appointments/${editingId}`, dataToSend)
      } else {
        await api.post('/api/appointments', dataToSend)
      }
      await fetchAppointments()
      resetForm()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar agendamento')
    }
  }

  const handleEdit = (appointment: Appointment) => {
    const date = new Date(appointment.appointment_date)
    setFormData({
      client_id: appointment.client_id,
      barber_id: appointment.barber_id,
      service_id: appointment.service_id,
      barbershop_id: appointment.barbershop_id,
      appointment_date: date.toISOString().split('T')[0],
      appointment_time: date.toTimeString().slice(0, 5),
      status: appointment.status,
      notes: appointment.notes || ''
    })
    setEditingId(appointment.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      try {
        await api.delete(`/api/appointments/${id}`)
        await fetchAppointments()
      } catch (error: any) {
        setError(error.response?.data?.error || 'Erro ao deletar agendamento')
      }
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.put(`/api/appointments/${id}`, { status: newStatus })
      await fetchAppointments()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao atualizar status do agendamento')
    }
  }

  const resetForm = () => {
    setFormData({
      client_id: '',
      barber_id: '',
      service_id: '',
      barbershop_id: '',
      appointment_date: '',
      appointment_time: '',
      status: 'scheduled',
      notes: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado'
      case 'confirmed':
        return 'Confirmado'
      case 'in_progress':
        return 'Em Andamento'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const filteredBarbers = barbers.filter(barber =>
    !formData.barbershop_id || barber.barbershop_id === formData.barbershop_id
  )

  const filteredServices = services.filter(service =>
    !formData.barbershop_id || service.barbershop_id === formData.barbershop_id
  )

  if (loading) {
    return <div className="p-8">Carregando agendamentos...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Agendamentos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Novo Agendamento'}
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
            {editingId ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.barbershop_id}
              onChange={(e) => setFormData({...formData, barbershop_id: e.target.value, barber_id: '', service_id: ''})}
            >
              <option value="">Selecione uma barbearia</option>
              {barbershops.map((barbershop) => (
                <option key={barbershop.id} value={barbershop.id}>
                  {barbershop.name}
                </option>
              ))}
            </select>

            <select
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.user?.name} ({client.user?.email})
                </option>
              ))}
            </select>

            <select
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.barber_id}
              onChange={(e) => setFormData({...formData, barber_id: e.target.value})}
            >
              <option value="">Selecione um barbeiro</option>
              {filteredBarbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>

            <select
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.service_id}
              onChange={(e) => setFormData({...formData, service_id: e.target.value})}
            >
              <option value="">Selecione um serviço</option>
              {filteredServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - R$ {service.price} ({service.duration}min)
                </option>
              ))}
            </select>

            <input
              type="date"
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.appointment_date}
              onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
            />

            <input
              type="time"
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.appointment_time}
              onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
            />

            <select
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="scheduled">Agendado</option>
              <option value="confirmed">Confirmado</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <textarea
              placeholder="Observações (opcional)"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barbeiro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.client?.user?.name || 'Cliente não encontrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.barber?.name || 'Barbeiro não encontrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.service?.name || 'Serviço não encontrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-none cursor-pointer ${getStatusBadgeClass(appointment.status)}`}
                    >
                      <option value="scheduled">Agendado</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    R$ {appointment.total_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {appointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum agendamento encontrado
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentsCrud