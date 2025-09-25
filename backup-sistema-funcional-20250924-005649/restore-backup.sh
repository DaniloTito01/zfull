#!/bin/bash

# 🔄 SCRIPT DE RESTORE - VERSÃO FUNCIONANDO 100%
# Data: 23/09/2025 19:22
# Use este script para voltar à versão estável

echo "🔄 Iniciando restore para versão funcionando..."
echo "Data do backup: 23/09/2025 19:22"
echo "Tag: backup-working-20250923_192159"

# Verificar se as imagens existem
echo "🔍 Verificando imagens de backup..."
if ! docker image inspect zbarbe-frontend:backup-working-20250923_192159 >/dev/null 2>&1; then
    echo "❌ Erro: Imagem do frontend não encontrada!"
    exit 1
fi

if ! docker image inspect zbarbe-backend:backup-working-20250923_192159 >/dev/null 2>&1; then
    echo "❌ Erro: Imagem do backend não encontrada!"
    exit 1
fi

echo "✅ Imagens de backup encontradas!"

# Parar stack atual
echo "🛑 Parando stack atual..."
docker stack rm zbarbe-raw 2>/dev/null || true

# Aguardar remoção completa
echo "⏳ Aguardando remoção completa..."
sleep 15

# Deploy da versão de backup
echo "🚀 Fazendo deploy da versão de backup..."
docker stack deploy -c docker-stack-backup-working.yml zbarbe-raw

# Aguardar deploy
echo "⏳ Aguardando deployment..."
sleep 30

# Verificar status
echo "📊 Verificando status dos serviços..."
docker service ls | grep zbarbe-raw

# Testar conectividade
echo "🧪 Testando conectividade..."
echo "Frontend: http://zbarbe.zenni-ia.com.br:8080/"
echo "API: http://zbarbe.zenni-ia.com.br:8080/api/health"

# Teste básico da API
echo "🔍 Testando API..."
if curl -s http://zbarbe.zenni-ia.com.br:8080/api/health | grep -q "ok"; then
    echo "✅ API funcionando!"
else
    echo "⚠️  API pode não estar respondendo ainda. Aguarde alguns minutos."
fi

echo ""
echo "🎉 Restore concluído!"
echo "🌐 Acesse: http://zbarbe.zenni-ia.com.br:8080/"
echo ""
echo "Se houver problemas, aguarde alguns minutos para os containers inicializarem completamente."