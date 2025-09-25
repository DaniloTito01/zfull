# 🚀 Guia de Deploy - Sistema de Barbearia

## Pré-requisitos

- Node.js 18+ instalado
- Docker e Docker Compose instalados
- Acesso ao banco PostgreSQL configurado

## Métodos de Deploy

### 1. Deploy Manual (Node.js)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.production .env

# 3. Gerar build de produção
npm run rebuild

# 4. Iniciar servidor
npm start
```

### 2. Deploy com Docker (Recomendado)

```bash
# 1. Executar script de deploy automático
./deploy.sh
```

**OU fazer manualmente:**

```bash
# 1. Construir imagem Docker
docker build -t barbershop-api .

# 2. Executar com Docker Compose
docker-compose up -d

# 3. Verificar status
docker-compose ps
```

### 3. Deploy em Produção (VPS/Cloud)

#### Configuração do Servidor

```bash
# 1. Clonar repositório
git clone <seu-repositorio>
cd projetobarbearia/backend

# 2. Configurar variáveis de ambiente
nano .env.production

# 3. Executar deploy
./deploy.sh
```

#### Configuração do Nginx (Proxy Reverso)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Verificação do Deploy

Após o deploy, verifique se tudo está funcionando:

```bash
# Health Check
curl http://localhost:3000/health

# Documentação da API
curl http://localhost:3000/

# Logs (Docker)
docker-compose logs -f barbershop-api
```

## Variáveis de Ambiente Necessárias

```env
POSTGRES_HOST=5.78.113.107
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=Mfcd62!!Mfcd62!!SaaS
POSTGRES_DATABASE=barbearia
POSTGRES_PORT=5432
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
```

## Endpoints Disponíveis

- **Health Check**: `GET /health`
- **Documentação**: `GET /`
- **Usuários**: `POST /api/users/register`, `POST /api/users/login`, `GET /api/users`
- **Barbearias**: `GET /api/barbershops`, `POST /api/barbershops`
- **Serviços**: `GET /api/services`, `POST /api/services`
- **Barbeiros**: `GET /api/barbers`, `POST /api/barbers`
- **Clientes**: `GET /api/clients`, `POST /api/clients`
- **Agendamentos**: `GET /api/appointments`, `POST /api/appointments`

## Monitoramento

```bash
# Verificar status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Verificar uso de recursos
docker stats

# Reiniciar serviço
docker-compose restart barbershop-api
```

## Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar conectividade
node test-connection.js
```

### Container não inicia
```bash
# Verificar logs
docker-compose logs barbershop-api

# Reconstruir imagem
docker-compose build --no-cache
```

### Performance
```bash
# Verificar recursos
docker stats barbershop-api

# Ajustar recursos no docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

## 🎉 Deploy Completo!

✅ **Sistema publicado e rodando em produção**
🌐 **API disponível em**: http://localhost:3000 (ou seu domínio)
📋 **Health Check**: http://localhost:3000/health
📚 **Documentação**: http://localhost:3000/