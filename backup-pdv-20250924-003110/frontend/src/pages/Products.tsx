import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Package, AlertTriangle, DollarSign, MoreHorizontal, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { apiService } from '@/lib/api';
import CreateProductModal from '@/components/modals/CreateProductModal';
import EditProductModal from '@/components/modals/EditProductModal';
import ViewProductModal from '@/components/modals/ViewProductModal';

const Products = () => {
  const { currentBarbershop } = useBarbershop();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch products from API
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', currentBarbershop?.id],
    queryFn: () => apiService.products.getAll(currentBarbershop!.id),
    enabled: !!currentBarbershop?.id,
  });

  // Get products from API or fallback to empty array
  const products = productsData?.data?.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || '',
    brand: product.brand || '',
    category: product.category || 'outros',
    price: parseFloat(product.sell_price || '0'),
    cost: parseFloat(product.cost_price || '0'),
    stock: product.current_stock || 0,
    minStock: product.min_stock || 5,
    isActive: product.is_active,
    barcode: product.barcode || '',
    soldThisMonth: 0 // TODO: Get from sales data
  })) || [];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.isActive).length,
    lowStockProducts: products.filter(p => p.stock <= p.minStock).length,
    totalValue: products.reduce((acc, p) => acc + (p.price * p.stock), 0),
    monthlyRevenue: products.reduce((acc, p) => acc + (p.price * p.soldThisMonth), 0)
  };

  const getStockStatus = (product: typeof products[0]) => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    }
    if (product.stock <= product.minStock) {
      return <Badge className="bg-orange-100 text-orange-800">Estoque Baixo</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Em Estoque</Badge>;
  };

  const handleViewProduct = (product: any) => {
    console.log('handleViewProduct called with:', product);
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    console.log('handleEditProduct called with:', product);
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditFromView = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = async (product: any) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      return;
    }

    try {
      await apiService.products.delete(product.id);

      // Show success toast
      toast({
        title: "Produto excluído com sucesso!",
        description: `O produto "${product.name}" foi removido do sistema.`,
      });

      // Refresh the products list
      queryClient.invalidateQueries({ queryKey: ['products'] });

    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao excluir produto",
        description: error.message || "Ocorreu um erro ao excluir o produto.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie o estoque de produtos da sua barbearia
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando produtos...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie o estoque de produtos da sua barbearia
            </p>
          </div>
          <Button className="btn-hero" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar produtos</h3>
              <p className="text-muted-foreground">
                Não foi possível carregar a lista de produtos. Usando dados de exemplo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o estoque de produtos da sua barbearia
          </p>
        </div>
        <Button className="btn-hero" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produtos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeProducts}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {stats.monthlyRevenue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Buscar Produtos</CardTitle>
          <CardDescription>
            Encontre produtos por nome, marca ou categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            {filteredProducts.length} de {products.length} produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendas/Mês</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{product.brand}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm font-medium">
                      <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                      R$ {product.price}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= product.minStock ? 'text-orange-600' : ''}`}>
                        {product.stock}
                      </span>
                      {product.stock <= product.minStock && product.stock > 0 && (
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStockStatus(product)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.soldThisMonth} vendas</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Product Modal */}
      <CreateProductModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        product={selectedProduct}
      />

      {/* View Product Modal */}
      <ViewProductModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        product={selectedProduct}
        onEdit={handleEditFromView}
      />
    </div>
  );
};

export default Products;