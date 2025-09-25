import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter
} from '@/components/ui/sidebar';
import {
  Calendar,
  Users,
  Scissors,
  DollarSign,
  BarChart3,
  Settings,
  Building2,
  Crown,
  ChevronDown,
  LogOut,
  User,
  Bell,
  Package
} from 'lucide-react';
import { useBarbershop } from '@/contexts/BarbershopContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentBarbershop, userBarbershops, switchBarbershop } = useBarbershop();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Agendamentos",
      url: "/appointments",
      icon: Calendar,
    },
    {
      title: "Clientes",
      url: "/clients",
      icon: Users,
    },
    {
      title: "PDV",
      url: "/pdv",
      icon: DollarSign,
    },
    {
      title: "Barbeiros",
      url: "/barbers",
      icon: Scissors,
    },
    {
      title: "Serviços",
      url: "/services",
      icon: Scissors,
    },
    {
      title: "Produtos",
      url: "/products",
      icon: Package,
    },
    {
      title: "Vendas",
      url: "/sales",
      icon: DollarSign,
    },
    {
      title: "Relatórios",
      url: "/reports",
      icon: BarChart3,
    },
  ];

  const adminMenuItems = [
    {
      title: "Minha Barbearia",
      url: "/admin/barbershop",
      icon: Building2,
    },
    {
      title: "Usuários",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Configurações",
      url: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center space-x-2">
              <Scissors className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">BarberShop Pro</span>
            </div>
            
            {/* Barbershop Selector */}
            {currentBarbershop && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between mt-4 h-auto p-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm font-medium truncate">
                          {currentBarbershop.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Barbearia Ativa
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Suas Barbearias</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userBarbershops.map((barbershop) => (
                    <DropdownMenuItem
                      key={barbershop.id}
                      onClick={() => switchBarbershop(barbershop.id)}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{barbershop.name}</span>
                      {barbershop.id === currentBarbershop.id && (
                        <Badge variant="secondary" className="ml-2">Ativa</Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/select-barbershop')}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Ver Todas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location.pathname === item.url}
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Administração</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location.pathname === item.url}
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">João Silva</div>
                      <div className="text-xs text-muted-foreground">Admin</div>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1">
          {/* Top Bar */}
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6">
              <SidebarTrigger className="mr-4" />
              
              <div className="flex-1" />
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                
                {currentBarbershop?.plan_id === 'premium' && (
                  <Badge className="bg-primary/10 text-primary">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;