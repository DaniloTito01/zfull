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

interface CreateBarberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateBarberModal = ({ open, onOpenChange }: CreateBarberModalProps) => {
  const { currentBarbershop } = useBarbershop();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    bio: '',
    commission_rate: '',
    working_hours: '',
    days_off: '',
    active: true
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

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const barberData = {
        barbershop_id: currentBarbershop.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialty: formData.specialty ? [formData.specialty] : [],
        commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : 50.00
      };

      console.log('[CREATE_BARBER] Sending barber data:', barberData);

      const response = await apiService.barbers.create(barberData);

      console.log('[CREATE_BARBER] API response:', response);

      toast({
        title: "Sucesso!",
        description: "Barbeiro cadastrado com sucesso",
      });

      // Refresh the barbers list
      queryClient.invalidateQueries({ queryKey: ['barbers'] });

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        bio: '',
        commission_rate: '',
        working_hours: '',
        days_off: '',
        active: true
      });
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating barber:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar barbeiro. Tente novamente.",
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
          <DialogTitle>Novo Barbeiro</DialogTitle>
          <DialogDescription>
            Cadastre um novo barbeiro na sua equipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corte_masculino">Corte Masculino</SelectItem>
                  <SelectItem value="barba">Barba</SelectItem>
                  <SelectItem value="cabelo_barba">Cabelo + Barba</SelectItem>
                  <SelectItem value="corte_infantil">Corte Infantil</SelectItem>
                  <SelectItem value="tratamentos">Tratamentos</SelectItem>
                  <SelectItem value="generalista">Generalista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="joao@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commission_rate}
                onChange={(e) => handleInputChange('commission_rate', e.target.value)}
                placeholder="Ex: 50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="working_hours">Horário de Trabalho</Label>
              <Input
                id="working_hours"
                value={formData.working_hours}
                onChange={(e) => handleInputChange('working_hours', e.target.value)}
                placeholder="Ex: 08:00 - 18:00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="days_off">Dias de Folga</Label>
            <Input
              id="days_off"
              value={formData.days_off}
              onChange={(e) => handleInputChange('days_off', e.target.value)}
              placeholder="Ex: Domingo, Segunda"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia/Experiência</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Conte um pouco sobre a experiência do barbeiro..."
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
                'Cadastrar Barbeiro'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBarberModal;