import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Client } from '@/lib/api';
import { Calendar, Mail, Phone, MapPin, User, FileText, Clock } from 'lucide-react';

interface ViewClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onEdit?: () => void;
}

const ViewClientModal = ({ open, onOpenChange, client, onEdit }: ViewClientModalProps) => {
  if (!client) return null;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {client.name}
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas do cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status e Tipo de Cliente */}
          <div className="flex gap-2">
            <Badge
              variant={client.status === 'active' ? 'default' : 'secondary'}
            >
              {client.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
            <Badge
              variant={client.total_spent > 1000 ? 'default' : 'outline'}
            >
              {client.total_spent > 1000 ? 'VIP' : 'Regular'}
            </Badge>
          </div>

          {/* Informações de Contato */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Contato</h3>

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>

              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}

              {client.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{client.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações Pessoais</h3>

            <div className="grid gap-3">
              {client.birth_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Nascimento: {formatDate(client.birth_date)}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Cliente desde: {formatDate(client.client_since)}</span>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Estatísticas</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total de Visitas</div>
                <div className="text-2xl font-bold text-primary">{client.total_visits}</div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Gasto</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(client.total_spent)}</div>
              </div>
            </div>

            {client.last_visit && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Última visita: {formatDate(client.last_visit)}</span>
              </div>
            )}
          </div>

          {/* Preferências e Observações */}
          {(client.preferred_barber_name || client.notes) && (
            <div className="grid gap-4">
              <h3 className="font-semibold text-lg border-b pb-2">Preferências</h3>

              {client.preferred_barber_name && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Barbeiro preferido: {client.preferred_barber_name}</span>
                </div>
              )}

              {client.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Observações:</span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">{client.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Informações do Sistema */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Sistema</h3>

            <div className="grid gap-2 text-sm text-muted-foreground">
              <div>Criado em: {formatDate(client.created_at)}</div>
              <div>Atualizado em: {formatDate(client.updated_at)}</div>
              <div>ID: {client.id}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          {onEdit && (
            <Button
              type="button"
              onClick={() => {
                onEdit();
                onOpenChange(false);
              }}
            >
              Editar Cliente
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewClientModal;