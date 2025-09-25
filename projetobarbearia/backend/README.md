# Sistema de Barbearia - Backend API

Sistema completo de gerenciamento para barbearias com funcionalidades de agendamento, controle de clientes, barbeiros e serviços.

## 🚀 Funcionalidades

### 👥 Usuários
- Sistema de autenticação com JWT
- Diferentes níveis de acesso (admin, barbeiro, cliente)
- Gerenciamento de perfis

### 🏪 Barbearias
- Cadastro de múltiplas barbearias
- Configuração de horários de funcionamento
- Localização e busca por proximidade

### ✂️ Barbeiros
- Cadastro de barbeiros com especialidades
- Gerenciamento de horários de trabalho
- Controle de disponibilidade
- Estatísticas de desempenho

### 👤 Clientes
- Cadastro de clientes
- Histórico de agendamentos
- Sistema de pontos de fidelidade
- Preferências personalizadas

### 🛍️ Serviços
- Catálogo de serviços por categoria
- Controle de preços e duração
- Busca e filtros

### 📅 Agendamentos
- Sistema completo de agendamentos
- Verificação de disponibilidade
- Estados do agendamento (agendado, confirmado, em andamento, concluído, cancelado)
- Relatórios e estatísticas

## 🔧 Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd projetobarbearia/backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
POSTGRES_HOST=postgres
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=Mfcd62!!Mfcd62!!SaaS
POSTGRES_DATABASE=barbearia
POSTGRES_PORT=5432
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
```

4. **Inicialize o banco de dados:**
```bash
npm run init-db
```

5. **Inicie o servidor:**
```bash
npm run dev
```

## 📋 API Endpoints

### Autenticação
```
POST /api/users/login
POST /api/users/register
GET  /api/users/profile
PUT  /api/users/profile
```

### Usuários
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
PUT    /api/users/change-password
```

### Barbearias
```
GET    /api/barbershops
POST   /api/barbershops
GET    /api/barbershops/:id
PUT    /api/barbershops/:id
DELETE /api/barbershops/:id
GET    /api/barbershops/nearby
GET    /api/barbershops/:id/stats
GET    /api/barbershops/:id/is-open
```

### Barbeiros
```
GET    /api/barbers
POST   /api/barbers
GET    /api/barbers/:id
PUT    /api/barbers/:id
DELETE /api/barbers/:id
GET    /api/barbers/specialties
GET    /api/barbers/:id/available-slots
GET    /api/barbers/:id/stats
PUT    /api/barbers/:id/schedule
```

### Clientes
```
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
GET    /api/clients/frequent
GET    /api/clients/loyalty
GET    /api/clients/recent
GET    /api/clients/birthdays
GET    /api/clients/:id/stats
GET    /api/clients/:id/history
PUT    /api/clients/:id/preferences
PUT    /api/clients/:id/loyalty-points
```

### Serviços
```
GET    /api/services
POST   /api/services
GET    /api/services/:id
PUT    /api/services/:id
DELETE /api/services/:id
GET    /api/services/categories
```

### Agendamentos
```
GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id
GET    /api/appointments/upcoming
GET    /api/appointments/statistics
PUT    /api/appointments/:id/cancel
PUT    /api/appointments/:id/complete
```

## 🔒 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação. Após o login, inclua o token no header:

```
Authorization: Bearer <token>
```

### Níveis de Acesso:
- **admin**: Acesso completo ao sistema
- **barber**: Acesso a agendamentos e clientes
- **client**: Acesso limitado ao próprio perfil

## 🗄️ Estrutura do Banco de Dados

### Principais Tabelas:
- `users` - Usuários do sistema
- `barbershops` - Barbearias
- `barbers` - Barbeiros
- `clients` - Clientes
- `services` - Serviços oferecidos
- `appointments` - Agendamentos

### Relacionamentos:
- Um usuário pode ser barbeiro, cliente ou admin
- Barbeiros pertencem a uma barbearia
- Agendamentos conectam cliente, barbeiro e serviço
- Serviços pertencem a uma barbearia

## 🚀 Scripts Disponíveis

```bash
npm run dev        # Inicia o servidor em modo desenvolvimento
npm run build      # Compila o TypeScript
npm run start      # Inicia o servidor em produção
npm run init-db    # Inicializa o banco de dados
npm run setup      # Inicializa DB e inicia desenvolvimento
npm run clean      # Remove arquivos compilados
npm run rebuild    # Limpa e recompila
```

## 📊 Recursos Avançados

### Sistema de Pontos de Fidelidade
- Clientes ganham pontos a cada serviço
- Consulta de clientes por pontos mínimos

### Estatísticas e Relatórios
- Estatísticas por barbeiro
- Estatísticas por barbearia
- Relatórios de faturamento
- Análise de serviços mais populares

### Gerenciamento de Horários
- Horários de funcionamento da barbearia
- Horários individuais dos barbeiros
- Verificação automática de disponibilidade
- Slots de tempo configuráveis

### Busca e Filtros
- Busca de barbearias por localização
- Filtros por especialidade do barbeiro
- Filtros por categoria de serviço
- Busca de clientes por nome/telefone

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **uuid** - Geração de IDs únicos

## 📝 Health Check

Acesse `/health` para verificar o status da API e conexão com o banco de dados.

## 🚀 Deploy

Para deploy em produção:

1. Configure as variáveis de ambiente de produção
2. Execute `npm run build`
3. Execute `npm run init-db` (apenas primeira vez)
4. Execute `npm start`

## 📧 Suporte

Para dúvidas ou suporte, consulte a documentação da API em `http://localhost:3000/` quando o servidor estiver rodando.