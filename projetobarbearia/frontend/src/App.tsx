import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.zbarbe.zenni-ia.com.br'

const api = axios.create({
  baseURL: API_BASE
})

function Sidebar({ currentUser }: { currentUser: any }) {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/agendamentos', icon: '📅', label: 'Agendamentos' },
    { path: '/clientes', icon: '👥', label: 'Clientes' },
    { path: '/pdv', icon: '💰', label: 'PDV' },
    { path: '/barbeiros', icon: '✂️', label: 'Barbeiros' },
    { path: '/servicos', icon: '🔧', label: 'Serviços' },
    { path: '/produtos', icon: '🧴', label: 'Produtos' },
    { path: '/vendas', icon: '💳', label: 'Vendas' },
    { path: '/relatorios', icon: '📈', label: 'Relatórios' }
  ]

  const adminItems = [
    { path: '/minha-barbearia', icon: '🏢', label: 'Minha Barbearia' },
    { path: '/usuarios', icon: '👤', label: 'Usuários' },
    { path: '/configuracoes', icon: '⚙️', label: 'Configurações' }
  ]

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">✂️</span>
          </div>
          <span className="text-xl font-bold text-gray-900">BarberShop Pro</span>
        </div>
      </div>

      {/* Menu Principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Menu Principal
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Administração */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Administração
          </h3>
          <nav className="space-y-1">
            {adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 text-sm">👤</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState({
    appointments: 0,
    barbershops: 0,
    services: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/data')
      const data = response.data

      setStats({
        appointments: data.appointments?.length || 0,
        barbershops: data.barbershops?.length || 0,
        services: data.services?.length || 0,
        revenue: data.metrics?.total_revenue_month || 0
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
              <span className="text-purple-600 text-xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Barbearias</p>
              <p className="text-2xl font-bold text-gray-900">{stats.barbershops}</p>
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

      {/* Content */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sistema BarberShop Pro</h2>
        <p className="text-gray-600 mb-6">Sistema funcionando perfeitamente! Use o menu lateral para navegar.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📅 Agendamentos</h3>
            <p className="text-sm text-gray-600">Gerencie agendamentos dos clientes</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">👥 Clientes</h3>
            <p className="text-sm text-gray-600">Cadastro e fidelidade</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">✂️ Barbeiros</h3>
            <p className="text-sm text-gray-600">Equipe de profissionais</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Agendamentos() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/api/data')
      setAppointments(response.data.appointments || [])
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
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
            <div className="text-3xl font-bold text-purple-600 mb-1">{appointments.length}</div>
            <div className="text-sm text-gray-500">agendamentos</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Concluídos</h3>
            <div className="text-3xl font-bold text-green-600 mb-1">2</div>
            <div className="text-sm text-gray-500">finalizados</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pendentes</h3>
            <div className="text-3xl font-bold text-orange-600 mb-1">3</div>
            <div className="text-sm text-gray-500">aguardando</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Faturamento</h3>
            <div className="text-3xl font-bold text-blue-600 mb-1">R$ 70</div>
            <div className="text-sm text-gray-500">hoje</div>
          </div>
        </div>
      </div>

      {/* Agendamentos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agendamentos de Hoje</h2>

        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment: any) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.client_name}</p>
                    <p className="text-sm text-gray-500">{appointment.service_id} • {appointment.time}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">R$ {parseFloat(appointment.price || '0').toFixed(2)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pendente' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status === 'confirmado' ? 'Confirmado' :
                       appointment.status === 'pendente' ? 'Pendente' : appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum agendamento para hoje</p>
          </div>
        )}
      </div>
    </div>
  )
}

function GenericPage({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-purple-600 text-2xl">{icon}</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
      </div>
    </div>
  )
}

function Layout({ children, currentUser }: { children: React.ReactNode, currentUser: any }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentUser={currentUser} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}


function App() {
  const currentUser = { name: 'Admin BarberShop Pro' }

  return (
    <Router>
      <div className="App">
        <Layout currentUser={currentUser}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/clientes" element={<GenericPage title="Clientes" description="Gerencie sua base de clientes" icon="👥" />} />
            <Route path="/pdv" element={<GenericPage title="PDV" description="Ponto de venda" icon="💰" />} />
            <Route path="/barbeiros" element={<GenericPage title="Barbeiros" description="Gerencie os barbeiros da sua equipe" icon="✂️" />} />
            <Route path="/servicos" element={<GenericPage title="Serviços" description="Gerencie os serviços oferecidos" icon="🔧" />} />
            <Route path="/produtos" element={<GenericPage title="Produtos" description="Gerencie o estoque de produtos" icon="🧴" />} />
            <Route path="/vendas" element={<GenericPage title="Vendas" description="Histórico de vendas e faturamento" icon="💳" />} />
            <Route path="/relatorios" element={<GenericPage title="Relatórios" description="Relatórios e análises" icon="📈" />} />
            <Route path="/minha-barbearia" element={<GenericPage title="Minha Barbearia" description="Configurações da barbearia" icon="🏢" />} />
            <Route path="/usuarios" element={<GenericPage title="Usuários" description="Gerenciamento de usuários do sistema" icon="👤" />} />
            <Route path="/configuracoes" element={<GenericPage title="Configurações" description="Configurações gerais do sistema" icon="⚙️" />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  )
}

export default App