<<<<<<< HEAD
# Zbarba
=======
# 🏆 Sistema de Barbearia - ZBarbe

![ZBarbe Logo](https://img.shields.io/badge/ZBarbe-Sistema%20Completo-purple?style=for-the-badge&logo=scissors)

**Sistema completo de gestão para barbearias modernas**
Desenvolvido com tecnologias de ponta e funcionalidades profissionais.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-repo/zbarbe)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-repo/zbarbe)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🚀 Acesso Rápido

**🌐 Ambiente de Produção:** https://******.*******-ia.********.br/

**🔐 Credenciais de Teste:**
- **Email:** ***********@teste.com
- **Senha:** *************

---

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [🏗️ Arquitetura](#️-arquitetura)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [📦 Instalação](#-instalação)
- [🐳 Deploy com Docker](#-deploy-com-docker)
- [🔧 Configuração](#-configuração)
- [📚 Documentação](#-documentação)
- [🧪 Testes](#-testes)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

---

## 🎯 Visão Geral

O ZBarbe é um sistema completo de gestão para barbearias que oferece:

- 📊 **Dashboard Analítico** com métricas em tempo real
- 👥 **Gestão de Barbeiros** completa com especialidades e comissões
- ✂️ **Catálogo de Serviços** com categorias e análise financeira
- 📦 **Controle de Estoque** inteligente com alertas automáticos
- 🛒 **PDV Profissional** com múltiplas formas de pagamento
- 💰 **Gestão de Vendas** com histórico completo
- 📅 **Sistema de Agendamentos** flexível e visual
- 👤 **Base de Clientes** com sistema VIP automático
- 📈 **Relatórios Avançados** com Business Intelligence

---

## 🏗️ Arquitetura

### **Frontend**
- ⚛️ **React 18** com TypeScript
- 🔄 **React Query** para gerenciamento de estado servidor
- 🎨 **Tailwind CSS** + **shadcn/ui** para interface moderna
- 📱 **Design Responsivo** e **Mobile-First**
- 🚀 **Vite** para build otimizado

### **Backend**
- 🟢 **Node.js** com **TypeScript**
- 🗄️ **PostgreSQL** com **Supabase**
- 🔐 **Autenticação JWT** robusta
- 📊 **APIs RESTful** completas

### **DevOps**
- 🐳 **Docker** com **Swarm Mode**
- 🔄 **CI/CD** automatizado
- ☁️ **Deploy em produção**
- 🔒 **SSL/TLS** com Let's Encrypt

---

## ✨ Funcionalidades

### 🏠 **Dashboard**
- Métricas em tempo real
- Gráficos de performance
- Resumo de atividades
- Indicadores financeiros

### 👥 **Barbeiros**
- CRUD completo (Create, Read, Update, Delete)
- Especialidades e horários
- Sistema de comissões
- Status ativo/inativo
- Performance tracking

### ✂️ **Serviços**
- Catálogo completo de serviços
- Categorização flexível
- Precificação dinâmica
- Análise de rentabilidade
- Duração e comissões customizáveis

### 📦 **Produtos**
- Controle de estoque em tempo real
- Gestão de fornecedores
- Alertas de estoque baixo
- Categorização de produtos
- Histórico de movimentações

### 🛒 **PDV (Ponto de Venda)**
- Interface profissional com abas dinâmicas
- Carrinho inteligente com validação
- Múltiplas formas de pagamento
- Comprovantes profissionais
- Integração completa com estoque

### 💰 **Vendas**
- Histórico completo de transações
- Filtros avançados por data e barbeiro
- Estatísticas de performance
- Relatórios de faturamento
- Análise de formas de pagamento

### 📅 **Agendamentos**
- Visualizações em grid e timeline
- Estados: Pendente, Confirmado, Concluído, Cancelado
- Sistema de cores por barbeiro
- Filtros por data e profissional
- Notificações automáticas

### 👤 **Clientes**
- Base completa de dados
- Histórico de atendimentos
- Sistema VIP baseado em gastos
- Barbeiro preferido
- Estatísticas de fidelidade

### 📊 **Relatórios**
- **5 Abas de Análise**: Visão Geral, Serviços, Barbeiros, Clientes, Financeiro
- Métricas avançadas: Taxa de conclusão, Ticket médio, ROI
- Ranking de performance
- Análise de clientes VIP
- Exportação CSV
- Períodos flexíveis

---

## 🛠️ Tecnologias

### **Frontend Stack**
```json
{
  "framework": "React 18.2.0",
  "language": "TypeScript 5.0+",
  "build": "Vite 5.4.19",
  "styling": "Tailwind CSS 3.4+",
  "components": "shadcn/ui + Radix UI",
  "state": "React Query + Context API",
  "routing": "React Router v6",
  "forms": "React Hook Form + Zod"
}
```

### **Backend Stack**
```json
{
  "runtime": "Node.js 18+",
  "language": "TypeScript 5.0+",
  "database": "PostgreSQL + Supabase",
  "auth": "JWT + bcrypt",
  "api": "Express.js + RESTful",
  "orm": "Prisma (optional)"
}
```

### **DevOps Stack**
```json
{
  "containers": "Docker + Docker Compose",
  "orchestration": "Docker Swarm",
  "proxy": "Traefik + Let's Encrypt",
  "monitoring": "Built-in health checks",
  "deployment": "Automated scripts"
}
```

---

## 📦 Instalação

### **Pré-requisitos**
- Node.js 18+ e npm
- Docker e Docker Compose
- Git

### **Instalação Local**

```bash
# Clone o repositório
git clone https://github.com/your-repo/zbarbe.git
cd zbarbe

# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar desenvolvimento
npm run dev          # Frontend (porta 8080)
cd backend && npm run dev  # Backend (porta 3001)
```

### **Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# API
VITE_API_BASE=http://localhost:3001/api
```

---

## 🐳 Deploy com Docker

### **Deploy Automático (Recomendado)**

```bash
# Deploy completo com script automatizado
./deploy.sh

# Deploy com versão específica
./deploy.sh v1.2.3

# Rollback em caso de problemas
./rollback.sh
```

### **Deploy Manual**

```bash
# 1. Inicializar Docker Swarm (apenas uma vez)
docker swarm init

# 2. Criar rede externa
docker network create --driver overlay --attachable network_public

# 3. Build das imagens
docker build -f Dockerfile.frontend -t zbarbe-frontend:latest .
docker build -f backend/Dockerfile.backend -t zbarbe-backend:latest ./backend

# 4. Deploy do stack
export VERSION=latest
docker stack deploy -c docker-stack.yml zbarbe-stack

# 5. Verificar serviços
docker service ls
```

### **Monitoramento**

```bash
# Ver status dos serviços
docker service ls

# Logs do frontend
docker service logs -f zbarbe-stack_frontend

# Logs do backend
docker service logs -f zbarbe-stack_backend

# Escalar serviços
docker service scale zbarbe-stack_frontend=3
docker service scale zbarbe-stack_backend=2
```

---

## 🔧 Configuração

### **Configuração do Nginx (Frontend)**

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /health {
            return 200 'healthy';
            add_header Content-Type text/plain;
        }
    }
}
```

### **Configuração do Traefik**

```yaml
# traefik.yml
api:
  dashboard: true
  insecure: true

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

certificatesResolvers:
  myresolver:
    acme:
      email: your-email@example.com
      storage: acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    swarmMode: true
    exposedByDefault: false
    network: network_public
```

---

## 📚 Documentação

### **Guias de Teste Detalhados**
- [📖 Guia de Testes - Barbeiros](GUIA_DE_TESTES_BARBEIROS.md)
- [📖 Guia de Testes - Serviços](GUIA_DE_TESTES_SERVICOS.md)
- [📖 Guia de Testes - Produtos](GUIA_DE_TESTES_PRODUTOS.md)
- [📖 Guia de Testes - PDV](GUIA_DE_TESTES_PDV.md)
- [📋 Checklist Sistema Completo](CHECKLIST_SISTEMA_COMPLETO.md)

### **Documentação Técnica**
- [🔧 Configuração Claude.md](CLAUDE.md)
- [📊 Mapeamento do Sistema](SISTEMA_MAPEAMENTO_COMPLETO.md)
- [📑 Documentação Completa](SISTEMA_COMPLETO_DOCUMENTACAO.md)

### **API Endpoints**

#### **Autenticação**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

#### **Barbeiros**
```
GET    /api/barbers              # Listar barbeiros
POST   /api/barbers              # Criar barbeiro
GET    /api/barbers/:id          # Obter barbeiro
PUT    /api/barbers/:id          # Atualizar barbeiro
DELETE /api/barbers/:id          # Excluir barbeiro
```

#### **Serviços**
```
GET    /api/services             # Listar serviços
POST   /api/services             # Criar serviço
GET    /api/services/:id         # Obter serviço
PUT    /api/services/:id         # Atualizar serviço
DELETE /api/services/:id         # Excluir serviço
```

#### **Produtos**
```
GET    /api/products             # Listar produtos
POST   /api/products             # Criar produto
GET    /api/products/:id         # Obter produto
PUT    /api/products/:id         # Atualizar produto
DELETE /api/products/:id         # Excluir produto
POST   /api/products/:id/stock   # Atualizar estoque
```

---

## 🧪 Testes

### **Casos de Teste por Módulo**

#### **Dashboard (CT-DB-01)**
- ✅ Métricas carregam corretamente
- ✅ Gráficos são exibidos
- ✅ Dados em tempo real funcionam

#### **Agendamentos (CT-AG-01)**
- ✅ CRUD completo funcional
- ✅ Modal de edição abre com dados
- ✅ Filtros por data e barbeiro

#### **PDV (CT-PDV-01)**
- ✅ Carrinho funciona corretamente
- ✅ Validação de estoque
- ✅ Finalização de venda

---

## 📊 Status do Projeto

### **✅ Módulos Completos**
- [x] Dashboard
- [x] Barbeiros (CRUD + Modais + Docs)
- [x] Serviços (CRUD + Modais + Docs)
- [x] Produtos (CRUD + Modais + Docs)
- [x] PDV (CRUD + Modais + Docs)
- [x] Vendas (CRUD + Modais)
- [x] Agendamentos (CRUD + Modais)
- [x] Clientes (CRUD + Modais)
- [x] Relatórios (Analytics Avançado)

### **🚀 Funcionalidades Implementadas**
- [x] CRUDs Completos em todos os módulos
- [x] Interfaces Profissionais com design moderno
- [x] Responsividade Total para mobile e desktop
- [x] Integração Completa com APIs
- [x] Business Intelligence avançado
- [x] Sistema de Comprovantes profissional
- [x] Relatórios Detalhados com exportação
- [x] Segurança Robusta e validações

---

## 🚨 Problemas Corrigidos

### **✅ Issues Resolvidas**

#### **Dashboard - Contagem de Agendamentos**
- **Problema**: Card "Agendamentos de Hoje" com contagem incorreta
- **Solução**: Integração com API real e tratamento de timezone
- **Status**: ✅ Corrigido

#### **EditAppointmentModal - Tela Vazia**
- **Problema**: Modal de edição abria sem dados
- **Solução**: Correção na inicialização do form com dados do appointment
- **Status**: ✅ Corrigido

#### **PDV, Vendas, Relatórios - Telas em Branco**
- **Problema**: Componentes mostravam tela branca ao carregar
- **Solução**: Correção de referências a dados mock inexistentes, implementação de estados de loading/error
- **Status**: ✅ Corrigido

#### **CRUDs - Funcionalidade Delete Faltante**
- **Problema**: Botões de delete não funcionavam (TODOs comentados)
- **Solução**: Implementação completa das APIs de delete e integração com interface
- **Status**: ✅ Corrigido

---

## 🤝 Contribuição

### **Como Contribuir**

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Implemente** suas mudanças
5. **Teste** suas alterações
6. **Commit** com mensagem descritiva
7. **Push** para sua branch
8. **Abra** um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

---

## 🎉 Agradecimentos

Desenvolvido com ❤️ usando tecnologias de ponta para revolucionar a gestão de barbearias.

**Sistema 100% Funcional • Totalmente Documentado • Em Produção**

---

### 📞 Suporte

- **Email**: suporte@zbarbe.com
- **Documentação**: [Docs Completos](SISTEMA_COMPLETO_DOCUMENTACAO.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/zbarbe/issues)

---

*Última atualização: 23 de Setembro de 2025*
*Versão: sistema-completo-20250923-153000*
>>>>>>> c9963aa (Primeiro commit do projeto barbearia)
