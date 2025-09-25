import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  UserPlus,
  Edit,
  Trash2,
  Search,
  Phone,
  Mail,
  Scissors,
  Star,
  Clock,
  Eye,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { apiService } from '@/lib/api';
import CreateBarberModal from '@/components/modals/CreateBarberModal';
import EditBarberModal from '@/components/modals/EditBarberModal';
import ViewBarberModal from '@/components/modals/ViewBarberModal';

interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string[];
  status: string;
  commission_rate: string;
  working_hours: any;
  created_at?: string;
  updated_at?: string;
}

const Barbers = () => {
  const { currentBarbershop } = useBarbershop();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);

  // Fetch barbers from API
  const { data: barbersData, isLoading, error } = useQuery({
    queryKey: ['barbers', currentBarbershop?.id],
    queryFn: () => apiService.barbers.getAll(currentBarbershop!.id),
    enabled: !!currentBarbershop?.id,
  });

  // Get barbers from API or fallback to empty array
  const barbers = barbersData?.data || [];

  // Handlers for modals
  const handleViewBarber = (barber: Barber) => {
    console.log('handleViewBarber called with:', barber);
    setSelectedBarber(barber);
    setIsViewModalOpen(true);
  };

  const handleEditBarber = (barber: Barber) => {
    console.log('handleEditBarber called with:', barber);
    setSelectedBarber(barber);
    setIsEditModalOpen(true);
  };

  const handleEditFromView = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteBarber = async (barber: Barber) => {
    if (!confirm(`Tem certeza que deseja excluir o barbeiro "${barber.name}"?`)) {
      return;
    }

    try {
      await apiService.barbers.delete(barber.id);

      // Show success toast
      toast({
        title: "Barbeiro excluído com sucesso!",
        description: `O barbeiro "${barber.name}" foi removido do sistema.`,
      });

      // Refresh the barbers list
      queryClient.invalidateQueries({ queryKey: ['barbers'] });

    } catch (error: any) {
      console.error('Error deleting barber:', error);
      toast({
        title: "Erro ao excluir barbeiro",
        description: error.message || "Ocorreu um erro ao excluir o barbeiro.",
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
            <h1 className="text-3xl font-bold">Barbeiros</h1>
            <p className="text-muted-foreground">
              Gerencie a equipe de barbeiros da sua barbearia
            </p>
          </div>
          <Button disabled>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Barbeiro
          </Button>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando barbeiros...</span>
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
            <h1 className="text-3xl font-bold">Barbeiros</h1>
            <p className="text-muted-foreground">
              Gerencie a equipe de barbeiros da sua barbearia
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Barbeiro
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar barbeiros</h3>
              <p className="text-muted-foreground">
                Não foi possível carregar a lista de barbeiros.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredBarbers = barbers.filter(barber =>
    barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (barber.specialty && barber.specialty.some(specialty =>
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'vacation':
        return <Badge className="bg-orange-100 text-orange-800">Férias</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Statistics
  const stats = {
    totalBarbers: barbers.length,
    activeBarbers: barbers.filter(b => b.status === 'active').length,
    averageCommission: barbers.length > 0
      ? Math.round(barbers.reduce((acc, b) => acc + parseFloat(b.commission_rate || '0'), 0) / barbers.length)
      : 0,
    onVacation: barbers.filter(b => b.status === 'vacation').length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Barbeiros</h1>
          <p className="text-muted-foreground">
            Gerencie a equipe de barbeiros da sua barbearia
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Barbeiro
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Barbeiros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalBarbers}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Barbeiros Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeBarbers}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comissão Média (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.averageCommission}%</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Férias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.onVacation}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Buscar Barbeiros</CardTitle>
          <CardDescription>
            Encontre barbeiros por nome, email ou especialidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar barbeiros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Barbers Table */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Barbeiros</CardTitle>
          <CardDescription>
            {filteredBarbers.length} de {barbers.length} barbeiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barbeiro</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBarbers.map((barber) => (
                <TableRow key={barber.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" alt={barber.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(barber.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{barber.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Desde {barber.created_at ? new Date(barber.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {barber.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {barber.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {barber.specialty && barber.specialty.length > 0 ? (
                        barber.specialty.slice(0, 2).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Não definido</span>
                      )}
                      {barber.specialty && barber.specialty.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{barber.specialty.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {barber.commission_rate}%
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(barber.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewBarber(barber)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditBarber(barber)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteBarber(barber)}>
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

      {/* Modals */}
      <CreateBarberModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditBarberModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        barber={selectedBarber}
      />

      <ViewBarberModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        barber={selectedBarber}
        onEdit={handleEditFromView}
      />
    </div>
  );
};

export default Barbers;