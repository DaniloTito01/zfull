# API Documentation - Sistema de Barbearia

## Endpoints Principais

### 🔐 Autenticação
```http
POST /api/users/login
POST /api/users/register
```

### 👥 Usuários
```http
GET    /api/users              # Lista usuários
GET    /api/users/profile      # Perfil do usuário logado
PUT    /api/users/profile      # Atualiza perfil
PUT    /api/users/change-password  # Altera senha
```

### 🏪 Barbearias
```http
GET    /api/barbershops        # Lista barbearias
POST   /api/barbershops        # Cria barbearia (admin)
GET    /api/barbershops/:id    # Detalhes da barbearia
PUT    /api/barbershops/:id    # Atualiza barbearia (admin)
GET    /api/barbershops/nearby # Busca por proximidade
GET    /api/barbershops/:id/stats # Estatísticas (admin)
```

### ✂️ Barbeiros
```http
GET    /api/barbers            # Lista barbeiros
POST   /api/barbers            # Cadastra barbeiro (admin)
GET    /api/barbers/:id        # Detalhes do barbeiro
PUT    /api/barbers/:id        # Atualiza barbeiro (admin)
GET    /api/barbers/:id/available-slots # Horários disponíveis
GET    /api/barbers/:id/stats  # Estatísticas do barbeiro
PUT    /api/barbers/:id/schedule # Atualiza horário
```

### 👤 Clientes
```http
GET    /api/clients            # Lista clientes
POST   /api/clients            # Cadastra cliente
GET    /api/clients/:id        # Detalhes do cliente
PUT    /api/clients/:id        # Atualiza cliente
GET    /api/clients/:id/history # Histórico de agendamentos
GET    /api/clients/frequent   # Clientes frequentes
GET    /api/clients/birthdays  # Aniversariantes do mês
```

### 🛍️ Serviços
```http
GET    /api/services           # Lista serviços
POST   /api/services           # Cria serviço (admin)
GET    /api/services/:id       # Detalhes do serviço
PUT    /api/services/:id       # Atualiza serviço (admin)
GET    /api/services/categories # Lista categorias
```

### 📅 Agendamentos
```http
GET    /api/appointments       # Lista agendamentos
POST   /api/appointments       # Cria agendamento
GET    /api/appointments/:id   # Detalhes do agendamento
PUT    /api/appointments/:id   # Atualiza agendamento
PUT    /api/appointments/:id/cancel # Cancela agendamento
PUT    /api/appointments/:id/complete # Completa agendamento
GET    /api/appointments/upcoming # Próximos agendamentos
GET    /api/appointments/statistics # Estatísticas
```

## 📝 Exemplos de Uso

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@barbearia.com", "password": "123456"}'
```

### Criar Agendamento
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "client_id": "uuid",
    "barber_id": "uuid",
    "service_id": "uuid",
    "barbershop_id": "uuid",
    "appointment_date": "2024-01-15",
    "start_time": "14:00"
  }'
```

### Buscar Horários Disponíveis
```bash
curl "http://localhost:3000/api/barbers/BARBER_ID/available-slots?date=2024-01-15&service_duration=30"
```

## 🔑 Autenticação

Inclua o token JWT no header:
```
Authorization: Bearer <token>
```

## 📊 Níveis de Acesso

- **admin**: Acesso completo
- **barber**: Agendamentos e clientes
- **client**: Apenas próprio perfil

## 🗄️ Estrutura de Dados

### User
```json
{
  "id": "uuid",
  "email": "user@email.com",
  "name": "Nome do Usuário",
  "phone": "(11) 99999-9999",
  "role": "admin|barber|client",
  "avatar": "url",
  "active": true
}
```

### Appointment
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "barber_id": "uuid",
  "service_id": "uuid",
  "barbershop_id": "uuid",
  "appointment_date": "2024-01-15",
  "start_time": "14:00",
  "end_time": "14:30",
  "status": "scheduled|confirmed|in_progress|completed|cancelled|no_show",
  "notes": "Observações",
  "total_price": 50.00
}
```

### Service
```json
{
  "id": "uuid",
  "name": "Corte Masculino",
  "description": "Corte clássico",
  "price": 50.00,
  "duration": 30,
  "category": "Cortes",
  "barbershop_id": "uuid",
  "active": true
}
```