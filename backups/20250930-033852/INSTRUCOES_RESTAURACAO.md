# 🔄 INSTRUÇÕES DE RESTAURAÇÃO DO SISTEMA ZBARBE

## 📋 **CONTEÚDO DO BACKUP**

Este backup contém:
- ✅ **database_backup.sql** - Backup completo do banco PostgreSQL
- ✅ **source_code_backup.tar.gz** - Código fonte completo (frontend + backend)
- ✅ **docker_images.txt** - Lista das imagens Docker em uso
- ✅ **docker_services.txt** - Status dos serviços Docker
- ✅ **HISTORICO_SISTEMA.md** - Documentação completa do sistema
- ✅ **VERSION_INFO.json** - Informações de versionamento
- ✅ **INSTRUCOES_RESTAURACAO.md** - Este arquivo

---

## 🔧 **RESTAURAÇÃO COMPLETA**

### **1. Pré-requisitos**
```bash
# Instalar dependências
apt update && apt install -y docker.io postgresql-client nodejs npm

# Configurar Docker Swarm (se necessário)
docker swarm init
```

### **2. Restaurar Código Fonte**
```bash
# Extrair código fonte
cd /root/
tar -xzf projetobarbearia1/backups/20250930-033852/source_code_backup.tar.gz

# Restaurar estrutura
mv extracted_files/ projetobarbearia1/
cd projetobarbearia1/
```

### **3. Restaurar Banco de Dados**
```bash
# Conectar ao PostgreSQL
export PGPASSWORD="Mfcd62!!Mfcd62!!SaaS"

# Restaurar banco (vai recriar completamente)
psql -h 5.78.113.107 -U postgres -f backups/20250930-033852/database_backup.sql

# Verificar restauração
psql -h 5.78.113.107 -U postgres -d barber_system -c "\dt"
```

### **4. Rebuild das Imagens Docker**
```bash
# Backend
cd backend/
npm install
npm run build
docker build --no-cache -t zbarbe-backend:production-20250930-032125 .

# Frontend
cd ../frontend/
npm install
npm run build
docker build --no-cache -t zbarbe-frontend:production-20250930-030347 .
```

### **5. Deploy dos Serviços**
```bash
# Criar rede externa (se não existir)
docker network create --driver overlay network_public

# Deploy backend
docker stack deploy -c docker-stack-production.yml zbarbe

# Deploy frontend
docker stack deploy -c docker-stack-frontend-simple.yml zbarbe-frontend
```

### **6. Verificação**
```bash
# Verificar serviços
docker service ls

# Verificar logs
docker service logs zbarbe_backend
docker service logs zbarbe-frontend_frontend

# Testar APIs
curl https://api.zbarbe.zenni-ia.com.br/health
curl https://zbarbe.zenni-ia.com.br
```

---

## 🔐 **CREDENCIAIS DE ACESSO**

### **Super Administrador**
- **Email:** admin@zbarbe.com
- **Senha:** admin123

### **Barbearia Clássica**
- **Email:** admin@barbeariaclassica.com
- **Senha:** admin123

### **Corte & Estilo**
- **Email:** admin@corteestilo.com
- **Senha:** admin123

### **Banco de Dados**
- **Host:** 5.78.113.107
- **Porta:** 5432
- **Database:** barber_system
- **Usuário:** postgres
- **Senha:** Mfcd62!!Mfcd62!!SaaS

---

## 🌐 **CONFIGURAÇÃO DNS**

Para funcionamento completo, configure os domínios:
- **zbarbe.zenni-ia.com.br** → 5.78.113.107
- **api.zbarbe.zenni-ia.com.br** → 5.78.113.107

---

## 🚨 **RESTAURAÇÃO PARCIAL**

### **Apenas Banco de Dados**
```bash
export PGPASSWORD="Mfcd62!!Mfcd62!!SaaS"
psql -h 5.78.113.107 -U postgres -f database_backup.sql
```

### **Apenas Código**
```bash
tar -xzf source_code_backup.tar.gz
# Copiar arquivos necessários
```

### **Apenas Configurações Docker**
```bash
# Extrair apenas configurações
tar -xzf source_code_backup.tar.gz --wildcards "*.yml"
```

---

## 📊 **VERIFICAÇÃO DE INTEGRIDADE**

### **Verificar Backup do Banco**
```bash
# Contar tabelas
grep "CREATE TABLE" database_backup.sql | wc -l
# Deve retornar: 13

# Verificar dados críticos
grep -i "INSERT INTO" database_backup.sql | head -5
```

### **Verificar Código Fonte**
```bash
# Verificar tamanho
ls -lh source_code_backup.tar.gz
# Deve ser ~600KB

# Listar conteúdo
tar -tzf source_code_backup.tar.gz | head -10
```

---

## 🔄 **ATUALIZAÇÃO DE VERSÃO**

Para atualizar para nova versão:

1. **Fazer backup atual**
2. **Atualizar código fonte**
3. **Executar migrações de banco** (se houver)
4. **Rebuild imagens Docker**
5. **Deploy gradual** (zero downtime)

---

## 📞 **SUPORTE**

Em caso de problemas na restauração:
1. Verificar logs dos containers
2. Verificar conectividade de rede
3. Verificar permissões de arquivo
4. Verificar configurações de DNS

**Data do Backup:** 30/09/2025 03:38:52
**Versão:** 1.0.0
**Status:** Sistema completamente funcional