#!/bin/bash

# Rollback script for ZBarbe system
# Usage: ./rollback.sh [stack_name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME=${1:-"zbarbe-stack"}

echo -e "${BLUE}🔄 Starting ZBarbe rollback...${NC}"
echo -e "${BLUE}Stack: ${STACK_NAME}${NC}"

# Check if stack exists
if ! docker stack ls --format "{{.Name}}" | grep -q "^${STACK_NAME}$"; then
    echo -e "${RED}❌ Stack ${STACK_NAME} not found${NC}"
    exit 1
fi

# Show current service versions
echo -e "${YELLOW}📊 Current service status:${NC}"
docker service ls --filter label=com.docker.stack.namespace=${STACK_NAME}

# Ask for confirmation
echo -e "${YELLOW}⚠️  Are you sure you want to rollback stack ${STACK_NAME}? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${BLUE}Rollback cancelled${NC}"
    exit 0
fi

# Rollback services
echo -e "${YELLOW}🔄 Rolling back services...${NC}"
for service in $(docker service ls --filter label=com.docker.stack.namespace=${STACK_NAME} --format "{{.Name}}"); do
    echo -e "${BLUE}Rolling back service: ${service}${NC}"
    if docker service rollback ${service}; then
        echo -e "${GREEN}✅ Successfully rolled back ${service}${NC}"
    else
        echo -e "${RED}❌ Failed to rollback ${service}${NC}"
    fi
done

# Wait for rollback to complete
echo -e "${YELLOW}⏳ Waiting for rollback to complete...${NC}"
sleep 15

# Check service status
echo -e "${YELLOW}📊 Post-rollback service status:${NC}"
docker service ls --filter label=com.docker.stack.namespace=${STACK_NAME}

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
for i in {1..12}; do
    if curl -f -s https://zbarbe.zenni-ia.com.br/ > /dev/null; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for frontend... ($i/12)${NC}"
        sleep 10
    fi
done

for i in {1..12}; do
    if curl -f -s https://zbarbe.zenni-ia.com.br/api/health > /dev/null; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for backend... ($i/12)${NC}"
        sleep 10
    fi
done

echo -e "${GREEN}🎉 Rollback completed successfully!${NC}"
echo -e "${GREEN}🌍 Application is available at: https://zbarbe.zenni-ia.com.br${NC}"