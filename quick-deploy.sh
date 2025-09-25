#!/bin/bash

# Quick deployment script for ZBarbe
set -e

PROJECT_NAME="zbarbe"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAG="v${TIMESTAMP}"

echo "🚀 Quick deployment starting..."
echo "🏷️  Tag: $TAG"

# Build images with no cache
echo "🏗️  Building frontend..."
cd frontend && docker build --no-cache -t ${PROJECT_NAME}-frontend:${TAG} . && cd ..

echo "🏗️  Building backend..."
cd backend && docker build --no-cache -t ${PROJECT_NAME}-backend:${TAG} . && cd ..

# Tag as latest
docker tag ${PROJECT_NAME}-frontend:${TAG} ${PROJECT_NAME}-frontend:latest
docker tag ${PROJECT_NAME}-backend:${TAG} ${PROJECT_NAME}-backend:latest

# Deploy to swarm
echo "🐳 Deploying to Docker Swarm..."
TAG=$TAG docker stack deploy -c docker-compose.prod.yml ${PROJECT_NAME}-stack

echo "✅ Deployment completed with tag: $TAG"
docker stack services ${PROJECT_NAME}-stack