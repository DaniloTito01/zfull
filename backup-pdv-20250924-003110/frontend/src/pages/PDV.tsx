import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Calculator,
  CreditCard,
  Banknote,
  Receipt,
  Search,
  Scissors,
  Package,
  Loader2,
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  Smartphone,
  PrinterIcon,
  RefreshCw
} from 'lucide-react';

// Interface definitions
interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity?: number;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  is_active: boolean;
}

interface Barber {
  id: string;
  name: string;
  specialties?: string[];
  is_active: boolean;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: 'service' | 'product';
  quantity: number;
  duration?: number;
  stock_quantity?: number;
}

interface Sale {
  id?: string;
  barbershop_id: string;
  barber_id: string;
  client_id?: string;
  client_name?: string;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'pix';
  notes?: string;
  items: {
    type: 'service' | 'product';
    service_id?: string;
    product_id?: string;
    quantity: number;
    unit_price: number;
  }[];
}

const PDV = () => {
  const { currentBarbershop } = useBarbershop();
  const queryClient = useQueryClient();

  // State management
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'card' | 'pix' | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [newClientName, setNewClientName] = useState('');
  const [showNewClientInput, setShowNewClientInput] = useState(false);

  // Fetch real data from APIs
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['services', currentBarbershop?.id],
    queryFn: () => apiService.services.getAll(currentBarbershop!.id),
    enabled: !!currentBarbershop?.id
  });

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', currentBarbershop?.id],
    queryFn: () => apiService.products.getAll(currentBarbershop!.id),
    enabled: !!currentBarbershop?.id
  });

  const { data: barbersData, isLoading: barbersLoading, error: barbersError } = useQuery({
    queryKey: ['barbers', currentBarbershop?.id],
    queryFn: () => apiService.barbers.getAll(currentBarbershop!.id),
    enabled: !!currentBarbershop?.id
  });

  const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useQuery({
    queryKey: ['clients', currentBarbershop?.id],
    queryFn: () => apiService.clients.getAll(currentBarbershop!.id),
    enabled: !!currentBarbershop?.id
  });

  // Process API data
  const services: Service[] = servicesData?.data?.filter(s => s.is_active) || [];
  const products: Product[] = productsData?.data?.filter(p => p.is_active && (p.stock_quantity || 0) > 0) || [];
  const barbers: Barber[] = barbersData?.data?.filter(b => b.is_active) || [];
  const clients: Client[] = clientsData?.data || [];

  // Filter items based on search term
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading states
  const isLoading = servicesLoading || productsLoading || barbersLoading || clientsLoading;
  const hasErrors = servicesError || productsError || barbersError || clientsError;

  const addToCart = (item: Service | Product, type: 'service' | 'product') => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    // Check stock for products
    if (type === 'product') {
      const product = item as Product;
      const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
      if (currentQuantityInCart >= (product.stock_quantity || 0)) {
        toast.error('Quantidade excede o estoque disponível');
        return;
      }
    }

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      const cartItem: CartItem = {
        id: item.id,
        name: item.name,
        price: Number(item.price || 0),
        category: type,
        quantity: 1,
        duration: type === 'service' ? (item as Service).duration : undefined,
        stock_quantity: type === 'product' ? (item as Product).stock_quantity : undefined
      };
      setCart([...cart, cartItem]);
    }

    toast.success(`${item.name} adicionado ao carrinho`);
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;

        // Check stock limits for products
        if (item.category === 'product' && newQuantity > (item.stock_quantity || 0)) {
          toast.error('Quantidade excede o estoque disponível');
          return item;
        }

        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    const item = cart.find(item => item.id === id);
    setCart(cart.filter(item => item.id !== id));
    toast.success(`${item?.name} removido do carrinho`);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (Number(item.price || 0) * item.quantity), 0);
  };

  const finalizeSale = async () => {
    if (cart.length === 0) {
      toast.error('Adicione itens ao carrinho');
      return;
    }

    if (!selectedBarber) {
      toast.error('Selecione um barbeiro');
      return;
    }

    if (!selectedPayment) {
      toast.error('Selecione a forma de pagamento');
      return;
    }

    if (!currentBarbershop) {
      toast.error('Barbearia não selecionada');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare sale data
      const saleData: Sale = {
        barbershop_id: currentBarbershop.id,
        barber_id: selectedBarber,
        client_id: selectedClient || undefined,
        client_name: showNewClientInput ? newClientName : undefined,
        total_amount: getTotal(),
        payment_method: selectedPayment,
        notes: notes || undefined,
        items: cart.map(item => ({
          type: item.category,
          service_id: item.category === 'service' ? item.id : undefined,
          product_id: item.category === 'product' ? item.id : undefined,
          quantity: item.quantity,
          unit_price: item.price
        }))
      };

      // Create sale via API
      const response = await apiService.sales.create(saleData);

      if (response.success) {
        // Prepare receipt data
        const receiptData: Sale = {
          ...saleData,
          id: response.data.id
        };

        setLastSale(receiptData);

        // Reset form
        setCart([]);
        setSelectedBarber('');
        setSelectedClient('');
        setSelectedPayment('');
        setNotes('');
        setNewClientName('');
        setShowNewClientInput(false);
        setShowReceipt(true);

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });

        toast.success('Venda finalizada com sucesso!');
      } else {
        toast.error('Erro ao finalizar venda');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Erro ao finalizar venda. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Carrinho limpo');
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'card': return 'Cartão';
      case 'pix': return 'PIX';
      default: return method;
    }
  };

  const printReceipt = () => {
    window.print();
  };

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PDV - Ponto de Venda</h1>
            <p className="text-muted-foreground">Gerencie vendas de serviços e produtos</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Carregando dados do PDV...</p>
          </div>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (hasErrors) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PDV - Ponto de Venda</h1>
            <p className="text-muted-foreground">Gerencie vendas de serviços e produtos</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-destructive font-medium">Erro ao carregar dados</p>
            <p className="text-muted-foreground">Verifique sua conexão e tente novamente.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PDV - Ponto de Venda</h1>
          <p className="text-muted-foreground">Gerencie vendas de serviços e produtos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products and Services */}
        <div className="lg:col-span-2 space-y-4">
          {/* Services Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Serviços
              </CardTitle>
              <CardDescription>
                Selecione os serviços para adicionar à venda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-primary" />
                          <h3 className="font-medium text-sm">{service.name}</h3>
                        </div>
                        <Badge variant="default">serviço</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          R$ {Number(service.price || 0).toFixed(2)}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => addToCart(service, 'service')}
                        className="w-full mt-3"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos
              </CardTitle>
              <CardDescription>
                Selecione os produtos para adicionar à venda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-secondary" />
                          <h3 className="font-medium text-sm">{product.name}</h3>
                        </div>
                        <Badge variant="secondary">produto</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          R$ {Number(product.price || 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Estoque: {product.stock_quantity}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => addToCart(product, 'product')}
                        className="w-full mt-3"
                        size="sm"
                        disabled={(product.stock_quantity || 0) === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {(product.stock_quantity || 0) === 0 ? 'Sem Estoque' : 'Adicionar'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Carrinho vazio
                </p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          R$ {Number(item.price || 0).toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">R$ {getTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Finalizar Venda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barber">Barbeiro *</Label>
                <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o barbeiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id.toString()}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Cliente (opcional)</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Forma de Pagamento *</Label>
                <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">
                      <span className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Dinheiro
                      </span>
                    </SelectItem>
                    <SelectItem value="cartao">
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Cartão
                      </span>
                    </SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={finalizeSale} 
                className="w-full" 
                size="lg"
                disabled={cart.length === 0}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Finalizar Venda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Comprovante de Venda</DialogTitle>
            <DialogDescription>
              Venda realizada com sucesso
            </DialogDescription>
          </DialogHeader>
          
          {lastSale && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="font-bold">BarberShop Pro</h3>
                <p className="text-sm text-muted-foreground">
                  {lastSale.date}
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p><strong>Barbeiro:</strong> {lastSale.barber}</p>
                <p><strong>Cliente:</strong> {lastSale.client}</p>
                <p><strong>Pagamento:</strong> {lastSale.paymentMethod}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                {lastSale.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(Number(item.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>R$ {lastSale.total.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowReceipt(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDV;