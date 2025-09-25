import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService, CreateAppointmentData } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface CreateAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateAppointmentModal = ({ open, onOpenChange }: CreateAppointmentModalProps) => {
  const { toast } = useToast();
  const { currentBarbershop } = useBarbershop();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateAppointmentData>({
    barbershop_id: currentBarbershop?.id || '',
    client_id: '',
    barber_id: '',
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch clients
  const { data: clientsResponse } = useQuery({
    queryKey: ['clients', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.clients.getAll(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id && open,
  });

  // Fetch barbers
  const { data: barbersResponse } = useQuery({
    queryKey: ['barbers', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.barbers.getAll(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id && open,
  });

  // Fetch services
  const { data: servicesResponse } = useQuery({
    queryKey: ['services', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.services.getAll(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id && open,
  });

  const clients = clientsResponse?.data || [];
  const barbers = barbersResponse?.data || [];
  const services = servicesResponse?.data || [];

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      // Find selected service to get duration
      const selectedService = services.find(s => s.id === data.service_id);
      if (!selectedService) {
        throw new Error('Serviço não encontrado');
      }

      // Add duration to the appointment data
      const appointmentData = {
        ...data,
        duration: selectedService.duration || 30, // Default 30 minutes if not specified
      };

      return await apiService.appointments.create(appointmentData);
    },
    onSuccess: () => {
      toast({
        title: "Agendamento criado com sucesso!",
        description: "O novo agendamento foi adicionado ao sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar agendamento",
        description: error.message || "Ocorreu um erro ao criar o agendamento.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      barbershop_id: currentBarbershop?.id || '',
      client_id: '',
      barber_id: '',
      service_id: '',
      appointment_date: '',
      appointment_time: '',
      notes: ''
    });
    setErrors({});
  };

  useEffect(() => {
    if (currentBarbershop) {
      setFormData(prev => ({ ...prev, barbershop_id: currentBarbershop.id }));
    }
  }, [currentBarbershop]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.client_id) {
      newErrors.client_id = 'Cliente é obrigatório';
    }

    if (!formData.barber_id) {
      newErrors.barber_id = 'Barbeiro é obrigatório';
    }

    if (!formData.service_id) {
      newErrors.service_id = 'Serviço é obrigatório';
    }

    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Data é obrigatória';
    }

    if (!formData.appointment_time) {
      newErrors.appointment_time = 'Horário é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentBarbershop) {
      toast({
        title: "Erro",
        description: "Nenhuma barbearia selecionada.",
        variant: "destructive",
      });
      return;
    }

    createAppointmentMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof CreateAppointmentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generate time slots (8:00 to 18:00, 30-minute intervals)
  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo agendamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente *</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
                <SelectTrigger className={errors.client_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && (
                <p className="text-sm text-red-500">{errors.client_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barber_id">Barbeiro *</Label>
              <Select value={formData.barber_id} onValueChange={(value) => handleInputChange('barber_id', value)}>
                <SelectTrigger className={errors.barber_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.barber_id && (
                <p className="text-sm text-red-500">{errors.barber_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_id">Serviço *</Label>
              <Select value={formData.service_id} onValueChange={(value) => handleInputChange('service_id', value)}>
                <SelectTrigger className={errors.service_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {typeof service.price === 'number' ? service.price.toFixed(2) : parseFloat(service.price || '0').toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.service_id && (
                <p className="text-sm text-red-500">{errors.service_id}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment_date">Data *</Label>
                <Input
                  id="appointment_date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.appointment_date ? 'border-red-500' : ''}
                />
                {errors.appointment_date && (
                  <p className="text-sm text-red-500">{errors.appointment_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment_time">Horário *</Label>
                <Select value={formData.appointment_time} onValueChange={(value) => handleInputChange('appointment_time', value)}>
                  <SelectTrigger className={errors.appointment_time ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.appointment_time && (
                  <p className="text-sm text-red-500">{errors.appointment_time}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Informações adicionais sobre o agendamento"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createAppointmentMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createAppointmentMutation.isPending}
            >
              {createAppointmentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Criar Agendamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAppointmentModal;