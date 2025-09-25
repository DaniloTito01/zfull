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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Phone,
  Mail,
  Scissors,
  Clock,
  Calendar,
  Percent,
  Star,
  Check,
  X
} from 'lucide-react';

interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string[];
  commission_rate: string;
  working_hours: any;
  status: string;
  created_at?: string;
  totalClients?: number;
  rating?: number;
  monthlyEarnings?: number;
}

interface ViewBarberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barber: Barber | null;
  onEdit?: () => void;
}

const ViewBarberModal = ({ open, onOpenChange, barber, onEdit }: ViewBarberModalProps) => {
  if (!barber) {
    console.log('ViewBarberModal - No barber data');
    return null;
  }

  console.log('ViewBarberModal - Barber data:', barber);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'vacation':
        return <Badge className="bg-orange-100 text-orange-800">Férias</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours) return 'Não definido';

    const activeDays = Object.entries(workingHours)
      .filter(([_, hours]: [string, any]) => hours.active)
      .map(([day, hours]: [string, any]) => ({
        day,
        start: hours.start,
        end: hours.end
      }));

    if (activeDays.length === 0) return 'Nenhum dia ativo';

    return activeDays;
  };

  const weekDayNames = {
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  const workingDays = formatWorkingHours(barber.working_hours);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={barber.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(barber.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-semibold">{barber.name}</div>
              <div className="text-sm text-muted-foreground">Barbeiro Profissional</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informações completas do barbeiro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            {getStatusBadge(barber.status)}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Desde {barber.created_at ? new Date(barber.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Informações de Contato</h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{barber.email}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{barber.phone}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Especialidades */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              Especialidades
            </h4>

            <div className="flex flex-wrap gap-2">
              {barber.specialty && barber.specialty.length > 0 ? (
                barber.specialty.map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Nenhuma especialidade definida</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Informações Profissionais</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Taxa de Comissão</span>
                </div>
                <div className="text-lg font-semibold text-primary">
                  {barber.commission_rate}%
                </div>
              </div>

              {barber.rating && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Avaliação</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-semibold text-primary">{barber.rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Estatísticas adicionais */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {barber.totalClients && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{barber.totalClients}</div>
                  <div className="text-xs text-muted-foreground">Clientes Atendidos</div>
                </div>
              )}

              {barber.monthlyEarnings && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">R$ {barber.monthlyEarnings}</div>
                  <div className="text-xs text-muted-foreground">Ganhos Mensais</div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Horários de Trabalho */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horários de Trabalho
            </h4>

            <div className="space-y-2">
              {Array.isArray(workingDays) ? (
                workingDays.map(({ day, start, end }) => (
                  <div key={day} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm font-medium">
                      {weekDayNames[day as keyof typeof weekDayNames]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {start} - {end}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">{workingDays}</span>
              )}
            </div>

            {/* Resumo da semana */}
            {Array.isArray(workingDays) && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-600" />
                  {workingDays.length} dias ativos
                </div>
                <div className="flex items-center gap-1">
                  <X className="h-3 w-3 text-red-600" />
                  {7 - workingDays.length} dias de folga
                </div>
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
              Editar Barbeiro
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBarberModal;