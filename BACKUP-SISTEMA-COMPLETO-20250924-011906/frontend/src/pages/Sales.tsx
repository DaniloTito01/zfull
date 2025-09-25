import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Receipt, Calendar, User, DollarSign, Eye, Trash2, Loader2, AlertTriangle, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { apiService } from '@/lib/api';
import CreateSaleModal from '@/components/modals/CreateSaleModal';
import ViewSaleModal from '@/components/modals/ViewSaleModal';

const Sales = () => {
  const { currentBarbershop } = useBarbershop();

  // Production debug logs
  console.log('[SALES] Component mounted');
  console.log('[SALES] Current barbershop:', {
    id: currentBarbershop?.id,
    name: currentBarbershop?.name,
    exists: !!currentBarbershop
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Fetch sales from API with detailed logging
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['sales', currentBarbershop?.id, selectedDate],
    queryFn: async () => {
      console.log('[SALES] Query function executing...');
      console.log('[SALES] Barbershop ID:', currentBarbershop?.id);
      console.log('[SALES] Selected date:', selectedDate);
      console.log('[SALES] API Base URL:', import.meta.env.VITE_API_BASE);

      if (!currentBarbershop?.id) {
        console.log('[SALES] ERROR: No barbershop selected');
        throw new Error('No barbershop selected');
      }

      const params = selectedDate ? { date: selectedDate } : {};
      console.log('[SALES] Request params:', params);

      try {
        console.log('[SALES] Making API call...');
        const result = await apiService.sales.getAll(currentBarbershop.id, params);
        console.log('[SALES] API call successful. Result:', {
          success: result.success,
          dataLength: result.data?.length,
          pagination: result.pagination
        });
        return result;
      } catch (error) {
        console.error('[SALES] API call failed:', error);
        throw error;
      }
    },
    enabled: !!currentBarbershop?.id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Debug info - can be removed later
  if (error) {
    console.error('Sales query error:', error);
  }

  // Process sales data with logging
  const sales = salesData?.data?.map(sale => {
    console.log('[SALES] Processing sale:', sale);
    return {
      id: sale.id,
      clientName: sale.client_name,
      barber: sale.barber_name || 'Não informado',
      date: sale.sale_date || sale.created_at,
      time: sale.sale_date ? new Date(sale.sale_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      total: parseFloat(sale.total) || 0,
      paymentMethod: sale.payment_method,
      status: sale.status || 'completed',
      items: sale.items || []
    };
  }) || [];

  console.log('[SALES] Processed sales count:', sales.length);
  console.log('[SALES] Query state:', { isLoading, hasError: !!error, hasData: !!salesData });

  const filteredSales = sales.filter(sale =>
    sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.barber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewSale = (sale: any) => {
    console.log('handleViewSale called with:', sale);
    setSelectedSale(sale);
    setIsViewModalOpen(true);
  };

  const handleDeleteSale = async (sale: any) => {
    if (!confirm(`Tem certeza que deseja excluir a venda para ${sale.clientName}?`)) {
      return;
    }

    try {
      // TODO: Implement API delete call when backend endpoint is ready
      // await apiService.sales.delete(sale.id);

      // For now, show success message
      alert(`Venda para "${sale.clientName}" seria excluída (funcionalidade em desenvolvimento)`);

    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Erro ao excluir venda. Tente novamente.');
    }
  };

  const stats = {
    totalSales: filteredSales.length,
    totalRevenue: filteredSales.reduce((acc, sale) => acc + sale.total, 0),
    avgTicket: filteredSales.length > 0 ? filteredSales.reduce((acc, sale) => acc + sale.total, 0) / filteredSales.length : 0,
    cashSales: filteredSales.filter(s => s.paymentMethod === 'cash').length,
    cardSales: filteredSales.filter(s => s.paymentMethod === 'card').length,
    pixSales: filteredSales.filter(s => s.paymentMethod === 'pix').length
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
      case 'dinheiro':
        return <Banknote className="h-3 w-3 text-green-600" />;
      case 'card':
      case 'cartão':
        return <CreditCard className="h-3 w-3 text-blue-600" />;
      case 'pix':
        return <Smartphone className="h-3 w-3 text-purple-600" />;
      default:
        return <DollarSign className="h-3 w-3" />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vendas</h1>
            <p className="text-muted-foreground">
              Gerencie e visualize todas as vendas da sua barbearia
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Button>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando vendas...</span>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error && !isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vendas</h1>
            <p className="text-muted-foreground">
              Gerencie e visualize todas as vendas da sua barbearia
            </p>
          </div>
          <Button className="btn-hero" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Button>
        </div>
        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar vendas</h3>
              <p className="text-muted-foreground mb-4">
                {error.message || 'Não foi possível carregar a lista de vendas.'}
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendas</h1>
          <p className="text-muted-foreground">
            Gerencie e visualize todas as vendas da sua barbearia
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button className="btn-hero" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalSales}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {Math.round(stats.avgTicket)}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dinheiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.cashSales}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cartão/PIX</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.cardSales + stats.pixSales}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Buscar Vendas</CardTitle>
          <CardDescription>
            Encontre vendas por cliente ou barbeiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar vendas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Vendas</CardTitle>
          <CardDescription>
            {filteredSales.length} de {sales.length} vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Barbeiro</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{sale.clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <span>{sale.barber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{new Date(sale.date).toLocaleDateString('pt-BR')}</div>
                        <div className="text-xs text-muted-foreground">{sale.time}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-green-600">
                      R$ {sale.total.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm gap-2">
                      {getPaymentIcon(sale.paymentMethod)}
                      {sale.paymentMethod === 'cash' ? 'Dinheiro' :
                       sale.paymentMethod === 'card' ? 'Cartão' :
                       sale.paymentMethod === 'pix' ? 'PIX' : sale.paymentMethod}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(sale.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewSale(sale)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSale(sale)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Sale Modal */}
      <CreateSaleModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* View Sale Modal */}
      <ViewSaleModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        sale={selectedSale}
      />
    </div>
  );
};

export default Sales;