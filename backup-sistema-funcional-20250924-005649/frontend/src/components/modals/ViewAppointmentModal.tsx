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
import { Appointment } from '@/lib/api';
import { Calendar, Clock, User, Scissors, Phone, Mail, MapPin, FileText, DollarSign } from 'lucide-react';

interface ViewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onEdit?: () => void;
  onUpdateStatus?: (status: string) => void;
}

const ViewAppointmentModal = ({ open, onOpenChange, appointment, onEdit, onUpdateStatus }: ViewAppointmentModalProps) => {
  if (!appointment) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmado</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Agendado</Badge>;
      case 'in_progress':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Em Andamento</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const statusOptions = [
    { value: 'scheduled', label: 'Agendado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes do Agendamento
          </DialogTitle>
          <DialogDescription>
            Informações completas do agendamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Status</h3>
            <div className="flex gap-2">
              {getStatusBadge(appointment.status)}
              {onUpdateStatus && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <div className="flex gap-1">
                  {statusOptions
                    .filter(option => option.value !== appointment.status)
                    .map(option => (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateStatus(option.value)}
                        className="text-xs"
                      >
                        {option.label}
                      </Button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Informações do Agendamento */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações do Agendamento</h3>

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Data:</span>
                <span>{formatDate(appointment.appointment_date)}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Horário:</span>
                <span>{appointment.appointment_time}</span>
                <span className="text-muted-foreground">({appointment.duration} minutos)</span>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Valor:</span>
                <span className="font-bold text-primary">{formatCurrency(appointment.price)}</span>
              </div>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Cliente</h3>

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Nome:</span>
                <span>{appointment.client_name}</span>
              </div>

              {appointment.client_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Telefone:</span>
                  <span>{appointment.client_phone}</span>
                </div>
              )}

              {appointment.client_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{appointment.client_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Serviço */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Serviço</h3>

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Scissors className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Serviço:</span>
                <span>{appointment.service_name}</span>
              </div>

              {appointment.service_category && (
                <div className="flex items-center gap-3">
                  <span className="font-medium">Categoria:</span>
                  <Badge variant="outline">{appointment.service_category}</Badge>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="font-medium">Barbeiro:</span>
                <span>{appointment.barber_name}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {appointment.notes && (
            <div className="grid gap-4">
              <h3 className="font-semibold text-lg border-b pb-2">Observações</h3>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Informações do Sistema */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Sistema</h3>

            <div className="grid gap-2 text-sm text-muted-foreground">
              <div>Criado em: {formatDate(appointment.created_at)}</div>
              {appointment.updated_at && (
                <div>Atualizado em: {formatDate(appointment.updated_at)}</div>
              )}
              <div>ID: {appointment.id}</div>
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
              Editar Agendamento
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAppointmentModal;