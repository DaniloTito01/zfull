import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
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
import { Plus, Search, Scissors, Clock, DollarSign, Edit, Trash2, Eye, Loader2, AlertTriangle } from 'lucide-react';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { apiService } from '@/lib/api';
import CreateServiceModal from '@/components/modals/CreateServiceModal';
import EditServiceModal from '@/components/modals/EditServiceModal';
import ViewServiceModal from '@/components/modals/ViewServiceModal';

const Services = () => {
  const { currentBarbershop } = useBarbershop();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Fetch services from API
  const { data: servicesData, isLoading, error } = useQuery({
    queryKey: ['services', currentBarbershop?.id],
    queryFn: () => apiService.services.getAll(currentBarbershop!.id),
    enabled: !!currentBarbershop?.id,
  });

  // Get services from API or fallback to empty array
  const services = servicesData?.data?.map(service => ({
    id: service.id,
    name: service.name,
    description: service.description || '',
    duration: service.duration,
    price: service.price,
    category: service.category || 'outros',
    isActive: service.is_active,
    totalBookings: 0 // TODO: Get from bookings data
  })) || [];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalServices: services.length,
    activeServices: services.filter(s => s.isActive).length,
    averagePrice: Math.round(services.reduce((acc, s) => acc + Number(s.price || 0), 0) / services.length),
    totalRevenue: services.reduce((acc, s) => acc + (Number(s.price || 0) * s.totalBookings), 0)
  };

  const handleViewService = (service: any) => {
    console.log('handleViewService called with:', service);
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const handleEditService = (service: any) => {
    console.log('handleEditService called with:', service);
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleEditFromView = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteService = async (service: any) => {
    if (!confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
      return;
    }

    try {
      await apiService.services.delete(service.id);

      // Show success toast
      toast({
        title: "Serviço excluído com sucesso!",
        description: `O serviço "${service.name}" foi removido do sistema.`,
      });

      // Refresh the services list
      queryClient.invalidateQueries({ queryKey: ['services'] });

    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erro ao excluir serviço",
        description: error.message || "Ocorreu um erro ao excluir o serviço.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Serviços</h1>
            <p className="text-muted-foreground">
              Gerencie os serviços oferecidos pela sua barbearia
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando serviços...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Serviços</h1>
            <p className="text-muted-foreground">
              Gerencie os serviços oferecidos pela sua barbearia
            </p>
          </div>
          <Button className="btn-hero" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar serviços</h3>
              <p className="text-muted-foreground">
                Não foi possível carregar a lista de serviços.
              </p>
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
          <h1 className="text-3xl font-bold">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pela sua barbearia
          </p>
        </div>
        <Button className="btn-hero" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalServices}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Serviços Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeServices}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Preço Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {stats.averagePrice}</div>
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
      </div>

      {/* Search */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Buscar Serviços</CardTitle>
          <CardDescription>
            Encontre serviços por nome ou categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>
            {filteredServices.length} de {services.length} serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Agendamentos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">{service.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      {service.duration} min
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm font-medium">
                      <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                      R$ {Number(service.price || 0).toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{service.totalBookings} vezes</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? 'default' : 'secondary'}>
                      {service.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewService(service)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditService(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service)}>
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

      {/* Create Service Modal */}
      <CreateServiceModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Edit Service Modal */}
      <EditServiceModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        service={selectedService}
      />

      {/* View Service Modal */}
      <ViewServiceModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        service={selectedService}
        onEdit={handleEditFromView}
      />
    </div>
  );
};

export default Services;