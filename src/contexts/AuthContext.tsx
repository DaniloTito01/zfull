import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_super_admin?: boolean;
  barbershop?: {
    id: string;
    name: string;
    is_active: boolean;
  };
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, isSuperAdmin?: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Inicializar o contexto verificando token salvo
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('@zbarbe:token');
        const savedUser = localStorage.getItem('@zbarbe:user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));

          // Verificar se o token ainda é válido
          try {
            await refreshUser();
          } catch (error) {
            // Token inválido, remover dados salvos
            localStorage.removeItem('@zbarbe:token');
            localStorage.removeItem('@zbarbe:user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Em caso de erro, limpar dados salvos
        localStorage.removeItem('@zbarbe:token');
        localStorage.removeItem('@zbarbe:user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, isSuperAdmin = false) => {
    try {
      setIsLoading(true);

      const endpoint = isSuperAdmin ? '/auth/super-admin/login' : '/auth/login';
      const fullUrl = `${API_BASE_URL}${endpoint}`;

      console.log('[AUTH] 🚀 Starting login process:', {
        email,
        isSuperAdmin,
        endpoint,
        fullUrl,
        API_BASE_URL,
        env_VITE_API_URL: import.meta.env.VITE_API_URL,
        env_VITE_API_BASE: import.meta.env.VITE_API_BASE
      });

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('[AUTH] 📡 Response received:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      if (!data.success || !data.data) {
        throw new Error('Resposta inválida do servidor');
      }

      const { token: authToken, user: userData } = data.data;

      // Salvar dados na localStorage
      localStorage.setItem('@zbarbe:token', authToken);
      localStorage.setItem('@zbarbe:user', JSON.stringify(userData));

      // Atualizar estado
      setToken(authToken);
      setUser(userData);

      console.log('[AUTH] Login realizado com sucesso:', userData.email);
    } catch (error) {
      console.error('[AUTH] Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        // Tentar fazer logout no servidor
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.warn('[AUTH] Erro ao fazer logout no servidor:', error);
          // Continuar com logout local mesmo em caso de erro
        }
      }

      // Limpar dados locais
      localStorage.removeItem('@zbarbe:token');
      localStorage.removeItem('@zbarbe:user');
      setToken(null);
      setUser(null);

      console.log('[AUTH] Logout realizado');
    } catch (error) {
      console.error('[AUTH] Erro no logout:', error);
      // Mesmo em caso de erro, limpar dados locais
      localStorage.removeItem('@zbarbe:token');
      localStorage.removeItem('@zbarbe:user');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!token) {
      throw new Error('Token não encontrado');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao verificar usuário');
      }

      if (!data.success || !data.data) {
        throw new Error('Resposta inválida do servidor');
      }

      // Atualizar dados do usuário
      const userData = data.data;
      setUser(userData);
      localStorage.setItem('@zbarbe:user', JSON.stringify(userData));

      console.log('[AUTH] Usuário atualizado:', userData.email);
    } catch (error) {
      console.error('[AUTH] Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  // Interceptor para requisições HTTP (adicionar token automaticamente)
  useEffect(() => {
    if (!token) return;

    const originalFetch = window.fetch;

    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input.toString();

      // Verificar se é uma requisição para a nossa API
      if (url.includes(API_BASE_URL)) {
        const headers = new Headers(init?.headers);

        // Adicionar token se não existir header Authorization
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }

        init = {
          ...init,
          headers,
        };
      }

      return originalFetch(input, init);
    };

    // Cleanup function para restaurar fetch original
    return () => {
      window.fetch = originalFetch;
    };
  }, [token]);

  const contextValue: AuthContextData = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}