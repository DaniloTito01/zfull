import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Receipt,
  Calendar,
  User,
  Scissors,
  Package,
  CreditCard,
  Banknote,
  Smartphone,
  Calculator,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  type: 'service' | 'product';
  barber_name?: string;
}

interface Sale {
  id: string;
  client_name: string;
  barber_name?: string;
  date: string;
  payment_method: string;
  total_amount: number;
  status: string;
  notes?: string;
  items?: SaleItem[];
  created_at?: string;
}

interface ViewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onEdit?: () => void;
}

const ViewSaleModal = ({ open, onOpenChange, sale, onEdit }: ViewSaleModalProps) => {
  if (!sale) {
    console.log('ViewSaleModal - No sale data');
    return null;
  }

  console.log('ViewSaleModal - Sale data:', sale);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Cancelada
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
      case 'dinheiro':
        return <Banknote className="h-4 w-4 text-green-600" />;
      case 'card':
      case 'cartão':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'pix':
        return <Smartphone className="h-4 w-4 text-purple-600" />;
      default:
        return <Calculator className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash': return 'Dinheiro';
      case 'card': return 'Cartão';
      case 'pix': return 'PIX';
      default: return method;
    }
  };

  const servicesTotal = sale.items?.filter(item => item.type === 'service')
    .reduce((sum, item) => sum + item.total_price, 0) || 0;

  const productsTotal = sale.items?.filter(item => item.type === 'product')
    .reduce((sum, item) => sum + item.total_price, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-xl font-semibold">Venda #{sale.id.slice(-8)}</div>
              <div className="text-sm text-muted-foreground">Detalhes da Venda</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre esta venda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Data */}
          <div className="flex items-center justify-between">
            {getStatusBadge(sale.status)}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(sale.date).toLocaleDateString('pt-BR')} às {new Date(sale.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Informações do Cliente e Barbeiro */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Informações do Atendimento</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Cliente</span>
                </div>
                <div className="text-lg font-semibold">{sale.client_name}</div>
              </div>

              {sale.barber_name && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Barbeiro</span>
                  </div>
                  <div className="text-lg font-semibold">{sale.barber_name}</div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Itens da Venda */}
          {sale.items && sale.items.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Itens da Venda</h4>

              <div className="space-y-3">
                {sale.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                        {item.type === 'service' ? (
                          <Scissors className="h-4 w-4 text-primary" />
                        ) : (
                          <Package className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.type === 'service' ? 'Serviço' : 'Produto'}
                          {item.barber_name && ` • ${item.barber_name}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {item.quantity}x R$ {Number(item.unit_price || 0).toFixed(2)}
                      </div>
                      <div className="text-sm font-semibold">
                        R$ {Number(item.total_price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Resumo Financeiro */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Resumo Financeiro</h4>

            <div className="space-y-3">
              {servicesTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    Serviços
                  </span>
                  <span>R$ {servicesTotal.toFixed(2)}</span>
                </div>
              )}

              {productsTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Produtos
                  </span>
                  <span>R$ {productsTotal.toFixed(2)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">R$ {sale.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Método de Pagamento */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Método de Pagamento</h4>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              {getPaymentIcon(sale.payment_method)}
              <div>
                <div className="font-medium">{getPaymentLabel(sale.payment_method)}</div>
                <div className="text-sm text-muted-foreground">
                  R$ {sale.total_amount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          {sale.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Observações</h4>
                <p className="text-sm leading-relaxed p-3 bg-muted/30 rounded-lg">
                  {sale.notes}
                </p>
              </div>
            </>
          )}

          {/* Informações Adicionais */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Informações da Transação</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">ID da Venda:</span>
                <div className="font-mono text-blue-900">#{sale.id.slice(-8)}</div>
              </div>
              <div>
                <span className="text-blue-700">Data/Hora:</span>
                <div className="font-semibold text-blue-900">
                  {sale.created_at ? new Date(sale.created_at).toLocaleString('pt-BR') : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              Editar Venda
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSaleModal;