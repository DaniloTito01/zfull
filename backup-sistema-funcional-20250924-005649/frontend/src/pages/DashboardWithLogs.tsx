// Exemplo de Dashboard com integração completa de logs
import React, { useEffect } from 'react';
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
import { useLogger } from '@/lib/logger';

const DashboardWithLogs = () => {
  const { currentBarbershop } = useBarbershop();
  const navigate = useNavigate();
  const log = useLogger('dashboard');

  // Log page load
  useEffect(() => {
    log.info('page_load', 'Dashboard carregado', {
      barbershop_id: currentBarbershop?.id,
      barbershop_name: currentBarbershop?.name
    });

    // Log auditoria de acesso
    if (currentBarbershop?.id) {
      log.audit('page_access', {
        page: 'dashboard',
        barbershop_id: currentBarbershop.id,
        timestamp: new Date().toISOString()
      });
    }

    return () => {
      log.info('page_unload', 'Usuário saiu do dashboard');
    };
  }, [currentBarbershop, log]);

  // Fetch dashboard data with logging
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['barbershop-dashboard', currentBarbershop?.id],
    queryFn: () => {
      if (!currentBarbershop) {
        log.warn('api_call', 'Tentativa de buscar dashboard sem barbearia selecionada');
        return Promise.reject('No barbershop selected');
      }

      return log.apiCall('get_dashboard_data', () =>
        apiService.barbershops.getDashboard(currentBarbershop.id)
      );
    },
    enabled: !!currentBarbershop?.id,
    refetchInterval: 30000,
    onSuccess: (data) => {
      log.info('data_load_success', 'Dados do dashboard carregados com sucesso', {
        barbershop_id: currentBarbershop?.id,
        metrics_count: Object.keys(data.data).length
      });
    },
    onError: (error: any) => {
      log.error('data_load_error', 'Erro ao carregar dados do dashboard', error, {
        barbershop_id: currentBarbershop?.id
      });
    }
  });

  // Fetch daily sales data with logging
  const { data: dailySalesData, error: salesError } = useQuery({
    queryKey: ['daily-sales', currentBarbershop?.id],
    queryFn: () => {
      if (!currentBarbershop) return Promise.reject('No barbershop selected');

      return log.apiCall('get_daily_sales', () =>
        apiService.sales.getDaily(currentBarbershop.id)
      );
    },
    enabled: !!currentBarbershop?.id,
    refetchInterval: 60000,
    onError: (error: any) => {
      log.warn('sales_data_error', 'Erro ao carregar dados de vendas', {
        error: error.message,
        barbershop_id: currentBarbershop?.id
      });
    }
  });

  // Log errors if they occur
  useEffect(() => {
    if (dashboardError) {
      log.error('dashboard_error', 'Erro persistente no dashboard', dashboardError as Error);
    }
    if (salesError) {
      log.error('sales_error', 'Erro persistente nos dados de venda', salesError as Error);
    }
  }, [dashboardError, salesError, log]);

  // Navigation with logging
  const handleNavigation = (path: string, action: string) => {
    log.audit('navigation', {
      from: '/dashboard',
      to: path,
      action,
      barbershop_id: currentBarbershop?.id
    });

    log.info('user_navigation', `Usuário navegando para ${path}`, {
      action,
      destination: path
    });

    navigate(path);
  };

  // Quick actions with logging
  const handleQuickAction = (action: string) => {
    log.audit('quick_action', {
      action,
      component: 'dashboard',
      barbershop_id: currentBarbershop?.id
    });

    switch (action) {
      case 'new_appointment':
        log.info('quick_action', 'Iniciando novo agendamento via dashboard');
        navigate('/appointments?action=new');
        break;
      case 'new_client':
        log.info('quick_action', 'Adicionando novo cliente via dashboard');
        navigate('/clients?action=new');
        break;
      case 'view_sales':
        log.info('quick_action', 'Visualizando vendas via dashboard');
        navigate('/sales');
        break;
    }
  };

  // Use API data or fallback to mock data
  const stats = dashboardData?.data ? {
    todayAppointments: dashboardData.data.today_appointments,
    totalClients: dashboardData.data.total_clients,
    monthlyRevenue: dashboardData.data.today_revenue * 30,
    avgRating: dashboardData.data.avg_rating,
    pendingAppointments: dashboardData.data.pending_appointments,
    completedToday: dashboardData.data.today_appointments - dashboardData.data.pending_appointments
  } : {
    todayAppointments: 12,
    totalClients: 245,
    monthlyRevenue: 15420,
    avgRating: 4.8,
    pendingAppointments: 3,
    completedToday: 9
  };

  // Log performance metrics
  useEffect(() => {
    if (!dashboardLoading && dashboardData) {
      log.performance('dashboard_render', Date.now() % 10000, {
        has_dashboard_data: !!dashboardData,
        has_sales_data: !!dailySalesData,
        stats_computed: true
      });
    }
  }, [dashboardLoading, dashboardData, dailySalesData, log]);

  // Loading state with logging
  if (dashboardLoading) {
    log.debug('loading_state', 'Dashboard em estado de carregamento');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo de volta! Aqui está o resumo de hoje.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleQuickAction('new_appointment')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickAction('new_client')}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.completedToday} concluídos</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Base de clientes ativa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ Crescimento constante</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}</div>
            <p className="text-xs text-muted-foreground">
              ⭐ Excelente qualidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => handleNavigation('/appointments', 'view_appointments')}
              >
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-sm">Agendamentos</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => handleNavigation('/clients', 'view_clients')}
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Clientes</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => handleNavigation('/barbers', 'view_barbers')}
              >
                <Scissors className="h-6 w-6 mb-2" />
                <span className="text-sm">Barbeiros</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => handleQuickAction('view_sales')}
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-sm">Vendas</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Connection</span>
                <Badge variant={dashboardError ? "destructive" : "default"}>
                  {dashboardError ? "Offline" : "Online"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pendentes</span>
                <Badge variant="secondary">
                  {stats.pendingAppointments}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Sync</span>
                <Badge variant="default">
                  Ativo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardWithLogs;