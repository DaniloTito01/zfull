#!/bin/bash

# 🧪 Script de Teste do Sistema de Logging
# Data: 23/09/2025 19:40
# Testa todas as funcionalidades do sistema de logs

echo "🧪 Iniciando testes do sistema de logging..."
echo "Data: $(date)"
echo "==========================================="

# Cores para output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Contadores de teste
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Função para log de teste
log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ [PASS]${NC} $test_name: $message"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ [FAIL]${NC} $test_name: $message"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  [WARN]${NC} $test_name: $message"
    else
        echo -e "${BLUE}ℹ️  [INFO]${NC} $test_name: $message"
    fi
}

# Função para verificar se arquivo existe
check_file() {
    local file_path="$1"
    local description="$2"

    if [ -f "$file_path" ]; then
        log_test "File Check" "PASS" "$description existe: $file_path"
        return 0
    else
        log_test "File Check" "FAIL" "$description não encontrado: $file_path"
        return 1
    fi
}

# Função para verificar diretório
check_directory() {
    local dir_path="$1"
    local description="$2"

    if [ -d "$dir_path" ]; then
        log_test "Directory Check" "PASS" "$description existe: $dir_path"
        return 0
    else
        log_test "Directory Check" "FAIL" "$description não encontrado: $dir_path"
        return 1
    fi
}

echo ""
echo "🗂️  TESTE 1: Estrutura de Diretórios de Logs"
echo "=============================================="

# Verificar estrutura base
check_directory "/root/projetobarbearia1/logs" "Diretório principal de logs"
check_directory "/root/projetobarbearia1/logs/frontend" "Diretório logs frontend"
check_directory "/root/projetobarbearia1/logs/backend" "Diretório logs backend"
check_directory "/root/projetobarbearia1/logs/errors" "Diretório logs de erros"
check_directory "/root/projetobarbearia1/logs/performance" "Diretório logs de performance"
check_directory "/root/projetobarbearia1/logs/audit" "Diretório logs de auditoria"

# Verificar subdiretórios frontend
check_directory "/root/projetobarbearia1/logs/frontend/dashboard" "Logs do dashboard"
check_directory "/root/projetobarbearia1/logs/frontend/appointments" "Logs de agendamentos"
check_directory "/root/projetobarbearia1/logs/frontend/clients" "Logs de clientes"
check_directory "/root/projetobarbearia1/logs/frontend/barbers" "Logs de barbeiros"

# Verificar subdiretórios backend
check_directory "/root/projetobarbearia1/logs/backend/api" "Logs da API"
check_directory "/root/projetobarbearia1/logs/backend/database" "Logs do database"
check_directory "/root/projetobarbearia1/logs/backend/auth" "Logs de autenticação"

echo ""
echo "📄 TESTE 2: Arquivos de Sistema de Logging"
echo "==========================================="

# Verificar arquivos de logging
check_file "/root/projetobarbearia1/backend/src/utils/logger.ts" "Logger do backend"
check_file "/root/projetobarbearia1/frontend/src/lib/logger.ts" "Logger do frontend"
check_file "/root/projetobarbearia1/frontend/src/components/LogViewer.tsx" "Componente visualizador de logs"
check_file "/root/projetobarbearia1/logs/README.md" "Documentação do sistema de logs"

echo ""
echo "🔧 TESTE 3: Configurações do Sistema"
echo "===================================="

# Verificar se o backend foi atualizado com logging
if grep -q "import.*logger" "/root/projetobarbearia1/backend/src/server.ts"; then
    log_test "Backend Integration" "PASS" "Logger importado no servidor backend"
else
    log_test "Backend Integration" "FAIL" "Logger não encontrado no servidor backend"
fi

if grep -q "loggerMiddleware" "/root/projetobarbearia1/backend/src/server.ts"; then
    log_test "Middleware Integration" "PASS" "Middleware de logging configurado"
else
    log_test "Middleware Integration" "FAIL" "Middleware de logging não configurado"
fi

echo ""
echo "🌐 TESTE 4: Conectividade do Sistema"
echo "===================================="

# Verificar se os serviços estão rodando
if docker service ls | grep -q "zbarbe-raw_backend.*1/1"; then
    log_test "Backend Service" "PASS" "Serviço backend está ativo"

    # Testar endpoint de logs
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200"; then
        log_test "Backend Health" "PASS" "Backend respondendo corretamente"

        # Testar endpoint de logs do frontend
        log_response=$(curl -s -X POST http://localhost:3001/api/logs \\
            -H "Content-Type: application/json" \\
            -d '{"level":"INFO","component":"test","action":"test_log","message":"Teste do sistema de logs"}' \\
            -w "%{http_code}")

        if echo "$log_response" | grep -q "200"; then
            log_test "Log Endpoint" "PASS" "Endpoint de logs do frontend funcionando"
        else
            log_test "Log Endpoint" "FAIL" "Endpoint de logs não está funcionando"
        fi
    else
        log_test "Backend Health" "FAIL" "Backend não está respondendo"
    fi
else
    log_test "Backend Service" "FAIL" "Serviço backend não está ativo"
fi

if docker service ls | grep -q "zbarbe-raw_frontend.*1/1"; then
    log_test "Frontend Service" "PASS" "Serviço frontend está ativo"
else
    log_test "Frontend Service" "FAIL" "Serviço frontend não está ativo"
fi

echo ""
echo "📊 TESTE 5: Geração de Logs de Teste"
echo "===================================="

# Gerar alguns logs de teste via API para verificar funcionamento
echo "Gerando logs de teste..."

# Teste GET simples
log_test "API Test" "INFO" "Fazendo requisição para /api/barbershops"
barbershops_response=$(curl -s http://localhost:3001/api/barbershops)

if echo "$barbershops_response" | grep -q "success"; then
    log_test "Barbershops API" "PASS" "API de barbearias respondeu corretamente"
else
    log_test "Barbershops API" "FAIL" "API de barbearias não funcionou"
fi

# Teste Health Check
health_response=$(curl -s http://localhost:3001/health)
if echo "$health_response" | grep -q "ok"; then
    log_test "Health Check" "PASS" "Health check funcionando"
else
    log_test "Health Check" "FAIL" "Health check falhou"
fi

echo ""
echo "📁 TESTE 6: Verificação de Logs Gerados"
echo "======================================="

# Aguardar um pouco para logs serem escritos
sleep 2

# Verificar se logs foram criados
log_date=$(date +%Y-%m-%d)
log_files_found=0

# Verificar logs do backend
backend_logs="/root/projetobarbearia1/logs/backend"
if [ -d "$backend_logs" ]; then
    for subdir in api database auth middleware routes utils; do
        if find "$backend_logs/$subdir" -name "${log_date}-*.log" -type f | grep -q .; then
            log_test "Log Creation" "PASS" "Logs criados em backend/$subdir"
            log_files_found=$((log_files_found + 1))
        fi
    done
fi

# Verificar logs de erro
if find "/root/projetobarbearia1/logs/errors" -name "${log_date}-*.log" -type f | grep -q .; then
    log_test "Error Logs" "PASS" "Logs de erro foram criados"
    log_files_found=$((log_files_found + 1))
fi

# Verificar logs de performance
if find "/root/projetobarbearia1/logs/performance" -name "${log_date}-*.log" -type f | grep -q .; then
    log_test "Performance Logs" "PASS" "Logs de performance foram criados"
    log_files_found=$((log_files_found + 1))
fi

if [ $log_files_found -gt 0 ]; then
    log_test "Log Generation" "PASS" "Sistema está gerando logs ($log_files_found tipos encontrados)"
else
    log_test "Log Generation" "WARN" "Poucos ou nenhum arquivo de log encontrado (pode ser normal em primeiro uso)"
fi

echo ""
echo "🎯 TESTE 7: Qualidade dos Logs"
echo "=============================="

# Verificar conteúdo dos logs (se existirem)
recent_log=$(find "/root/projetobarbearia1/logs" -name "*.log" -type f -newer "/tmp" 2>/dev/null | head -1)

if [ -n "$recent_log" ] && [ -f "$recent_log" ]; then
    log_test "Log Content" "INFO" "Analisando log: $recent_log"

    # Verificar formato JSON
    if head -1 "$recent_log" | grep -q "timestamp.*level.*component"; then
        log_test "Log Format" "PASS" "Logs estão em formato JSON estruturado"
    else
        log_test "Log Format" "WARN" "Formato de log pode não estar correto"
    fi

    # Verificar se tem dados relevantes
    if grep -q "request_id\\|barbershop_id\\|duration_ms" "$recent_log"; then
        log_test "Log Data" "PASS" "Logs contêm metadados relevantes"
    else
        log_test "Log Data" "WARN" "Logs podem estar sem metadados importantes"
    fi
else
    log_test "Log Analysis" "WARN" "Nenhum log recente encontrado para análise"
fi

echo ""
echo "📈 TESTE 8: Performance do Sistema"
echo "=================================="

# Testar tempo de resposta da API
start_time=$(date +%s%N)
curl -s http://localhost:3001/api/data >/dev/null
end_time=$(date +%s%N)
duration_ms=$(( (end_time - start_time) / 1000000 ))

if [ $duration_ms -lt 2000 ]; then
    log_test "API Performance" "PASS" "API respondeu em ${duration_ms}ms (< 2s)"
elif [ $duration_ms -lt 5000 ]; then
    log_test "API Performance" "WARN" "API respondeu em ${duration_ms}ms (aceitável)"
else
    log_test "API Performance" "FAIL" "API muito lenta: ${duration_ms}ms (> 5s)"
fi

echo ""
echo "🏁 RESUMO DOS TESTES"
echo "==================="
echo "Total de testes: $TOTAL_TESTS"
echo -e "Sucessos: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Falhas: ${RED}$FAILED_TESTS${NC}"
echo ""

# Calcular porcentagem de sucesso
if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))

    if [ $success_rate -ge 90 ]; then
        echo -e "${GREEN}🎉 EXCELENTE!${NC} Sistema de logging funcionando perfeitamente ($success_rate% de sucesso)"
    elif [ $success_rate -ge 75 ]; then
        echo -e "${YELLOW}⚠️  BOM${NC} Sistema funcionando bem com algumas ressalvas ($success_rate% de sucesso)"
    elif [ $success_rate -ge 50 ]; then
        echo -e "${YELLOW}⚠️  PARCIAL${NC} Sistema funcionando parcialmente ($success_rate% de sucesso)"
    else
        echo -e "${RED}❌ FALHAS${NC} Sistema com problemas significativos ($success_rate% de sucesso)"
    fi
else
    echo -e "${RED}❌ ERRO${NC} Nenhum teste foi executado"
fi

echo ""
echo "📋 Próximos passos recomendados:"
echo "1. Verificar logs gerados em: /root/projetobarbearia1/logs/"
echo "2. Monitorar performance das APIs"
echo "3. Implementar alertas para erros críticos"
echo "4. Configurar rotação de logs"

echo ""
echo "✅ Teste concluído em $(date)"
echo "==========================================="