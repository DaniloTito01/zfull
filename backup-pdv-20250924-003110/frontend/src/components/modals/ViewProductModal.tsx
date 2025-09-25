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
import { DollarSign, Package, AlertTriangle, Barcode, Tag, Building } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  brand: string;
  barcode: string;
  isActive: boolean;
  soldThisMonth?: number;
}

interface ViewProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEdit?: () => void;
}

const ViewProductModal = ({ open, onOpenChange, product, onEdit }: ViewProductModalProps) => {
  if (!product) {
    console.log('ViewProductModal - No product data');
    return null;
  }

  console.log('ViewProductModal - Product data:', product);

  const profit = product.price - (product.cost || 0);
  const profitMargin = product.cost ? ((profit / product.price) * 100) : 0;

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { label: 'Sem Estoque', variant: 'destructive' as const, icon: AlertTriangle };
    }
    if (product.stock <= product.minStock) {
      return { label: 'Estoque Baixo', variant: 'secondary' as const, icon: AlertTriangle };
    }
    return { label: 'Em Estoque', variant: 'default' as const, icon: Package };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product.name}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do produto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Status */}
          <div className="flex items-center justify-between">
            <Badge variant={product.isActive ? 'default' : 'secondary'}>
              {product.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
            <Badge variant={stockStatus.variant} className="flex items-center gap-1">
              <StockIcon className="h-3 w-3" />
              {stockStatus.label}
            </Badge>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h4>
              <p className="text-sm">{product.description || 'Sem descrição'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Marca
                </h4>
                <p className="text-sm">{product.brand || 'Não informado'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Categoria
                </h4>
                <Badge variant="outline">{product.category || 'Outros'}</Badge>
              </div>
            </div>

            {product.barcode && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Barcode className="h-3 w-3" />
                  Código de Barras
                </h4>
                <p className="text-sm font-mono">{product.barcode}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Pricing Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Informações Financeiras</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Preço de Venda</span>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-3 w-3" />
                    R$ {Number(product.price || 0).toFixed(2)}
                  </div>
                </div>

                {product.cost && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Preço de Custo</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      R$ {product.cost.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {product.cost && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lucro por Unidade</span>
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign className="h-3 w-3" />
                        R$ {profit.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Margem de Lucro</span>
                      <span className="text-green-600 font-medium">{profitMargin.toFixed(1)}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Stock Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Controle de Estoque</h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{product.stock}</div>
                <div className="text-xs text-muted-foreground">Em Estoque</div>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{product.minStock}</div>
                <div className="text-xs text-muted-foreground">Estoque Mínimo</div>
              </div>

              {product.soldThisMonth !== undefined && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{product.soldThisMonth}</div>
                  <div className="text-xs text-muted-foreground">Vendas/Mês</div>
                </div>
              )}
            </div>

            {product.stock <= product.minStock && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  {product.stock === 0
                    ? 'Produto sem estoque! Reabasteça urgentemente.'
                    : 'Estoque baixo! Considere reabastecer em breve.'
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              Editar Produto
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProductModal;