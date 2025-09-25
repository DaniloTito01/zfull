import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Client, UpdateClientData } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface EditClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

const EditClientModal = ({ open, onOpenChange, client }: EditClientModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdateClientData>({
    name: '',
    phone: '',
    email: '',
    birth_date: '',
    address: '',
    preferred_barber_id: '',
    notes: '',
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar formulário quando o cliente mudar
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        birth_date: client.birth_date ? client.birth_date.split('T')[0] : '',
        address: client.address || '',
        preferred_barber_id: client.preferred_barber_id || '',
        notes: client.notes || '',
        status: client.status || 'active'
      });
    }
  }, [client]);

  const updateClientMutation = useMutation({
    mutationFn: (data: UpdateClientData) => {
      if (!client?.id) throw new Error('ID do cliente não encontrado');
      return apiService.clients.update(client.id, data);
    },
    onSuccess: () => {
      toast({
        title: "Cliente atualizado com sucesso!",
        description: "As informações do cliente foram atualizadas.",
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message || "Ocorreu um erro ao atualizar o cliente.",
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    updateClientMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof UpdateClientData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente. Campos obrigatórios estão marcados com *.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome completo do cliente"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="cliente@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, bairro..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_barber_id">Barbeiro Preferido</Label>
              <Input
                id="preferred_barber_id"
                value={formData.preferred_barber_id}
                onChange={(e) => handleInputChange('preferred_barber_id', e.target.value)}
                placeholder="ID do barbeiro preferido (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Informações adicionais sobre o cliente"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateClientMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateClientMutation.isPending}
            >
              {updateClientMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientModal;