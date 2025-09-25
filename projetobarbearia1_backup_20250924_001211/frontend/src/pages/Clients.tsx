import { useState } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Phone, Mail, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Client } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import CreateClientModal from '@/components/modals/CreateClientModal';
import EditClientModal from '@/components/modals/EditClientModal';
import ViewClientModal from '@/components/modals/ViewClientModal';

const Clients = () => {
  const { currentBarbershop } = useBarbershop();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Fetch clients from real API
  const { data: clientsResponse, isLoading, error } = useQuery({
    queryKey: ['clients', currentBarbershop?.id, searchTerm],
    queryFn: () => currentBarbershop ? apiService.clients.getAll(currentBarbershop.id, {
      search: searchTerm || undefined,
    }) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const clients = clientsResponse?.data || [];

  // Mutation para deletar cliente
  const deleteClientMutation = useMutation({
    mutationFn: (clientId: string) => apiService.clients.delete(clientId),
    onSuccess: () => {
      toast({
        title: "Cliente excluído com sucesso!",
        description: "O cliente foi removido da sua base de dados.",
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message || "Ocorreu um erro ao excluir o cliente.",
        variant: "destructive",
      });
    },
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Funções para controlar os modais
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedClient) {
      deleteClientMutation.mutate(selectedClient.id);
    }
  };

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    vipClients: clients.filter(c => c.total_spent > 1000).length, // VIP = mais de R$ 1000 gastos
    averageSpent: clients.length > 0 ? Math.round(clients.reduce((acc, c) => acc + c.total_spent, 0) / clients.length) : 0
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e histórico de atendimentos
          </p>
        </div>
        <Button className="btn-hero" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeClients}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes VIP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.vipClients}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {stats.averageSpent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Buscar Clientes</CardTitle>
          <CardDescription>
            Encontre clientes por nome, telefone ou email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {filteredClients.length} de {clients.length} clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Última Visita</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Total Gasto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Barbeiro Preferido</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Carregando clientes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Erro ao carregar clientes. Verifique sua conexão.
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          {client.phone}
                        </div>
                        {client.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {client.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        {client.last_visit ? new Date(client.last_visit).toLocaleDateString('pt-BR') : 'Nunca'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.total_visits} visitas</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">R$ {client.total_spent.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={client.total_spent > 1000 ? 'default' : 'secondary'}
                      >
                        {client.total_spent > 1000 ? 'VIP' : 'Ativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{client.preferred_barber_name || 'Não informado'}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Ver detalhes"
                          onClick={() => handleViewClient(client)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Editar cliente"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Excluir cliente"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClient(client)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateClientModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditClientModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        client={selectedClient}
      />

      <ViewClientModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        client={selectedClient}
        onEdit={() => {
          setIsViewModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{selectedClient?.name}</strong>?
              Esta ação não pode ser desfeita. O cliente será marcado como inativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? 'Excluindo...' : 'Excluir Cliente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;