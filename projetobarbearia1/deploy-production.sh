#!/bin/bash

# Deploy script for ZBarbe production environment
set -e

# Configuration
REGISTRY="your-registry.com"  # Replace with your Docker registry
PROJECT_NAME="zbarbe"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAG="v${TIMESTAMP}"

echo "🚀 Starting ZBarbe production deployment..."
echo "📅 Timestamp: $TIMESTAMP"
echo "🏷️  Tag: $TAG"

# Step 1: Build Frontend
echo "🏗️  Building frontend image..."
cd frontend
docker build --no-cache -t ${PROJECT_NAME}-frontend:${TAG} .
docker tag ${PROJECT_NAME}-frontend:${TAG} ${PROJECT_NAME}-frontend:latest
cd ..

# Step 2: Build Backend
echo "🏗️  Building backend image..."
cd backend
docker build --no-cache -t ${PROJECT_NAME}-backend:${TAG} .
docker tag ${PROJECT_NAME}-backend:${TAG} ${PROJECT_NAME}-backend:latest
cd ..

# Step 3: Push to registry (if registry is configured)
if [ "$REGISTRY" != "your-registry.com" ]; then
    echo "📤 Pushing images to registry..."

    docker tag ${PROJECT_NAME}-frontend:${TAG} ${REGISTRY}/${PROJECT_NAME}-frontend:${TAG}
    docker tag ${PROJECT_NAME}-backend:${TAG} ${REGISTRY}/${PROJECT_NAME}-backend:${TAG}

    docker push ${REGISTRY}/${PROJECT_NAME}-frontend:${TAG}
    docker push ${REGISTRY}/${PROJECT_NAME}-backend:${TAG}

    docker tag ${REGISTRY}/${PROJECT_NAME}-frontend:${TAG} ${REGISTRY}/${PROJECT_NAME}-frontend:latest
    docker tag ${REGISTRY}/${PROJECT_NAME}-backend:${TAG} ${REGISTRY}/${PROJECT_NAME}-backend:latest

    docker push ${REGISTRY}/${PROJECT_NAME}-frontend:latest
    docker push ${REGISTRY}/${PROJECT_NAME}-backend:latest
fi

# Step 4: Deploy to Docker Swarm
echo "🐳 Deploying to Docker Swarm..."

# Initialize swarm if not already done
if ! docker info | grep -q "Swarm: active"; then
    echo "🔧 Initializing Docker Swarm..."
    docker swarm init
fi

# Deploy the stack
echo "📋 Deploying stack with tag: $TAG"
TAG=$TAG docker stack deploy -c docker-compose.prod.yml ${PROJECT_NAME}-stack

# Step 5: Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Step 6: Check service status
echo "🔍 Checking service status..."
docker stack services ${PROJECT_NAME}-stack

# Step 7: Health check
echo "🏥 Performing health checks..."

# Check frontend
echo "Checking frontend health..."
for i in {1..10}; do
    if curl -f http://localhost/ > /dev/null 2>&1; then
        echo "✅ Frontend is healthy"
        break
    else
        echo "⏳ Waiting for frontend... (attempt $i/10)"
        sleep 10
    fi
done

# Check backend
echo "Checking backend health..."
for i in {1..10}; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy"
        break
    else
        echo "⏳ Waiting for backend... (attempt $i/10)"
        sleep 10
    fi
done

echo "🎉 Deployment completed successfully!"
echo "🏷️  Frontend: ${PROJECT_NAME}-frontend:${TAG}"
echo "🏷️  Backend: ${PROJECT_NAME}-backend:${TAG}"
echo "🌐 Frontend URL: http://localhost/"
echo "🔧 Backend URL: http://localhost:3001/"

# Optional: Show logs
read -p "Do you want to see the service logs? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📋 Showing recent logs..."
    docker service logs --tail 50 ${PROJECT_NAME}-stack_frontend
    docker service logs --tail 50 ${PROJECT_NAME}-stack_backend
fi

echo "✨ Deployment script completed!"