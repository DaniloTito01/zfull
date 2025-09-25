import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiService } from '@/lib/api';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

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
}

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const EditProductModal = ({ open, onOpenChange, product }: EditProductModalProps) => {
  const { currentBarbershop } = useBarbershop();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sell_price: '',
    cost_price: '',
    current_stock: '',
    min_stock: '',
    category: '',
    brand: '',
    barcode: '',
    is_active: true
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      console.log('EditProductModal - Product data:', product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        sell_price: (product.price || 0).toString(),
        cost_price: (product.cost || 0).toString(),
        current_stock: (product.stock || 0).toString(),
        min_stock: (product.minStock || 0).toString(),
        category: product.category || '',
        brand: product.brand || '',
        barcode: product.barcode || '',
        is_active: product.isActive ?? true
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBarbershop?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma barbearia selecionada",
        variant: "destructive",
      });
      return;
    }

    if (!product?.id) {
      toast({
        title: "Erro",
        description: "Produto não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.sell_price || !formData.current_stock) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        sell_price: parseFloat(formData.sell_price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        current_stock: parseInt(formData.current_stock),
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : undefined,
        category: formData.category,
        brand: formData.brand,
        barcode: formData.barcode,
        is_active: formData.is_active
      };

      const response = await apiService.products.update(product.id, productData);

      toast({
        title: "Sucesso!",
        description: "Produto atualizado com sucesso",
      });

      // Refresh the products list
      queryClient.invalidateQueries({ queryKey: ['products'] });

      onOpenChange(false);

    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Atualize as informações do produto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Pomada para Cabelo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Ex: Barba Brava"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pomada">Pomada</SelectItem>
                  <SelectItem value="shampoo">Shampoo</SelectItem>
                  <SelectItem value="condicionador">Condicionador</SelectItem>
                  <SelectItem value="oleo">Óleo</SelectItem>
                  <SelectItem value="cera">Cera</SelectItem>
                  <SelectItem value="gel">Gel</SelectItem>
                  <SelectItem value="aftershave">After Shave</SelectItem>
                  <SelectItem value="acessorio">Acessório</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                placeholder="Ex: 7891234567890"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sell_price">Preço de Venda (R$) *</Label>
              <Input
                id="sell_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.sell_price}
                onChange={(e) => handleInputChange('sell_price', e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Preço de Custo (R$)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={(e) => handleInputChange('cost_price', e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_stock">Quantidade em Estoque *</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) => handleInputChange('current_stock', e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_stock">Estoque Mínimo</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => handleInputChange('min_stock', e.target.value)}
                placeholder="Quantidade mínima para alerta"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select
                value={formData.is_active ? 'true' : 'false'}
                onValueChange={(value) => handleInputChange('is_active', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição do produto..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;