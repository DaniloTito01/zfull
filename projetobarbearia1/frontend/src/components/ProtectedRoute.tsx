import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  requiredRoles?: string[];
}

export default function ProtectedRoute({
  children,
  requireSuperAdmin = false,
  requiredRoles = []
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated || !user) {
    const currentPath = location.pathname + location.search;
    const loginPath = '/login';

    // Adicionar parâmetro de redirecionamento
    const redirectParam = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';

    return <Navigate to={`${loginPath}${redirectParam}`} replace />;
  }

  // Verificar se requer super admin
  if (requireSuperAdmin && !user.is_super_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Acesso Negado</h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta área.
            É necessário ter privilégios de super administrador.
          </p>
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:underline font-medium"
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verificar roles específicas
  if (requiredRoles.length > 0 && !user.is_super_admin && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-orange-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v3m0-3h3m-3 0H9m7.5-3.5V12A7.5 7.5 0 004.5 4.5v7a.75.75 0 01-.75.75H3" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Acesso Restrito</h2>
          <p className="text-gray-600">
            Você não tem as permissões necessárias para acessar esta funcionalidade.
          </p>
          <p className="text-sm text-gray-500">
            Roles necessárias: <strong>{requiredRoles.join(', ')}</strong><br/>
            Sua role atual: <strong>{user.role}</strong>
          </p>
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:underline font-medium"
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verificar se usuário tem barbearia (exceto super admin)
  if (!user.is_super_admin && !user.barbershop?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-yellow-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-5a2 2 0 012-2h2a2 2 0 012 2v5M7 7h10M7 11h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Barbearia Não Encontrada</h2>
          <p className="text-gray-600">
            Sua conta não está associada a nenhuma barbearia ativa.
            Entre em contato com o administrador.
          </p>
          <Navigate to="/select-barbershop" replace />
        </div>
      </div>
    );
  }

  // Verificar se a barbearia está ativa (exceto super admin)
  if (!user.is_super_admin && user.barbershop && !user.barbershop.is_active) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Barbearia Inativa</h2>
          <p className="text-gray-600">
            A barbearia "{user.barbershop.name}" está temporariamente inativa.
            Entre em contato com o suporte para mais informações.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = 'mailto:suporte@zbarbe.com'}
              className="text-primary hover:underline font-medium"
            >
              Entrar em contato
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:underline"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se todas as verificações passaram, renderizar children
  return <>{children}</>;
}