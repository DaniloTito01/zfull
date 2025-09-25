import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Barbershop {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  plan: string;
  status: 'active' | 'inactive' | 'suspended';
  address: string;
  city: string;
  state: string;
  joinedDate: string;
  lastPayment: string;
  monthlyRevenue: number;
}

const BarbershopsSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarbershop, setEditingBarbershop] = useState<Barbershop | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      owner: '',
      email: '',
      phone: '',
      plan: 'basic',
      status: 'active',
      address: '',
      city: '',
      state: '',
    }
  });

  const [barbershops, setBarbershops] = useState<Barbershop[]>([
    {
      id: 1,
      name: 'Barbearia do João',
      owner: 'João Silva',
      email: 'joao@barbeariadojoao.com',
      phone: '(11) 99999-9999',
      plan: 'Premium',
      status: 'active',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      joinedDate: '2024-01-15',
      lastPayment: '2024-01-30',
      monthlyRevenue: 8500
    },
    {
      id: 2,
      name: 'Cortes & Estilo',
      owner: 'Pedro Santos',
      email: 'pedro@cortesestilo.com',
      phone: '(11) 88888-8888',
      plan: 'Básico',
      status: 'active',
      address: 'Av. Principal, 456',
      city: 'São Paulo',
      state: 'SP',
      joinedDate: '2024-01-10',
      lastPayment: '2024-01-28',
      monthlyRevenue: 4200
    },
    {
      id: 3,
      name: 'Elite Barbershop',
      owner: 'Carlos Lima',
      email: 'carlos@elitebarbershop.com',
      phone: '(11) 77777-7777',
      plan: 'Premium',
      status: 'suspended',
      address: 'Rua Comercial, 789',
      city: 'Rio de Janeiro',
      state: 'RJ',
      joinedDate: '2023-12-20',
      lastPayment: '2023-12-30',
      monthlyRevenue: 12000
    },
  ]);

  const filteredBarbershops = barbershops.filter(barbershop => {
    const matchesSearch = barbershop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         barbershop.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || barbershop.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSave = (data: any) => {
    if (editingBarbershop) {
      setBarbershops(barbershops.map(b => 
        b.id === editingBarbershop.id ? { ...b, ...data } : b
      ));
    } else {
      const newBarbershop: Barbershop = {
        ...data,
        id: Math.max(...barbershops.map(b => b.id)) + 1,
        joinedDate: new Date().toISOString().split('T')[0],
        lastPayment: new Date().toISOString().split('T')[0],
        monthlyRevenue: 0,
      };
      setBarbershops([...barbershops, newBarbershop]);
    }
    setIsDialogOpen(false);
    setEditingBarbershop(null);
    form.reset();
  };

  const handleEdit = (barbershop: Barbershop) => {
    setEditingBarbershop(barbershop);
    form.reset(barbershop);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setBarbershops(barbershops.filter(b => b.id !== id));
  };

  const handleNewBarbershop = () => {
    setEditingBarbershop(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativa</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativa</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspensa</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Minha Barbearia
          </h2>
          <p className="text-muted-foreground">
            Gerencie todas as barbearias da plataforma
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewBarbershop}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Barbearia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBarbershop ? 'Editar Barbearia' : 'Nova Barbearia'}
              </DialogTitle>
              <DialogDescription>
                {editingBarbershop ? 'Edite as informações da barbearia' : 'Adicione uma nova barbearia à plataforma'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Barbearia</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Barbearia do João" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proprietário</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do proprietário" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@exemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(11) 99999-9999" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Rua, número, bairro" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="São Paulo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="SP" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o plano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="basic">Básico</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativa</SelectItem>
                          <SelectItem value="inactive">Inativa</SelectItem>
                          <SelectItem value="suspended">Suspensa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingBarbershop ? 'Salvar Alterações' : 'Criar Barbearia'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="card-elegant">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou proprietário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
                <SelectItem value="suspended">Suspensas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Barbershops Table */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Barbearias ({filteredBarbershops.length})</CardTitle>
          <CardDescription>
            Lista de todas as barbearias cadastradas na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barbearia</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receita Mensal</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBarbershops.map((barbershop) => (
                <TableRow key={barbershop.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{barbershop.name}</div>
                      <div className="text-sm text-muted-foreground">{barbershop.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{barbershop.owner}</div>
                      <div className="text-sm text-muted-foreground">{barbershop.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{barbershop.city}, {barbershop.state}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={barbershop.plan === 'Premium' ? 'default' : 'secondary'}>
                      {barbershop.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(barbershop.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span>R$ {barbershop.monthlyRevenue.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(barbershop)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(barbershop.id)}
                      >
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
    </div>
  );
};

export default BarbershopsSection;