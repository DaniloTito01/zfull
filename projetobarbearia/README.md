# Sistema de Barbearia - Docker Swarm

Sistema completo de gerenciamento de barbearia com frontend React e backend Node.js, configurado para produção com Docker Swarm e Traefik.

## 🏗️ Arquitetura

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js 20 + Express + TypeScript + PostgreSQL
- **Proxy**: Traefik com SSL automático
- **Orquestração**: Docker Swarm

## 🌐 URLs de Produção

- **Frontend**: https://zbarbe.zenni-ia.com.br
- **Backend API**: https://api.zbarbe.zenni-ia.com.br
- **Health Check**: https://api.zbarbe.zenni-ia.com.br/health
- **Endpoint Principal**: https://api.zbarbe.zenni-ia.com.br/api/data

## 📋 Pré-requisitos

### Infraestrutura
- Docker Swarm inicializado
- Traefik rodando na rede `network_public`
- DNS configurado para os domínios:
  - `zbarbe.zenni-ia.com.br` → IP do servidor
  - `api.zbarbe.zenni-ia.com.br` → IP do servidor

### Certificados
- Traefik configurado com Let's Encrypt
- Resolver `letsencrypt` funcionando

## 🚀 Deploy em Produção

### 1. Preparar Swarm

```bash
# Inicializar Docker Swarm (apenas uma vez)
docker swarm init

# Criar rede externa overlay (apenas uma vez)
docker network create --driver overlay network_public
```

### 2. Construir Imagens

```bash
# Build do backend
cd backend
docker build -t barbershop-backend:latest .

# Build do frontend
cd ../frontend
docker build -t barbershop-frontend:latest .
```

### 3. Deploy do Stack

```bash
# Deploy do stack completo
docker stack deploy -c deploy/stack.yml barbershop

# Verificar serviços
docker stack services barbershop

# Verificar logs
docker service logs barbershop_frontend
docker service logs barbershop_backend
```

### 4. Verificação

```bash
# Health check do backend
curl -k https://api.zbarbe.zenni-ia.com.br/health

# Teste do endpoint principal
curl -k https://api.zbarbe.zenni-ia.com.br/api/data

# Acesso ao frontend
curl -I https://zbarbe.zenni-ia.com.br
```

## 🔧 Desenvolvimento Local

### Backend
```bash
cd backend
npm install
npm run dev  # Desenvolvimento na porta 3001
npm run build  # Build para produção
npm start  # Produção
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Desenvolvimento na porta 3000
npm run build  # Build para produção
npm start  # Preview da build
```

## 🔄 Atualizações

```bash
# Rebuild e redeploy
docker build -t barbershop-backend:latest backend/
docker build -t barbershop-frontend:latest frontend/
docker stack deploy -c deploy/stack.yml barbershop
```

## 🐛 Troubleshooting

### Verificar status dos serviços
```bash
docker stack ps barbershop
docker service inspect barbershop_frontend
docker service inspect barbershop_backend
```

### Logs detalhados
```bash
docker service logs -f barbershop_frontend
docker service logs -f barbershop_backend
```

### Rede e conectividade
```bash
# Verificar rede
docker network ls | grep network_public

# Verificar se Traefik está rodando
docker ps | grep traefik
```

## 📂 Estrutura do Projeto

```
projeto/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── data.ts
│   │   ├── config/
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
├── deploy/
│   └── stack.yml
└── README.md
```

## 🔐 Variáveis de Ambiente

### Backend (.env)
```
POSTGRES_HOST=5.78.113.107
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=Mfcd62!!Mfcd62!!SaaS
POSTGRES_DATABASE=barbearia
POSTGRES_PORT=5432
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
```

### Frontend (.env)
```
VITE_API_BASE=https://api.zbarbe.zenni-ia.com.br
```

## 📞 Suporte

Em caso de problemas:
1. Verificar logs dos serviços
2. Confirmar DNS e certificados
3. Validar configuração do Traefik
4. Testar conectividade com o banco de dados