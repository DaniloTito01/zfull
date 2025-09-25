import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, User, Scissors, Plus, Filter, Users, Grid3x3, Edit, Trash2, Eye } from 'lucide-react';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Appointment } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import CreateAppointmentModal from '@/components/modals/CreateAppointmentModal';
import EditAppointmentModal from '@/components/modals/EditAppointmentModal';
import ViewAppointmentModal from '@/components/modals/ViewAppointmentModal';

const Appointments = () => {
  const { currentBarbershop } = useBarbershop();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Fetch appointments from real API
  const { data: appointmentsResponse, isLoading, error } = useQuery({
    queryKey: ['appointments', currentBarbershop?.id, selectedDate, selectedBarber],
    queryFn: () => {
      if (!currentBarbershop) return Promise.reject('No barbershop selected');

      const params: any = { date: selectedDate };

      // Only include barber_id if a specific barber is selected and it's a valid UUID
      if (selectedBarber !== 'all' && selectedBarber && selectedBarber.length > 0) {
        params.barber_id = selectedBarber;
      }

      return apiService.appointments.getAll(currentBarbershop.id, params);
    },
    enabled: !!currentBarbershop?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch barbers for filter
  const { data: barbersResponse } = useQuery({
    queryKey: ['barbers', currentBarbershop?.id],
    queryFn: () => currentBarbershop ? apiService.barbers.getAll(currentBarbershop.id) : Promise.reject('No barbershop selected'),
    enabled: !!currentBarbershop?.id,
  });

  const appointments = appointmentsResponse?.data || [];
  const barbers = barbersResponse?.data || [];

  // Mutations
  const deleteAppointmentMutation = useMutation({
    mutationFn: (appointmentId: string) => apiService.appointments.delete(appointmentId),
    onSuccess: () => {
      toast({
        title: "Agendamento cancelado com sucesso!",
        description: "O agendamento foi cancelado no sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsDeleteDialogOpen(false);
      setSelectedAppointment(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar agendamento",
        description: error.message || "Ocorreu um erro ao cancelar o agendamento.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiService.appointments.updateStatus(id, status),
    onSuccess: () => {
      toast({
        title: "Status atualizado com sucesso!",
        description: "O status do agendamento foi alterado.",
      });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro ao atualizar o status.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateStatus = (appointment: Appointment, status: string) => {
    updateStatusMutation.mutate({ id: appointment.id, status });
  };

  const confirmDelete = () => {
    if (selectedAppointment) {
      deleteAppointmentMutation.mutate(selectedAppointment.id);
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  // Filter appointments based on selected barber (API already handles this filter)
  const filteredAppointments = appointments;
  const filteredBarbers = selectedBarber === 'all' ? barbers : barbers.filter(b => b.id === selectedBarber);

  const stats = {
    totalToday: filteredAppointments.length,
    completed: filteredAppointments.filter(a => a.status === 'completed').length,
    pending: filteredAppointments.filter(a => a.status === 'pending').length,
    confirmed: filteredAppointments.filter(a => a.status === 'confirmed').length,
    revenue: filteredAppointments
      .filter(a => a.status === 'completed')
      .reduce((acc, a) => acc + a.price, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge-completed">Concluído</span>;
      case 'confirmed':
        return <span className="badge-confirmed">Confirmado</span>;
      case 'pending':
        return <span className="badge-pending">Pendente</span>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getBarberColor = (barberName: string) => {
    const colors = [
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];

    // Generate consistent color based on barber name
    const hash = barberName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Gerencie os agendamentos da sua barbearia
          </p>
        </div>
        <Button variant="cta" size="lg" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-znexo border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Hoje</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-znexo-purple">{stats.totalToday}</div>
            <p className="text-sm text-muted-foreground">agendamentos</p>
          </CardContent>
        </Card>

        <Card className="card-znexo border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Concluídos</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-znexo-green">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">finalizados</p>
          </CardContent>
        </Card>

        <Card className="card-znexo border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-znexo-orange">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">aguardando</p>
          </CardContent>
        </Card>

        <Card className="card-znexo border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-znexo-blue">R$ {stats.revenue}</div>
            <p className="text-sm text-muted-foreground">hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="card-znexo border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Filtros e Visualização</CardTitle>
          <CardDescription className="text-muted-foreground">
            Personalize a visualização dos agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-xl bg-white"
              />
            </div>
            
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue placeholder="Selecionar barbeiro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Todos os Barbeiros
                  </div>
                </SelectItem>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {barber.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-lg"
              >
                <Grid3x3 className="h-4 w-4 mr-1" />
                Grade
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('timeline')}
                className="rounded-lg"
              >
                <Clock className="h-4 w-4 mr-1" />
                Timeline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments View */}
      {viewMode === 'grid' ? (
        /* Grid View - Better for many barbers */
        <div className={`grid gap-6 ${filteredBarbers.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
          {filteredBarbers.map((barber) => (
            <Card key={barber.id} className="card-znexo border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBarberColor(barber.name)}`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-foreground">{barber.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {appointments.filter(a => a.barber_name === barber.name).length} agendamentos
                      </p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {appointments
                    .filter(a => a.barber_name === barber.name)
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex items-center space-x-2 min-w-[60px]">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">{appointment.appointment_time}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">{appointment.client_name}</div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Scissors className="h-3 w-3" />
                              <span>{appointment.service_name}</span>
                              <span>•</span>
                              <span>{appointment.duration}min</span>
                              <span>•</span>
                              <span className="font-medium text-znexo-blue">R$ {appointment.price}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(appointment.status)}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Ver detalhes"
                              onClick={() => handleViewAppointment(appointment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Editar agendamento"
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Cancelar agendamento"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteAppointment(appointment)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {appointments.filter(a => a.barber_name === barber.name).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum agendamento hoje</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Timeline View - Better for fewer barbers */
        <div className="space-y-6">
          {filteredBarbers.map((barber) => (
            <Card key={barber.id} className="card-znexo border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBarberColor(barber.name)}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-foreground">{barber.name}</span>
                    <p className="text-sm text-muted-foreground">
                      {appointments.filter(a => a.barber_name === barber.name).length} agendamentos hoje
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {timeSlots.map((time) => {
                    const appointment = appointments.find(
                      a => a.appointment_time === time && a.barber_name === barber.name
                    );
                    
                    return (
                      <div
                        key={time}
                        className={`p-3 rounded-xl border transition-all ${
                          appointment 
                            ? 'bg-primary/5 border-primary/20 shadow-sm' 
                            : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50 cursor-pointer hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground">{time}</span>
                        </div>
                        
                        {appointment ? (
                          <div className="space-y-2">
                            <div className="font-semibold text-sm text-foreground truncate">
                              {appointment.client_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {appointment.service_name}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-znexo-blue">
                                R$ {appointment.price}
                              </span>
                              {getStatusBadge(appointment.status)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground text-center py-2">
                            Disponível
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateAppointmentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditAppointmentModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        appointment={selectedAppointment}
      />

      <ViewAppointmentModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        appointment={selectedAppointment}
        onEdit={() => {
          setIsViewModalOpen(false);
          setIsEditModalOpen(true);
        }}
        onUpdateStatus={(status) => {
          if (selectedAppointment) {
            handleUpdateStatus(selectedAppointment, status);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o agendamento de <strong>{selectedAppointment?.client_name}</strong>?
              Esta ação marcará o agendamento como cancelado no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending ? 'Cancelando...' : 'Cancelar Agendamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Appointments;