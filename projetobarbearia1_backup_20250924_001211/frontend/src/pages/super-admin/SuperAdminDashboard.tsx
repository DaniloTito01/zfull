import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Shield,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  FileText,
  Settings
} from 'lucide-react';
import ReportsSection from '@/components/super-admin/ReportsSection';
import BarbershopsSection from '@/components/super-admin/BarbershopsSection';
import UsersSection from '@/components/super-admin/UsersSection';
import SettingsSection from '@/components/super-admin/SettingsSection';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  // Mock data - TODO: Replace with real data from Supabase
  const platformStats = {
    totalBarbershops: 47,
    totalUsers: 312,
    monthlyRecurringRevenue: 84500,
    churnRate: 3.2,
    activeBarbershops: 43,
    inactiveBarbershops: 4
  };

  const recentBarbershops = [
    { 
      id: 1, 
      name: 'Barbearia do João', 
      owner: 'João Silva', 
      plan: 'Premium',
      status: 'active',
      joinedDate: '2024-01-15',
      lastActivity: '2 horas atrás'
    },
    { 
      id: 2, 
      name: 'Cortes & Estilo', 
      owner: 'Pedro Santos', 
      plan: 'Básico',
      status: 'active',
      joinedDate: '2024-01-10',
      lastActivity: '1 dia atrás'
    },
    { 
      id: 3, 
      name: 'Elite Barbershop', 
      owner: 'Carlos Lima', 
      plan: 'Premium',
      status: 'inactive',
      joinedDate: '2023-12-20',
      lastActivity: '5 dias atrás'
    },
  ];

  const platformAlerts = [
    { 
      type: 'warning', 
      message: '4 barbearias com pagamentos em atraso', 
      action: 'Revisar pagamentos'
    },
    { 
      type: 'info', 
      message: '12 novos cadastros esta semana', 
      action: 'Ver detalhes'
    },
    { 
      type: 'error', 
      message: '2 barbearias solicitaram cancelamento', 
      action: 'Processo de retenção'
    }
  ];

  const monthlyMetrics = [
    { name: 'Novas Barbearias', value: 12, change: '+15%' },
    { name: 'Cancelamentos', value: 3, change: '-25%' },
    { name: 'Upgrades de Plano', value: 8, change: '+33%' },
    { name: 'Downgrades', value: 2, change: '-50%' }
  ];

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Painel Super Admin</h1>
            </div>
            <p className="text-muted-foreground">
              Visão geral da plataforma BarberShop Pro
            </p>
          </div>
          
          <TabsList className="grid w-fit grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="barbershops">Minha Barbearia</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-8">

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Barbearias</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{platformStats.totalBarbershops}</div>
            <p className="text-xs text-muted-foreground">
              {platformStats.activeBarbershops} ativas • {platformStats.inactiveBarbershops} inativas
            </p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{platformStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +24 este mês
            </p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {platformStats.monthlyRecurringRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{platformStats.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              -0.8% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>Alertas da Plataforma</span>
          </CardTitle>
          <CardDescription>
            Ações que requerem atenção imediata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformAlerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={
                      alert.type === 'error' ? 'destructive' :
                      alert.type === 'warning' ? 'secondary' : 'outline'
                    }
                  >
                    {alert.type === 'error' && 'Crítico'}
                    {alert.type === 'warning' && 'Atenção'}
                    {alert.type === 'info' && 'Info'}
                  </Badge>
                  <span className="text-sm">{alert.message}</span>
                </div>
                <Button variant="outline" size="sm">
                  {alert.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Barbershops */}
        <Card className="card-elegant lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Barbearias Recentes
              <Button variant="outline" size="sm">
                Ver todas
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Últimas barbearias cadastradas na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBarbershops.map((barbershop) => (
                <div
                  key={barbershop.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{barbershop.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {barbershop.owner} • Plano {barbershop.plan}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{barbershop.lastActivity}</p>
                      <Badge
                        variant={barbershop.status === 'active' ? 'default' : 'secondary'}
                      >
                        {barbershop.status === 'active' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Metrics */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Métricas do Mês</CardTitle>
            <CardDescription>Principais KPIs de janeiro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyMetrics.map((metric) => (
                <div key={metric.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{metric.name}</p>
                    <p className="text-xs text-muted-foreground">{metric.change}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{metric.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Ações de Administração</CardTitle>
          <CardDescription>
            Principais ações para gerenciar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Gerenciar Barbearias</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-5 w-5" />
              <span className="text-xs">Usuários Globais</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">Planos & Preços</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Shield className="h-5 w-5" />
              <span className="text-xs">Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="reports">
          <ReportsSection />
        </TabsContent>

        <TabsContent value="barbershops">
          <BarbershopsSection />
        </TabsContent>

        <TabsContent value="users">
          <UsersSection />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;