import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Scissors,
  Package,
  Clock,
  Target,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Star,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Loader2
} from 'lucide-react';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { apiService } from '@/lib/api';

const Reports = () => {
  const { currentBarbershop } = useBarbershop();
  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch comprehensive data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-reports', currentBarbershop?.id, period],
    queryFn: () => currentBarbershop ? apiService.sales.getAll(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id,
  });

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments-reports', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.appointments.getAll(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id,
  });

  const { data: servicesData } = useQuery({
    queryKey: ['services-reports', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.services.getAll(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id,
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-reports', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.products.getAll(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id,
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients-reports', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.clients.getAll(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id,
  });

  const { data: barbersData } = useQuery({
    queryKey: ['barbers-reports', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.barbers.getAll(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id,
  });

  // Process data
  const sales = salesData?.data || [];
  const appointments = appointmentsData?.data || [];
  const services = servicesData?.data || [];
  const products = productsData?.data || [];
  const clients = clientsData?.data || [];
  const barbers = barbersData?.data || [];

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Filter data by period
    let filteredSales = sales;
    let filteredAppointments = appointments;

    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredSales = sales.filter(s => new Date(s.created_at) >= weekAgo);
      filteredAppointments = appointments.filter(a => new Date(a.appointment_date) >= weekAgo);
    } else if (period === 'month') {
      filteredSales = sales.filter(s => {
        const saleDate = new Date(s.created_at);
        return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
      });
      filteredAppointments = appointments.filter(a => {
        const appointmentDate = new Date(a.appointment_date);
        return appointmentDate.getMonth() === thisMonth && appointmentDate.getFullYear() === thisYear;
      });
    }

    // Today's stats
    const todaySales = sales.filter(s => s.created_at?.startsWith(todayStr));
    const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);

    // Financial metrics
    const totalRevenue = filteredSales.reduce((acc, sale) => acc + (sale.total_amount || 0), 0);
    const todayRevenue = todaySales.reduce((acc, sale) => acc + (sale.total_amount || 0), 0);
    const avgTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

    // Payment methods
    const paymentMethods = {
      cash: filteredSales.filter(s => s.payment_method === 'cash').length,
      card: filteredSales.filter(s => s.payment_method === 'card').length,
      pix: filteredSales.filter(s => s.payment_method === 'pix').length,
    };

    // Appointment stats
    const completedAppointments = filteredAppointments.filter(a => a.status === 'completed').length;
    const pendingAppointments = filteredAppointments.filter(a => a.status === 'pending').length;
    const confirmedAppointments = filteredAppointments.filter(a => a.status === 'confirmed').length;
    const cancelledAppointments = filteredAppointments.filter(a => a.status === 'cancelled').length;

    // Service performance
    const servicePerformance = services.map(service => {
      const serviceAppointments = filteredAppointments.filter(a => a.service_id === service.id);
      const serviceRevenue = serviceAppointments
        .filter(a => a.status === 'completed')
        .reduce((acc, a) => acc + (a.price || 0), 0);

      return {
        ...service,
        bookings: serviceAppointments.length,
        revenue: serviceRevenue,
        completionRate: serviceAppointments.length > 0
          ? (serviceAppointments.filter(a => a.status === 'completed').length / serviceAppointments.length) * 100
          : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Barber performance
    const barberPerformance = barbers.map(barber => {
      const barberAppointments = filteredAppointments.filter(a => a.barber_id === barber.id);
      const barberRevenue = barberAppointments
        .filter(a => a.status === 'completed')
        .reduce((acc, a) => acc + (a.price || 0), 0);

      return {
        ...barber,
        appointments: barberAppointments.length,
        revenue: barberRevenue,
        avgRating: 4.5, // Mock rating
        completionRate: barberAppointments.length > 0
          ? (barberAppointments.filter(a => a.status === 'completed').length / barberAppointments.length) * 100
          : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Client insights
    const clientInsights = {
      newClients: clients.filter(c => {
        if (!c.created_at) return false;
        const clientDate = new Date(c.created_at);
        if (period === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return clientDate >= weekAgo;
        } else if (period === 'month') {
          return clientDate.getMonth() === thisMonth && clientDate.getFullYear() === thisYear;
        }
        return false;
      }).length,
      vipClients: clients.filter(c => (c.total_spent || 0) > 1000).length,
      avgClientValue: clients.length > 0 ? clients.reduce((acc, c) => acc + (c.total_spent || 0), 0) / clients.length : 0
    };

    return {
      // Financial
      totalRevenue,
      todayRevenue,
      totalSales: filteredSales.length,
      todaySales: todaySales.length,
      avgTicket,
      paymentMethods,

      // Appointments
      totalAppointments: filteredAppointments.length,
      todayAppointments: todayAppointments.length,
      completedAppointments,
      pendingAppointments,
      confirmedAppointments,
      cancelledAppointments,
      appointmentCompletionRate: filteredAppointments.length > 0 ? (completedAppointments / filteredAppointments.length) * 100 : 0,

      // Performance
      servicePerformance,
      barberPerformance,
      clientInsights,

      // Growth
      uniqueClients: new Set(filteredSales.map(s => s.client_id || s.client_name)).size,
    };
  }, [sales, appointments, services, products, clients, barbers, period]);

  const isLoading = salesLoading || appointmentsLoading;

  const handleExportReport = () => {
    // Create CSV data
    const csvData = [
      ['Métrica', 'Valor'],
      ['Receita Total', `R$ ${stats.totalRevenue.toFixed(2)}`],
      ['Vendas Totais', stats.totalSales],
      ['Ticket Médio', `R$ ${stats.avgTicket.toFixed(2)}`],
      ['Agendamentos Concluídos', stats.completedAppointments],
      ['Taxa de Conclusão', `${stats.appointmentCompletionRate.toFixed(1)}%`],
      ['Clientes Únicos', stats.uniqueClients],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4 text-green-600" />;
      case 'card': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'pix': return <Smartphone className="h-4 w-4 text-purple-600" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Análises e insights do seu negócio</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando relatórios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises detalhadas e insights do seu negócio
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} className="btn-hero">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              {getTrendIcon(stats.totalRevenue)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Hoje: R$ {stats.todayRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              {getTrendIcon(stats.totalSales)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Hoje: {stats.todaySales} transações
            </p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              {getTrendIcon(stats.avgTicket)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {stats.avgTicket.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por venda
            </p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              {getTrendIcon(stats.appointmentCompletionRate)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.appointmentCompletionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Agendamentos concluídos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="barbers">Barbeiros</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Appointments Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Status dos Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Concluídos
                  </span>
                  <span className="font-semibold">{stats.completedAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Confirmados
                  </span>
                  <span className="font-semibold">{stats.confirmedAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Pendentes
                  </span>
                  <span className="font-semibold">{stats.pendingAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-600" />
                    Cancelados
                  </span>
                  <span className="font-semibold">{stats.cancelledAppointments}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Formas de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getPaymentIcon('cash')}
                    Dinheiro
                  </span>
                  <Badge variant="outline">{stats.paymentMethods.cash} vendas</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getPaymentIcon('card')}
                    Cartão
                  </span>
                  <Badge variant="outline">{stats.paymentMethods.card} vendas</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getPaymentIcon('pix')}
                    PIX
                  </span>
                  <Badge variant="outline">{stats.paymentMethods.pix} vendas</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Performance dos Serviços
              </CardTitle>
              <CardDescription>
                Ranking de serviços por receita e agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.servicePerformance.slice(0, 10).map((service, index) => (
                  <div key={service.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {service.bookings} agendamentos • {Number(service.completionRate || 0).toFixed(1)}% conclusão
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">R$ {Number(service.revenue || 0).toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">R$ {Number(service.price || 0).toFixed(2)}/unid</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="barbers" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Performance dos Barbeiros
              </CardTitle>
              <CardDescription>
                Ranking de barbeiros por receita e agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.barberPerformance.slice(0, 10).map((barber, index) => (
                  <div key={barber.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/10 text-secondary font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{barber.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{barber.appointments} agendamentos</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            {barber.avgRating}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">R$ {Number(barber.revenue || 0).toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {Number(barber.completionRate || 0).toFixed(1)}% conclusão
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Novos Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats.clientInsights.newClients}
                </div>
                <p className="text-sm text-muted-foreground">
                  No período selecionado
                </p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Clientes VIP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats.clientInsights.vipClients}
                </div>
                <p className="text-sm text-muted-foreground">
                  Mais de R$ 1.000 gastos
                </p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Valor Médio do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  R$ {stats.clientInsights.avgClientValue.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Lifetime value médio
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Composição da Receita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Dinheiro</span>
                    <span>{((stats.paymentMethods.cash / stats.totalSales) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.paymentMethods.cash / stats.totalSales) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cartão</span>
                    <span>{((stats.paymentMethods.card / stats.totalSales) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.paymentMethods.card / stats.totalSales) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>PIX</span>
                    <span>{((stats.paymentMethods.pix / stats.totalSales) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.paymentMethods.pix / stats.totalSales) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Clientes Únicos:</span>
                  <Badge variant="outline">{stats.uniqueClients}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxa de Retorno:</span>
                  <Badge variant="outline">75%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ticket Médio:</span>
                  <Badge variant="outline">R$ {stats.avgTicket.toFixed(2)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Receita Recorrente:</span>
                  <Badge variant="outline">85%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;