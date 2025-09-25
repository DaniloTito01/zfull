import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MapPin, Crown, Plus } from 'lucide-react';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { useNavigate } from 'react-router-dom';

const BarbershopSelector = () => {
  const { userBarbershops, switchBarbershop } = useBarbershop();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>('');

  // Mock data - TODO: Replace with real data from userBarbershops
  const mockBarbershops = [
    {
      id: '1',
      name: 'Barbearia Central',
      address: { city: 'São Paulo', state: 'SP' },
      logo_url: '',
      plan_id: 'premium',
      is_active: true,
      owner_id: 'user-1',
      created_at: '2024-01-15',
      userRole: 'admin',
      teamSize: 8,
      lastAccess: '2 horas atrás'
    },
    {
      id: '2',
      name: 'Elite Cuts',
      address: { city: 'Rio de Janeiro', state: 'RJ' },
      logo_url: '',
      plan_id: 'basic',
      is_active: true,
      owner_id: 'user-1',
      created_at: '2023-11-20',
      userRole: 'barbeiro',
      teamSize: 4,
      lastAccess: '1 dia atrás'
    },
    {
      id: '3',
      name: 'Estilo Masculino',
      address: { city: 'Belo Horizonte', state: 'MG' },
      logo_url: '',
      plan_id: 'premium',
      is_active: true,
      owner_id: 'user-2',
      created_at: '2023-08-10',
      userRole: 'admin',
      teamSize: 12,
      lastAccess: '3 dias atrás'
    }
  ];

  const handleSelectBarbershop = (barbershop: any) => {
    switchBarbershop(barbershop.id);
    navigate('/dashboard');
  };

  const getPlanBadge = (planId: string) => {
    return planId === 'premium' ? (
      <Badge className="bg-primary/10 text-primary">
        <Crown className="w-3 h-3 mr-1" />
        Premium
      </Badge>
    ) : (
      <Badge variant="secondary">Básico</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Selecione sua Barbearia</h1>
          <p className="text-muted-foreground">
            Escolha qual barbearia você deseja acessar
          </p>
        </div>

        {/* Barbershops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBarbershops.map((barbershop) => (
            <Card
              key={barbershop.id}
              className={`card-elegant cursor-pointer transition-all hover:shadow-lg ${
                selectedId === barbershop.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedId(barbershop.id)}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  {getPlanBadge(barbershop.plan_id)}
                </div>
                
                <div className="space-y-2">
                  <CardTitle className="text-xl">{barbershop.name}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{barbershop.address?.city}, {barbershop.address?.state}</span>
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{barbershop.teamSize} membros</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {barbershop.userRole}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  Último acesso: {barbershop.lastAccess}
                </div>

                <Button
                  className="w-full btn-hero"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectBarbershop(barbershop);
                  }}
                >
                  Acessar Barbearia
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add New Barbershop Card */}
          <Card className="card-elegant border-dashed border-2 hover:border-primary/50 cursor-pointer transition-colors">
            <CardHeader className="text-center space-y-4 py-12">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg">Nova Barbearia</CardTitle>
                <CardDescription>
                  Cadastre uma nova barbearia na plataforma
                </CardDescription>
              </div>
              <Button variant="outline" className="mt-4">
                Cadastrar Barbearia
              </Button>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Resumo das suas Barbearias</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Barbearias Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-sm text-muted-foreground">Total de Membros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2</div>
              <div className="text-sm text-muted-foreground">Planos Premium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Uptime Médio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarbershopSelector;