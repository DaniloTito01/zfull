import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  // Estados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(
    searchParams.get('type') === 'super-admin' ? 'super-admin' : 'barbershop'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email e senha são obrigatórios');
      return;
    }

    try {
      const isSuperAdmin = activeTab === 'super-admin';
      await login(email.trim(), password, isSuperAdmin);

      // Redirecionar baseado no tipo de usuário
      if (isSuperAdmin) {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ZBarbe</h1>
          <p className="text-gray-600">Sistema de Gerenciamento de Barbearias</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="barbershop" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Barbearia
                </TabsTrigger>
                <TabsTrigger value="super-admin" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Super Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="barbershop" className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-gray-900">Login da Barbearia</p>
                  <p className="text-xs text-gray-500">
                    Acesse com seu email e senha da barbearia
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="super-admin" className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-gray-900">Super Administrador</p>
                  <p className="text-xs text-gray-500">
                    Acesso administrativo completo ao sistema
                  </p>
                </div>
              </TabsContent>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>

          {activeTab === 'barbershop' && (
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link
                    to="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Entre em contato
                  </Link>
                </p>
                <p className="text-xs text-gray-500">
                  Cadastro de novas barbearias deve ser solicitado
                </p>
              </div>
            </CardFooter>
          )}

          {activeTab === 'super-admin' && (
            <CardFooter>
              <div className="text-center w-full">
                <p className="text-xs text-gray-500">
                  Acesso restrito para administradores do sistema
                </p>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Credenciais de teste */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 space-y-2">
              <p className="text-sm font-medium text-blue-900">Credenciais de Teste:</p>
              {activeTab === 'super-admin' ? (
                <div className="text-xs text-blue-700 space-y-1">
                  <p><strong>Super Admin:</strong> admin@zbarbe.com</p>
                  <p><strong>Senha:</strong> admin123</p>
                </div>
              ) : (
                <div className="text-xs text-blue-700 space-y-1">
                  <p>Entre em contato para criar sua conta</p>
                  <p>ou use o painel super admin</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}