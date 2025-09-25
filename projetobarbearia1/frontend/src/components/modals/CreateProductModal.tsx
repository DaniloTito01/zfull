import { useState } from 'react';
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

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProductModal = ({ open, onOpenChange }: CreateProductModalProps) => {
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
        ...formData,
        sell_price: parseFloat(formData.sell_price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        current_stock: parseInt(formData.current_stock),
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : undefined,
        barbershop_id: currentBarbershop.id
      };

      const response = await apiService.products.create(productData);

      toast({
        title: "Sucesso!",
        description: "Produto criado com sucesso",
      });

      // Refresh the products list
      queryClient.invalidateQueries({ queryKey: ['products'] });

      // Reset form and close modal
      setFormData({
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
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar produto. Tente novamente.",
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
          <DialogTitle>Novo Produto</DialogTitle>
          <DialogDescription>
            Adicione um novo produto ao estoque da sua barbearia.
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
                'Criar Produto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductModal;