# Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEVELOPER                                │
│                              │                                   │
│                         git push                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   GitHub Repository   │
                    │   (Source Control)    │
                    └──────────┬───────────┘
                               │ Webhook
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS CodePipeline                              │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Source    │───▶│    Build     │───▶│    Deploy    │       │
│  │  (GitHub)   │    │ (CodeBuild)  │    │ (CodeDeploy) │       │
│  └─────────────┘    └──────┬───────┘    └──────┬───────┘       │
└────────────────────────────┼────────────────────┼───────────────┘
                             │                    │
                             ▼                    │
                    ┌─────────────────┐          │
                    │   CodeBuild     │          │
                    │                 │          │
                    │  1. npm install │          │
                    │  2. Docker build│          │
                    │  3. Push to ECR │          │
                    └────────┬────────┘          │
                             │                    │
                             ▼                    │
                    ┌─────────────────┐          │
                    │  Amazon ECR     │          │
                    │  (Container     │          │
                    │   Registry)     │          │
                    │                 │          │
                    │  • Backend img  │          │
                    │  • Frontend img │          │
                    └────────┬────────┘          │
                             │                    │
                             └────────────────────┤
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Amazon ECS Cluster                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Application Load Balancer                    │   │
│  │                    (Port 80/443)                          │   │
│  └────────────────┬──────────────────┬──────────────────────┘   │
│                   │                  │                           │
│         ┌─────────▼─────────┐  ┌────▼──────────────┐            │
│         │  Frontend Service  │  │  Backend Service  │            │
│         │  (ECS Fargate)    │  │  (ECS Fargate)    │            │
│         │                   │  │                   │            │
│         │  • React + Nginx  │  │  • Node.js API    │            │
│         │  • Port 80        │  │  • Port 3000      │            │
│         │  • 1-3 tasks      │  │  • 1-3 tasks      │            │
│         └───────────────────┘  └────────┬──────────┘            │
└────────────────────────────────────────┼───────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │   Amazon RDS     │
                              │   PostgreSQL     │
                              │                  │
                              │  • Multi-AZ      │
                              │  • Automated     │
                              │    backups       │
                              └──────────────────┘

Additional AWS Services:
├─ CloudWatch: Logs & Monitoring
├─ Secrets Manager: Database credentials, JWT secrets
├─ VPC: Network isolation & security groups
└─ IAM: Roles & permissions
```

## Data Flow

1. **Developer pushes code** to GitHub
2. **CodePipeline detects** change via webhook
3. **CodeBuild**:
   - Pulls source code
   - Builds Docker images (backend + frontend)
   - Pushes images to ECR
4. **CodeDeploy**:
   - Updates ECS task definitions with new images
   - Performs blue/green deployment
   - Health checks before switching traffic
5. **ECS Fargate**:
   - Starts new tasks with updated images
   - Passes health checks
   - ALB switches traffic to new tasks
   - Old tasks gracefully shut down
6. **Result**: Zero-downtime deployment complete!

## Security Layers

- **VPC Isolation**: Services in private subnets
- **Security Groups**: Strict firewall rules
- **Secrets Manager**: No hardcoded credentials
- **IAM Roles**: Least privilege access
- **ALB**: SSL termination (when configured)
- **Container Security**: Non-root users, minimal images
