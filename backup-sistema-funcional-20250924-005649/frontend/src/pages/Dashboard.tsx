import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Scissors,
  ArrowUpRight,
  Star,
  Plus,
  UserPlus
} from 'lucide-react';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService, BarbershopDashboard, DailySales } from '@/lib/api';

const Dashboard = () => {
  const { currentBarbershop } = useBarbershop();
  const navigate = useNavigate();

  // Fetch dashboard data from real API
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['barbershop-dashboard', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.barbershops.getDashboard(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch daily sales data for top services
  const { data: dailySalesData } = useQuery({
    queryKey: ['daily-sales', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.sales.getDaily(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id,
    refetchInterval: 60000, // Refetch every minute
  });

  // Use API data or fallback to mock data
  const stats = dashboardData?.data ? {
    todayAppointments: dashboardData.data.today_appointments,
    totalClients: dashboardData.data.total_clients,
    monthlyRevenue: dashboardData.data.today_revenue * 30, // Estimate monthly from daily
    avgRating: dashboardData.data.avg_rating,
    pendingAppointments: dashboardData.data.pending_appointments,
    completedToday: dashboardData.data.today_appointments - dashboardData.data.pending_appointments
  } : {
    todayAppointments: 12,
    totalClients: 248,
    monthlyRevenue: 15420,
    avgRating: 4.8,
    pendingAppointments: 5,
    completedToday: 7
  };

  // Use API appointments or fallback to mock data
  const recentAppointments = dashboardData?.data?.recent_appointments || [
    { id: '1', client_name: 'João Silva', service_name: 'Corte + Barba', appointment_time: '14:30', barber_name: 'Carlos', status: 'confirmed' },
    { id: '2', client_name: 'Pedro Santos', service_name: 'Corte', appointment_time: '15:00', barber_name: 'Rafael', status: 'pending' },
    { id: '3', client_name: 'Lucas Oliveira', service_name: 'Barba', appointment_time: '15:30', barber_name: 'Carlos', status: 'confirmed' },
    { id: '4', client_name: 'Miguel Costa', service_name: 'Corte + Barba', appointment_time: '16:00', barber_name: 'Rafael', status: 'completed' },
  ];

  // Use API services data or fallback to mock data
  const topServices = dailySalesData?.data?.top_services.map((service, index) => ({
    name: service.name,
    bookings: service.times_sold,
    revenue: `R$ ${Number(service.revenue || 0).toFixed(2)}`
  })) || [
    { name: 'Corte Masculino', bookings: 45, revenue: 'R$ 2.250' },
    { name: 'Corte + Barba', bookings: 32, revenue: 'R$ 1.920' },
    { name: 'Barba', bookings: 28, revenue: 'R$ 980' },
    { name: 'Corte Infantil', bookings: 15, revenue: 'R$ 525' }
  ];

  const isLoading = dashboardLoading;
  const error = dashboardError;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge-completed">Concluído</span>;
      case 'confirmed':
        return <span className="badge-confirmed">Confirmado</span>;
      case 'pending':
        return <span className="badge-pending">Pendente</span>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Bem-vindo de volta! Aqui está o resumo da sua barbearia hoje.
            </p>
          </div>
          {currentBarbershop && (
            <div className="flex items-center space-x-3 bg-white rounded-2xl px-4 py-2 shadow-soft">
              <Scissors className="h-5 w-5 text-znexo-purple" />
              <span className="font-semibold text-foreground">{currentBarbershop.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <Card className="card-znexo border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Agendamentos Hoje</CardTitle>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Calendar className="h-5 w-5 text-znexo-purple" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-znexo-purple mb-1">{stats.todayAppointments}</div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-znexo-green" />
              +2 em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card className="card-znexo border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Total de Clientes</CardTitle>
            <div className="p-2 bg-blue-50 rounded-xl">
              <Users className="h-5 w-5 text-znexo-blue" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-znexo-blue mb-1">{stats.totalClients}</div>
            <p className="text-sm text-muted-foreground">
              +12 este mês
            </p>
          </CardContent>
        </Card>

        <Card className="card-znexo border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Faturamento Mensal</CardTitle>
            <div className="p-2 bg-primary/10 rounded-xl">
              <DollarSign className="h-5 w-5 text-znexo-purple" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-znexo-purple mb-1">
              R$ {stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-znexo-green" />
              +8.2% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="card-znexo border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Avaliação Média</CardTitle>
            <div className="p-2 bg-yellow-50 rounded-xl">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-znexo-purple mb-1">{stats.avgRating}</div>
            <p className="text-sm text-muted-foreground">
              Baseado em 89 avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <Card className="card-znexo border-0 xl:col-span-2">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-foreground">Agendamentos de Hoje</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  {stats.completedToday} completados • {stats.pendingAppointments} pendentes
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                Ver todos
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center p-8 text-muted-foreground">
                  Erro ao carregar dados da API. Usando dados locais.
                </div>
              ) : recentAppointments.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3 min-w-[80px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">{appointment.appointment_time || appointment.time}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{appointment.client_name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service_name || `Serviço ID: ${appointment.service_id}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground font-medium">{appointment.barber_name || `Barbeiro: ${appointment.barber_id}`}</span>
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="card-znexo border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-foreground">Serviços Mais Populares</CardTitle>
            <CardDescription className="text-muted-foreground">Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-5">
              {topServices.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-znexo-purple">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.bookings} agendamentos</p>
                    </div>
                  </div>
                  <span className="font-bold text-znexo-blue">{service.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-znexo border-0">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-bold text-foreground">Ações Rápidas</CardTitle>
          <CardDescription className="text-muted-foreground">
            Principais ações para gerenciar sua barbearia
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Button
              variant="cta"
              className="h-24 flex-col space-y-3"
              onClick={() => navigate('/appointments')}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm font-semibold">Novo Agendamento</span>
            </Button>
            <Button
              variant="blue"
              className="h-24 flex-col space-y-3"
              onClick={() => navigate('/clients')}
            >
              <UserPlus className="h-6 w-6" />
              <span className="text-sm font-semibold">Cadastrar Cliente</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col space-y-3 border-2"
              onClick={() => navigate('/services')}
            >
              <Scissors className="h-6 w-6" />
              <span className="text-sm font-semibold">Adicionar Serviço</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col space-y-3 border-2"
              onClick={() => navigate('/pdv')}
            >
              <DollarSign className="h-6 w-6" />
              <span className="text-sm font-semibold">Registrar Venda</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;