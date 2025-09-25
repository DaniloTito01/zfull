#!/bin/bash

# Deploy script for ZBarbe system
# Usage: ./deploy.sh [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="zbarbe-stack"
VERSION=${1:-$(date +"%Y%m%d-%H%M%S")}
REGISTRY="registry.hub.docker.com"  # Change to your registry if needed

echo -e "${BLUE}🚀 Starting ZBarbe deployment...${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Stack: ${STACK_NAME}${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! docker node ls >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker Swarm is not initialized${NC}"
    echo -e "${YELLOW}💡 Initialize Docker Swarm with: docker swarm init${NC}"
    exit 1
fi

# Check if network exists
if ! docker network ls --filter name=network_public --format "{{.Name}}" | grep -q "^network_public$"; then
    echo -e "${YELLOW}🔗 Creating network_public...${NC}"
    docker network create --driver overlay --attachable network_public
fi

# Build images
echo -e "${YELLOW}🔨 Building images...${NC}"
echo -e "${BLUE}Building frontend image...${NC}"
docker build -f Dockerfile.frontend -t zbarbe-frontend:${VERSION} -t zbarbe-frontend:latest .

echo -e "${BLUE}Building backend image...${NC}"
docker build -f backend/Dockerfile.backend -t zbarbe-backend:${VERSION} -t zbarbe-backend:latest ./backend

# Deploy stack
echo -e "${YELLOW}🚢 Deploying to Docker Swarm...${NC}"
export VERSION=${VERSION}
docker stack deploy -c docker-stack.yml ${STACK_NAME}

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service status
echo -e "${YELLOW}📊 Checking service status...${NC}"
docker service ls --filter label=com.docker.stack.namespace=${STACK_NAME}

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
for i in {1..30}; do
    if curl -f -s https://zbarbe.zenni-ia.com.br/ > /dev/null; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for frontend... ($i/30)${NC}"
        sleep 10
    fi
done

for i in {1..30}; do
    if curl -f -s https://zbarbe.zenni-ia.com.br/api/health > /dev/null; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for backend... ($i/30)${NC}"
        sleep 10
    fi
done

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌍 Application is available at: https://zbarbe.zenni-ia.com.br${NC}"
echo -e "${BLUE}📊 Monitor services with: docker service ls${NC}"
echo -e "${BLUE}📝 View logs with: docker service logs ${STACK_NAME}_frontend${NC}"
echo -e "${BLUE}📝 View logs with: docker service logs ${STACK_NAME}_backend${NC}"