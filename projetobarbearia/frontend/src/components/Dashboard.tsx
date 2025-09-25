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

function Dashboard() {
  const [stats, setStats] = useState({
    appointments: 0,
    clients: 0,
    barbers: 0,
    services: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [appointmentsRes, clientsRes, barbersRes, servicesRes] = await Promise.all([
        api.get('/api/appointments'),
        api.get('/api/clients'),
        api.get('/api/barbers'),
        api.get('/api/services')
      ])

      const appointments = appointmentsRes.data.appointments || []
      const completedAppointments = appointments.filter((apt: any) => apt.status === 'completed')
      const revenue = completedAppointments.reduce((sum: number, apt: any) =>
        sum + parseFloat(apt.total_price || '0'), 0
      )

      setStats({
        appointments: appointments.length,
        clients: clientsRes.data.clients?.length || 0,
        barbers: barbersRes.data.barbers?.length || 0,
        services: servicesRes.data.services?.length || 0,
        revenue
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral da sua barbearia</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Agendamentos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.appointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.clients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">✂️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Barbeiros</p>
              <p className="text-2xl font-bold text-gray-900">{stats.barbers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">🔧</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Serviços</p>
              <p className="text-2xl font-bold text-gray-900">{stats.services}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <span className="text-indigo-600 text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Faturamento</p>
              <p className="text-2xl font-bold text-gray-900">R$ {stats.revenue.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-medium text-gray-900">Novo Agendamento</p>
                <p className="text-sm text-gray-500">Agendar cliente</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-medium text-gray-900">Novo Cliente</p>
                <p className="text-sm text-gray-500">Cadastrar cliente</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-medium text-gray-900">Nova Venda</p>
                <p className="text-sm text-gray-500">Registrar venda</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-medium text-gray-900">Relatórios</p>
                <p className="text-sm text-gray-500">Ver relatórios</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos Agendamentos</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">João Silva</p>
                <p className="text-sm text-gray-500">Corte + Barba • 09:00</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Confirmado
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Pedro Santos</p>
                <p className="text-sm text-gray-500">Corte Masculino • 09:30</p>
              </div>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                Pendente
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Fernando Costa</p>
                <p className="text-sm text-gray-500">Corte + Barba • 10:00</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Confirmado
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Dia</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Agendamentos de hoje</span>
              <span className="font-semibold text-gray-900">{stats.appointments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Serviços concluídos</span>
              <span className="font-semibold text-gray-900">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Faturamento do dia</span>
              <span className="font-semibold text-gray-900">R$ {stats.revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-gray-600">Próximo agendamento</span>
              <span className="font-semibold text-gray-900">09:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard