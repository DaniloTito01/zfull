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
import {
  Scissors,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Star,
  Users
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  is_active: boolean;
  created_at?: string;
  totalBookings?: number;
  monthlyRevenue?: number;
  averageRating?: number;
}

interface ViewServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onEdit?: () => void;
}

const ViewServiceModal = ({ open, onOpenChange, service, onEdit }: ViewServiceModalProps) => {
  if (!service) {
    console.log('ViewServiceModal - No service data');
    return null;
  }

  console.log('ViewServiceModal - Service data:', service);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  const getCategoryBadge = (category?: string) => {
    const categoryMap = {
      'corte': { label: 'Corte', color: 'bg-blue-100 text-blue-800' },
      'barba': { label: 'Barba', color: 'bg-orange-100 text-orange-800' },
      'cabelo_barba': { label: 'Cabelo + Barba', color: 'bg-purple-100 text-purple-800' },
      'tratamento': { label: 'Tratamento', color: 'bg-green-100 text-green-800' },
      'outros': { label: 'Outros', color: 'bg-gray-100 text-gray-800' }
    };

    if (!category || !categoryMap[category as keyof typeof categoryMap]) {
      return <Badge variant="outline">Não definido</Badge>;
    }

    const cat = categoryMap[category as keyof typeof categoryMap];
    return <Badge className={cat.color}>{cat.label}</Badge>;
  };

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration} min`;
    }
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Scissors className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-xl font-semibold">{service.name}</div>
              <div className="text-sm text-muted-foreground">Detalhes do Serviço</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre este serviço
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Categoria */}
          <div className="flex items-center justify-between">
            {getStatusBadge(service.is_active)}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Criado em {service.created_at ? new Date(service.created_at).toLocaleDateString('pt-BR') : 'N/A'}
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Informações Básicas</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Categoria</span>
                </div>
                {getCategoryBadge(service.category)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Duração</span>
                </div>
                <div className="text-lg font-semibold text-primary">
                  {formatDuration(service.duration)}
                </div>
              </div>
            </div>

            {service.description && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Descrição</span>
                <p className="text-sm leading-relaxed p-3 bg-muted/30 rounded-lg">
                  {service.description}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Informações Financeiras */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Informações Financeiras</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Preço do Serviço</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {Number(service.price || 0).toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Valor por Minuto</span>
                </div>
                <div className="text-lg font-semibold text-primary">
                  R$ {(Number(service.price || 0) / service.duration).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estatísticas de Performance */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Estatísticas de Performance</h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {service.totalBookings || 0}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" />
                  Agendamentos
                </div>
              </div>

              {service.monthlyRevenue && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    R$ {service.monthlyRevenue.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Receita Mensal
                  </div>
                </div>
              )}

              {service.averageRating && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                    {service.averageRating.toFixed(1)}
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avaliação Média
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Análise de Eficiência */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Análise de Eficiência</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Receita por hora:</span>
                <div className="font-semibold text-blue-900">
                  R$ {((Number(service.price || 0) / service.duration) * 60).toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-blue-700">Categoria de preço:</span>
                <div className="font-semibold text-blue-900">
                  {service.price < 30 ? 'Econômico' :
                   service.price < 60 ? 'Padrão' :
                   service.price < 100 ? 'Premium' : 'Luxo'}
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
              Editar Serviço
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewServiceModal;