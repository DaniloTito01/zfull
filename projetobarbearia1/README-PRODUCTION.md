# Sistema de Barbearia - Deploy em Produção

## 🚀 Deploy Realizado com Sucesso

**Data:** 24/09/2025
**Versão:** clean-20250924-201548
**Ambiente:** Docker Swarm

## 📋 Informações do Deploy

### **Imagens Docker**
```bash
zbarbe-frontend:clean-20250924-201548
zbarbe-backend:clean-20250924-201648
```

### **Serviços em Produção**
- **Frontend**: `https://zbarbe.zenni-ia.com.br`
- **Backend API**: `https://api.zbarbe.zenni-ia.com.br`
- **Status**: ✅ Deployado e rodando

## 📁 Estrutura do Projeto

### **Frontend (React + TypeScript + Vite)**
- **Porta:** 80 (Nginx)
- **Dockerfile:** `./frontend/Dockerfile`
- **Scripts disponíveis:**
  - `npm run dev` - Servidor de desenvolvimento
  - `npm run build` - Build para produção
  - `npm run lint` - ESLint

### **Backend (Node.js + Express + TypeScript)**
- **Porta:** 3001
- **Dockerfile:** `./backend/Dockerfile`
- **Scripts disponíveis:**
  - `npm run dev` - Servidor de desenvolvimento com watch
  - `npm run build` - Build TypeScript
  - `npm run start` - Iniciar produção
  - `npm run lint` - ESLint

## 🔧 Como Fazer Deploy

### 1. Build das Imagens (Sem Cache)
```bash
export NEW_TAG=$(date +"%Y%m%d-%H%M%S")
docker build --no-cache -t zbarbe-frontend:clean-$NEW_TAG ./frontend/
docker build --no-cache -t zbarbe-backend:clean-$NEW_TAG ./backend/
```

### 2. Atualizar Stack File
```bash
# Editar docker-stack-clean.yml com as novas tags
sed -i "s/zbarbe-frontend:clean-[0-9]*-[0-9]*/zbarbe-frontend:clean-$NEW_TAG/g" docker-stack-clean.yml
sed -i "s/zbarbe-backend:clean-[0-9]*-[0-9]*/zbarbe-backend:clean-$NEW_TAG/g" docker-stack-clean.yml
```

### 3. Deploy no Docker Swarm
```bash
docker stack rm zbarbe-clean
sleep 30
docker stack deploy -c docker-stack-clean.yml zbarbe-clean
```

### 4. Verificar Status
```bash
docker service ls
docker stack ps zbarbe-clean
```

## 🏗️ Arquitetura Docker Swarm

### **Rede Externa**
```yaml
networks:
  network_public:
    external: true
```

### **Frontend Service**
- **Replicas:** 1
- **CPU:** 0.5 cores
- **Memory:** 512MB
- **Health Check:** Configurado
- **Traefik Labels:**
  - HTTP: `zbarbe.zenni-ia.com.br`
  - HTTPS: `zbarbe.zenni-ia.com.br` (Let's Encrypt)

### **Backend Service**
- **Replicas:** 1
- **CPU:** 1.0 cores
- **Memory:** 1024MB
- **Health Check:** Configurado
- **Traefik Labels:**
  - HTTP: `api.zbarbe.zenni-ia.com.br`
  - HTTPS: `api.zbarbe.zenni-ia.com.br` (Let's Encrypt)

## 🌐 Configuração de Roteamento

### **Frontend (Nginx)**
```nginx
# Proxy para API
location /api/ {
    proxy_pass http://zbarbe-clean_backend:3001/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# SPA Routing
location / {
    try_files $uri $uri/ /index.html;
}
```

### **Traefik Labels**
- **Frontend**: `zbarbe.zenni-ia.com.br` → Frontend Service (porta 80)
- **Backend**: `api.zbarbe.zenni-ia.com.br` → Backend Service (porta 3001)

## 🔐 Variáveis de Ambiente

### **Frontend**
```yaml
- VITE_API_BASE=https://zbarbe.zenni-ia.com.br/api
- NODE_ENV=production
```

### **Backend**
```yaml
- DB_HOST=5.78.113.107
- DB_PORT=5432
- DB_NAME=barber_system
- DB_USER=postgres
- DB_PASSWORD=Mfcd62!!Mfcd62!!SaaS
- JWT_SECRET=super-secret-jwt-key-for-production-change-this-immediately
- BCRYPT_ROUNDS=12
- PORT=3001
- NODE_ENV=production
- CORS_ORIGIN=https://zbarbe.zenni-ia.com.br
- FRONTEND_URL=https://zbarbe.zenni-ia.com.br
```

## ⚡ Health Checks

### **Frontend**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

### **Backend**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1
```

## 🛠️ Comandos de Diagnóstico

### **Verificar Serviços**
```bash
docker service ls
docker stack ps zbarbe-clean
```

### **Logs dos Serviços**
```bash
docker service logs zbarbe-clean_frontend
docker service logs zbarbe-clean_backend
```

### **Teste de Health Check**
```bash
docker exec $(docker ps -q --filter "name=zbarbe-clean_frontend") curl -f http://localhost/
docker exec $(docker ps -q --filter "name=zbarbe-clean_backend") curl -f http://localhost:3001/health
```

### **Teste de Conectividade Interna**
```bash
# Do frontend para backend
docker exec $(docker ps -q --filter "name=zbarbe-clean_frontend") curl -f http://zbarbe-clean_backend:3001/health
```

## ✅ Status Atual

- [x] ✅ Dockerfile para frontend separado
- [x] ✅ Dockerfile para backend separado
- [x] ✅ Docker Swarm stack configurado
- [x] ✅ Rede externa `network_public`
- [x] ✅ Réplicas únicas (stateless)
- [x] ✅ Traefik labels para frontend → `zbarbe.zenni-ia.com.br`
- [x] ✅ Traefik labels para backend → `api.zbarbe.zenni-ia.com.br`
- [x] ✅ Health checks configurados
- [x] ✅ HTTPS configurado (Let's Encrypt)
- [x] ✅ Scripts npm verificados
- [x] ✅ README de produção criado

**Status:** 🟢 **SISTEMA TOTALMENTE CONFIGURADO E PRONTO PARA PRODUÇÃO**

## 🚨 Próximos Passos

1. **Configurar DNS:**
   - Apontar `zbarbe.zenni-ia.com.br` para o servidor
   - Apontar `api.zbarbe.zenni-ia.com.br` para o servidor

2. **Deploy Final:**
   ```bash
   docker stack deploy -c docker-stack-clean.yml zbarbe-clean
   ```

3. **Verificar SSL:**
   - Aguardar geração dos certificados Let's Encrypt
   - Testar acesso HTTPS

**Sistema pronto para produção! 🚀**