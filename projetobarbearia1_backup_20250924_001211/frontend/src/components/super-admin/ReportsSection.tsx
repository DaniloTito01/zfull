import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Users,
  Building2,
  ChevronDown
} from 'lucide-react';

const ReportsSection = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('revenue');

  const reportTypes = [
    { id: 'revenue', name: 'Relatório de Receita', icon: DollarSign },
    { id: 'users', name: 'Relatório de Usuários', icon: Users },
    { id: 'barbershops', name: 'Relatório de Barbearias', icon: Building2 },
    { id: 'activity', name: 'Relatório de Atividade', icon: TrendingUp },
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Receita Janeiro 2024',
      type: 'revenue',
      generatedAt: '2024-01-31 15:30',
      status: 'completed',
      fileSize: '2.3 MB'
    },
    {
      id: 2,
      name: 'Usuários Ativos Q4 2023',
      type: 'users',
      generatedAt: '2024-01-15 09:15',
      status: 'completed',
      fileSize: '1.8 MB'
    },
    {
      id: 3,
      name: 'Performance Barbearias',
      type: 'barbershops',
      generatedAt: '2024-01-10 14:20',
      status: 'pending',
      fileSize: '-'
    },
  ];

  const summaryData = {
    revenue: {
      title: 'Receita Total',
      value: 'R$ 84.500',
      change: '+12.5%',
      description: 'MRR do último mês'
    },
    users: {
      title: 'Usuários Ativos',
      value: '312',
      change: '+8.2%',
      description: 'Usuários únicos mensais'
    },
    barbershops: {
      title: 'Barbearias Ativas',
      value: '43',
      change: '+15.4%',
      description: 'Estabelecimentos ativos'
    },
    activity: {
      title: 'Engajamento',
      value: '89.2%',
      change: '+5.1%',
      description: 'Taxa de retenção'
    }
  };

  const handleGenerateReport = () => {
    console.log(`Gerando relatório: ${selectedReport} para período: ${selectedPeriod}`);
    // Aqui seria a lógica para gerar o relatório
  };

  const handleDownloadReport = (reportId: number) => {
    console.log(`Baixando relatório ID: ${reportId}`);
    // Aqui seria a lógica para baixar o relatório
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Relatórios
          </h2>
          <p className="text-muted-foreground">
            Gere e gerencie relatórios da plataforma
          </p>
        </div>
      </div>

      {/* Report Generator */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Gerar Novo Relatório</CardTitle>
          <CardDescription>
            Selecione o tipo de relatório e período desejado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleGenerateReport} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(summaryData).map(([key, data]) => (
              <div key={key} className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{data.value}</div>
                <div className="text-sm font-medium">{data.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {data.change} - {data.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
          <CardDescription>
            Histórico de relatórios gerados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Gerado em {report.generatedAt} • {report.fileSize}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                    {report.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </Badge>
                  {report.status === 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsSection;