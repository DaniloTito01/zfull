#!/bin/bash

echo "🚀 Iniciando deploy do Sistema de Barbearia..."

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Limpar build anterior
echo "🧹 Limpando build anterior..."
npm run clean

# Gerar novo build
echo "🔨 Gerando novo build..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build gerado com sucesso!"
else
    echo "❌ Erro no build!"
    exit 1
fi

# Construir imagem Docker
echo "🐳 Construindo imagem Docker..."
docker build -t barbershop-api .

# Verificar se a imagem foi construída
if [ $? -eq 0 ]; then
    echo "✅ Imagem Docker criada com sucesso!"
else
    echo "❌ Erro ao criar imagem Docker!"
    exit 1
fi

# Iniciar containers
echo "🚀 Iniciando containers..."
docker-compose up -d

# Verificar se os containers estão rodando
echo "⏳ Aguardando inicialização..."
sleep 10

# Testar health check
echo "🔍 Testando health check..."
curl -f http://localhost:3000/health

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy realizado com sucesso!"
    echo "🌐 API disponível em: http://localhost:3000"
    echo "📋 Health check: http://localhost:3000/health"
    echo "📚 Documentação: http://localhost:3000"
else
    echo ""
    echo "❌ Falha no health check!"
    echo "📋 Verificando logs..."
    docker-compose logs barbershop-api
fi