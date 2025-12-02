# CloudCare Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [AWS ECS Deployment](#aws-ecs-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Migrations](#database-migrations)
7. [Monitoring Setup](#monitoring-setup)

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 16
- npm or yarn

### Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd cloudcare-ticketing-service
npm install
cd frontend && npm install && cd ..
```

2. **Configure Environment**
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

3. **Start PostgreSQL**
```bash
docker run -d \
  --name cloudcare-postgres \
  -e POSTGRES_DB=cloudcare_db \
  -e POSTGRES_USER=cloudcare \
  -e POSTGRES_PASSWORD=cloudcare123 \
  -p 5432:5432 \
  postgres:16-alpine
```

4. **Run Migrations & Seed**
```bash
npx prisma migrate dev
npx prisma db seed
```

5. **Start Development Servers**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api/v1

## Docker Deployment

### Development Mode

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production Mode

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## AWS ECS Deployment

### Prerequisites
- AWS CLI configured
- Terraform installed
- ECR repositories created

### Step 1: Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
docker build -t cloudcare-backend .
docker tag cloudcare-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/cloudcare-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/cloudcare-backend:latest

# Build and push frontend
cd frontend
docker build -t cloudcare-frontend .
docker tag cloudcare-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/cloudcare-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/cloudcare-frontend:latest
```

### Step 2: Set up RDS PostgreSQL

```bash
# Create RDS instance via Terraform or AWS Console
# Recommended settings:
# - Engine: PostgreSQL 16
# - Instance class: db.t3.micro (dev) / db.t3.medium (prod)
# - Storage: 20GB with autoscaling
# - Multi-AZ: Yes (production)
```

### Step 3: Configure Secrets Manager

```bash
# Store database URL
aws secretsmanager create-secret \
  --name cloudcare/database-url \
  --secret-string "postgresql://user:password@rds-endpoint:5432/cloudcare_db"

# Store JWT secrets
aws secretsmanager create-secret \
  --name cloudcare/jwt-secret \
  --secret-string "your-super-secret-jwt-key"
```

### Step 4: Create ECS Task Definition

See `infrastructure/ecs-task-definition.json` for complete example.

### Step 5: Deploy to ECS

```bash
# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://infrastructure/ecs-task-definition.json

# Create or update service
aws ecs create-service \
  --cluster cloudcare-cluster \
  --service-name cloudcare-service \
  --task-definition cloudcare-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=3000"
```

## Kubernetes Deployment

### Prerequisites
- kubectl configured
- Kubernetes cluster (EKS, GKE, or local)
- Helm 3+ installed

### Step 1: Create Namespace

```bash
kubectl create namespace cloudcare
```

### Step 2: Create Secrets

```bash
# Database credentials
kubectl create secret generic cloudcare-db \
  --from-literal=DATABASE_URL='postgresql://user:password@postgres:5432/cloudcare_db' \
  -n cloudcare

# JWT secrets
kubectl create secret generic cloudcare-jwt \
  --from-literal=JWT_SECRET='your-secret' \
  --from-literal=JWT_REFRESH_SECRET='your-refresh-secret' \
  -n cloudcare
```

### Step 3: Deploy PostgreSQL

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \
  --set auth.username=cloudcare \
  --set auth.password=cloudcare123 \
  --set auth.database=cloudcare_db \
  --namespace cloudcare
```

### Step 4: Deploy Application

```bash
kubectl apply -f infrastructure/k8s/ -n cloudcare
```

### Step 5: Verify Deployment

```bash
# Check pods
kubectl get pods -n cloudcare

# Check services
kubectl get svc -n cloudcare

# View logs
kubectl logs -f deployment/cloudcare-backend -n cloudcare
```

## Environment Variables

### Backend (.env)

```bash
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<64-char-random-string>
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Email (Optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
EMAIL_FROM=noreply@cloudcare.com

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```bash
VITE_API_URL=https://api.yourdomain.com/api/v1
```

## Database Migrations

### Development

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Apply migrations
npx prisma migrate dev
```

### Production

```bash
# Apply pending migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### In Docker/CI

```bash
# Run as part of container startup
docker-compose exec backend npx prisma migrate deploy
```

## Monitoring Setup

### Prometheus

```bash
# Scrape config (prometheus.yml)
scrape_configs:
  - job_name: 'cloudcare'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'
```

### Grafana Dashboard

Import dashboard from `infrastructure/grafana-dashboard.json`

Metrics available:
- HTTP request duration
- HTTP request count
- Process CPU usage
- Process memory usage
- Database connection pool

### CloudWatch (AWS)

```bash
# Container Insights
aws ecs update-cluster-settings \
  --cluster cloudcare-cluster \
  --settings name=containerInsights,value=enabled
```

### Health Checks

```bash
# Application health
curl http://localhost:3000/api/v1/health

# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /api/v1/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

# Kubernetes readiness probe
readinessProbe:
  httpGet:
    path: /api/v1/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql -h localhost -U cloudcare -d cloudcare_db

# Check logs
docker logs cloudcare-postgres
```

### Container Issues

```bash
# Check container logs
docker logs cloudcare-backend
docker logs cloudcare-frontend

# Enter container shell
docker exec -it cloudcare-backend sh

# Check environment variables
docker exec cloudcare-backend env
```

### Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Reset and reapply
npx prisma migrate reset
npx prisma migrate dev
```
