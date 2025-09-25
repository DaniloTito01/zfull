import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scissors, Star, Users, Calendar, BarChart3, Shield, CheckCircle } from 'lucide-react';
import barbershopHeroImage from '@/assets/barbershop-hero.jpg';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [barbershopName, setBarbershopName] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">BarberShop Pro</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Preços</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div className="space-y-8 fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Gerencie sua 
                <span className="hero-gradient bg-clip-text text-transparent"> Barbearia</span>
                <br />
                como um profissional
              </h1>
              <p className="text-xl text-muted-foreground">
                Sistema completo para gestão de barbearias. Agendamentos, clientes, vendas e relatórios em uma única plataforma.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Agendamento Online</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Gestão Financeira</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Relatórios Detalhados</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Multi-Barbearia</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="btn-hero">
                Começar Gratuitamente
              </Button>
              <Button variant="outline" size="lg">
                Ver Demonstração
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="slide-up lg:order-last">
            <div className="relative">
              <img
                src={barbershopHeroImage}
                alt="Interior moderno de barbearia profissional com design elegante"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* Auth Card Section */}
        <div className="mt-16 flex justify-center">
          <div className="slide-up max-w-md w-full">
            <Card className="card-elegant">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Acesse sua conta</CardTitle>
                <CardDescription>
                  Entre ou crie sua conta para começar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Entrar</TabsTrigger>
                    <TabsTrigger value="register">Cadastrar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <Input
                        id="email-login"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-login">Senha</Label>
                      <Input
                        id="password-login"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button className="w-full btn-hero">
                      Entrar
                    </Button>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name-register">Nome completo</Label>
                      <Input
                        id="name-register"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barbershop-name">Nome da barbearia</Label>
                      <Input
                        id="barbershop-name"
                        type="text"
                        placeholder="Nome da sua barbearia"
                        value={barbershopName}
                        onChange={(e) => setBarbershopName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-register">Email</Label>
                      <Input
                        id="email-register"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-register">Senha</Label>
                      <Input
                        id="password-register"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button className="w-full btn-hero">
                      Criar Conta
                    </Button>
                   </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Tudo que você precisa para sua barbearia</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma solução completa que cresce com o seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-elegant text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Agendamento Inteligente</CardTitle>
                <CardDescription>
                  Sistema completo de agendamentos com confirmações automáticas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-elegant text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Gestão de Clientes</CardTitle>
                <CardDescription>
                  Histórico completo, preferências e fidelização de clientes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-elegant text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Relatórios Avançados</CardTitle>
                <CardDescription>
                  Acompanhe o desempenho do seu negócio com métricas detalhadas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-elegant text-center">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Avaliações</CardTitle>
                <CardDescription>
                  Colete feedback dos clientes e melhore seus serviços
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-elegant text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Multi-Barbearia</CardTitle>
                <CardDescription>
                  Gerencie múltiplas unidades com facilidade e segurança
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-elegant text-center">
              <CardHeader>
                <Scissors className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>PDV Integrado</CardTitle>
                <CardDescription>
                  Point of Sale completo com controle de estoque
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;