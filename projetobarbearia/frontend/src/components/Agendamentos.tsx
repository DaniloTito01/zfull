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
  client_name: string
  barber_name: string
  service_name: string
  start_time: string
  total_price: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  service_duration: number
}

interface Barber {
  id: string
  name: string
  appointments: Appointment[]
}

function Agendamentos() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedBarber, setSelectedBarber] = useState('all')
  const [viewMode, setViewMode] = useState<'grade' | 'timeline'>('grade')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [appointmentsRes, barbersRes] = await Promise.all([
        api.get('/api/appointments'),
        api.get('/api/barbers')
      ])

      setAppointments(appointmentsRes.data.appointments || [])

      // Group appointments by barber
      const barbersWithAppointments = barbersRes.data.barbers?.map((barber: any) => ({
        id: barber.id,
        name: barber.name || barber.user?.name || 'Barbeiro',
        appointments: appointmentsRes.data.appointments?.filter((apt: any) => apt.barber_id === barber.id) || []
      })) || []

      setBarbers(barbersWithAppointments)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-green-500 text-white'
      case 'in_progress':
        return 'bg-green-400 text-white'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'scheduled':
      default:
        return 'bg-orange-100 text-orange-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'completed':
        return 'Concluído'
      case 'in_progress':
        return 'Confirmado'
      case 'cancelled':
        return 'Cancelado'
      case 'scheduled':
      default:
        return 'Pendente'
    }
  }

  const todayStats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
    revenue: appointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + parseFloat(a.total_price || '0'), 0)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600">Gerencie os agendamentos da sua barbearia</p>
        </div>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <span>+</span>
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Hoje</h3>
            <div className="text-3xl font-bold text-purple-600 mb-1">{todayStats.total}</div>
            <div className="text-sm text-gray-500">agendamentos</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Concluídos</h3>
            <div className="text-3xl font-bold text-green-600 mb-1">{todayStats.completed}</div>
            <div className="text-sm text-gray-500">finalizados</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pendentes</h3>
            <div className="text-3xl font-bold text-orange-600 mb-1">{todayStats.pending}</div>
            <div className="text-sm text-gray-500">aguardando</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Faturamento</h3>
            <div className="text-3xl font-bold text-blue-600 mb-1">R$ {todayStats.revenue.toFixed(0)}</div>
            <div className="text-sm text-gray-500">hoje</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Filtros e Visualização</h3>
          <p className="text-gray-600 text-sm mb-4">Personalize a visualização dos agendamentos</p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todos os Barbeiros</option>
                {barbers.map(barber => (
                  <option key={barber.id} value={barber.id}>{barber.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-purple-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grade')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grade'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-600 hover:bg-purple-200'
                }`}
              >
                Grade
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-600 hover:bg-purple-200'
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments by Barber */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <div key={barber.id} className="bg-white rounded-lg border border-gray-200">
            {/* Barber Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">
                    {barber.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{barber.name}</h3>
                  <p className="text-sm text-gray-500">{barber.appointments.length} agendamentos</p>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            <div className="p-4 space-y-3">
              {barber.appointments.length > 0 ? (
                barber.appointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {appointment.start_time}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{appointment.client_name}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>✂️ {appointment.service_name}</span>
                        <span>{appointment.service_duration}min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">R$ {parseFloat(appointment.total_price || '0').toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Nenhum agendamento para hoje</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {barbers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📅</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-gray-500 mb-4">Comece criando seu primeiro agendamento</p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
            Novo Agendamento
          </button>
        </div>
      )}
    </div>
  )
}

export default Agendamentos