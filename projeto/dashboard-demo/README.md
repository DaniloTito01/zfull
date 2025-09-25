# Dashboard Demo

Um projeto completo de dashboard com frontend em React + Tailwind e backend em Node.js/Express, configurado para execução em Docker Swarm com Traefik.

## Estrutura do Projeto

```
dashboard-demo/
├── frontend/                 # Frontend React + Tailwind
│   ├── src/
│   │   ├── components/      # Componentes React (MetricCard, Chart, ActivityFeed)
│   │   ├── hooks/          # Custom hooks (useApi)
│   │   ├── App.jsx         # Componente principal
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Estilos Tailwind
│   ├── Dockerfile          # Docker config para frontend
│   ├── nginx.conf          # Configuração Nginx
│   ├── package.json        # Dependências frontend
│   └── vite.config.js      # Configuração Vite
├── backend/                 # Backend Node.js/Express
│   ├── server.js           # Servidor Express com API
│   ├── package.json        # Dependências backend
│   └── Dockerfile          # Docker config para backend
├── docker-compose.yml      # Configuração Docker Swarm
└── README.md              # Este arquivo
```

## Funcionalidades

### Frontend
- **Dashboard responsivo** com Tailwind CSS
- **Cards de métricas** exibindo KPIs com variações percentuais
- **Gráficos interativos** usando Recharts (vendas mensais e crescimento de usuários)
- **Feed de atividades** em tempo real
- **Status do sistema** com indicadores visuais
- **Hook customizado** para consumo da API

### Backend
- **API REST** em Express.js
- **Endpoint `/api/data`** retornando dados mockados:
  - Métricas: usuários ativos, vendas, tickets, receita
  - Dados para gráficos: vendas mensais e crescimento
  - Feed de atividades recentes
- **Endpoint `/health`** para health checks
- **CORS configurado** para desenvolvimento e produção

## Desenvolvimento Local

### Backend
```bash
cd backend
npm install
npm run dev  # Desenvolvimento com nodemon
npm start    # Produção
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Servidor de desenvolvimento
npm run build  # Build para produção
```

## Deploy em Produção com Docker Swarm

### Pré-requisitos
1. **Docker Swarm** inicializado
2. **Rede externa** `network_public` criada
3. **Traefik** configurado como load balancer
4. **DNS** apontando os domínios para o servidor

### Configuração da Rede
```bash
# Criar rede externa (se não existir)
docker network create --driver overlay --attachable network_public
```

### Deploy do Stack
```bash
# No diretório raiz do projeto
docker stack deploy -c docker-compose.yml dashboard-demo
```

### Verificar Deploy
```bash
# Verificar serviços
docker service ls

# Verificar logs
docker service logs dashboard-demo_frontend
docker service logs dashboard-demo_backend

# Verificar tasks
docker stack ps dashboard-demo
```

### Comandos Úteis

#### Atualizar Serviços
```bash
# Rebuild e redeploy
docker stack deploy -c docker-compose.yml dashboard-demo

# Forçar update de um serviço específico
docker service update --force dashboard-demo_frontend
```

#### Scaling (se necessário)
```bash
# Aumentar replicas
docker service scale dashboard-demo_frontend=2
docker service scale dashboard-demo_backend=2
```

#### Remover Stack
```bash
docker stack rm dashboard-demo
```

## Configuração Traefik

O projeto está configurado para usar as seguintes rotas:
- **Frontend**: `projeto2.zenni-ia.com.br`
- **Backend**: `api.projeto2.zenni-ia.com.br`

### Labels Traefik Configuradas
- Habilitação do Traefik
- Roteamento por hostname
- HTTPS automático com Let's Encrypt
- Health checks configurados
- Rede `network_public` especificada

## Monitoramento

### Health Checks
- **Frontend**: `GET /health` (nginx)
- **Backend**: `GET /health` (Express)

### Logs
```bash
# Logs em tempo real
docker service logs -f dashboard-demo_frontend
docker service logs -f dashboard-demo_backend
```

## Configurações de Ambiente

### Produção
- **NODE_ENV**: `production`
- **Frontend**: Build otimizado com Vite
- **Backend**: Modo produção do Express
- **HTTPS**: Certificados automáticos via Traefik

### Desenvolvimento
- **Frontend**: Hot reload com Vite
- **Backend**: Nodemon para restart automático
- **API Base URL**: Configuração automática por ambiente

## Troubleshooting

### Problemas Comuns

1. **Serviços não sobem**
   ```bash
   docker service ps dashboard-demo_frontend --no-trunc
   ```

2. **Erro de conectividade**
   - Verificar se a rede `network_public` existe
   - Confirmar configuração DNS

3. **Build falha**
   - Verificar Dockerfiles
   - Confirmar dependências no package.json

4. **Traefik não roteia**
   - Verificar labels no docker-compose.yml
   - Confirmar configuração do Traefik

### Debugging
```bash
# Acessar container em execução
docker exec -it $(docker ps -q -f name=dashboard-demo_backend) sh

# Verificar rede
docker network inspect network_public
```