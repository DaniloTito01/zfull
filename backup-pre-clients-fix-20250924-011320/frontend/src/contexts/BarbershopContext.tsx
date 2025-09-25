import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Barbershop {
  id: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  logo_url?: string;
  plan_id?: string;
  is_active: boolean;
  owner_id: string;
  created_at: string;
}

export interface BarbershopUser {
  id: string;
  barbershop_id: string;
  user_id: string;
  role: 'admin' | 'barbeiro' | 'atendente';
  created_at: string;
}

interface BarbershopContextType {
  currentBarbershop: Barbershop | null;
  userBarbershops: Barbershop[];
  userRole: string | null;
  isLoading: boolean;
  setCurrentBarbershop: (barbershop: Barbershop | null) => void;
  switchBarbershop: (barbershopId: string) => void;
  refreshBarbershops: () => Promise<void>;
}

const BarbershopContext = createContext<BarbershopContextType | undefined>(undefined);

export const useBarbershop = () => {
  const context = useContext(BarbershopContext);
  if (context === undefined) {
    throw new Error('useBarbershop must be used within a BarbershopProvider');
  }
  return context;
};

export const BarbershopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBarbershop, setCurrentBarbershop] = useState<Barbershop | null>(null);
  const [userBarbershops, setUserBarbershops] = useState<Barbershop[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const switchBarbershop = (barbershopId: string) => {
    const barbershop = userBarbershops.find(b => b.id === barbershopId);
    if (barbershop) {
      setCurrentBarbershop(barbershop);
      localStorage.setItem('selectedBarbershopId', barbershopId);
    }
  };

  const refreshBarbershops = async () => {
    console.log('[BARBERSHOP_CONTEXT] Refreshing barbershops...');
    console.log('[BARBERSHOP_CONTEXT] API Base URL:', import.meta.env.VITE_API_BASE);

    try {
      // Fetch real barbershops from API
      const url = `${import.meta.env.VITE_API_BASE}/api/barbershops`;
      console.log('[BARBERSHOP_CONTEXT] Fetching from:', url);
      const response = await fetch(url);
      const result = await response.json();

      if (result.success && result.data) {
        const barbershops: Barbershop[] = result.data.map((bb: any) => ({
          id: bb.id,
          name: bb.name,
          address: bb.address || {},
          logo_url: bb.logo_url,
          plan_id: bb.plan_id || 'basic',
          is_active: bb.is_active,
          owner_id: bb.owner_id || 'user-001', // fallback for missing owner_id
          created_at: bb.created_at
        }));

        setUserBarbershops(barbershops);
        setUserRole('admin');

        // Auto-select first barbershop if none selected
        const savedBarbershopId = localStorage.getItem('selectedBarbershopId');
        const barbershopToSelect = savedBarbershopId
          ? barbershops.find(b => b.id === savedBarbershopId) || barbershops[0]
          : barbershops[0];

        if (barbershopToSelect) {
          setCurrentBarbershop(barbershopToSelect);
          localStorage.setItem('selectedBarbershopId', barbershopToSelect.id);
        }
      } else {
        console.error('Failed to fetch barbershops:', result.error);
        // Fallback to mock data if API fails - using real database IDs
        const fallbackBarbershops: Barbershop[] = [
          {
            id: '33d1f7b1-b9b5-428f-837d-9a032c909db7',
            name: 'Barbearia Clássica',
            address: {
              street: 'Rua das Flores, 123',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567'
            },
            logo_url: null,
            plan_id: 'premium',
            is_active: true,
            owner_id: 'user-001',
            created_at: '2025-09-21T17:57:16.208Z'
          }
        ];
        setUserBarbershops(fallbackBarbershops);
        setUserRole('admin');
        if (fallbackBarbershops[0]) {
          setCurrentBarbershop(fallbackBarbershops[0]);
          localStorage.setItem('selectedBarbershopId', fallbackBarbershops[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching barbershops:', error);
      // Fallback to hardcoded UUID if everything fails - using real database IDs
      const fallbackBarbershops: Barbershop[] = [
        {
          id: '33d1f7b1-b9b5-428f-837d-9a032c909db7',
          name: 'Barbearia Clássica',
          address: {
            street: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567'
          },
          logo_url: null,
          plan_id: 'premium',
          is_active: true,
          owner_id: 'user-001',
          created_at: '2025-09-21T17:57:16.208Z'
        }
      ];
      setUserBarbershops(fallbackBarbershops);
      setUserRole('admin');
      if (fallbackBarbershops[0]) {
        setCurrentBarbershop(fallbackBarbershops[0]);
        localStorage.setItem('selectedBarbershopId', fallbackBarbershops[0].id);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    // Initialize barbershops on component mount
    refreshBarbershops();
  }, []);

  return (
    <BarbershopContext.Provider
      value={{
        currentBarbershop,
        userBarbershops,
        userRole,
        isLoading,
        setCurrentBarbershop,
        switchBarbershop,
        refreshBarbershops,
      }}
    >
      {children}
    </BarbershopContext.Provider>
  );
};