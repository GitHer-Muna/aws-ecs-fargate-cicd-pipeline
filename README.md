# AWS ECS Fargate CI/CD Pipeline

Automated deployment pipeline for a full-stack application using AWS ECS Fargate, CodePipeline, and CodeBuild. Every push to GitHub automatically builds Docker images and deploys to production with zero downtime.

[![AWS](https://img.shields.io/badge/AWS-ECS%20Fargate-orange)](https://aws.amazon.com/fargate/)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-blue)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

---

## What This Project Does

Deploys **CloudCare** (a full-stack ticketing system) on AWS with complete automation:
- **Push to GitHub** → Pipeline automatically triggers
- **CodeBuild** → Builds Docker images for backend + frontend
- **ECR** → Stores container images
- **ECS Fargate** → Deploys with blue/green strategy
- **Zero downtime** → Seamless updates

Real production setup you can put on your resume.

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for complete architecture diagrams and data flow.

**High-level flow:**
```
GitHub (Source)
    ↓
AWS CodePipeline (Orchestration)
    ↓
AWS CodeBuild (Build Docker Images)
    ↓
Amazon ECR (Store Images)
    ↓
AWS ECS Fargate (Run Containers)
    ├── Backend (Node.js API)
    ├── Frontend (React + Nginx)
    └── RDS PostgreSQL
```

---

## AWS Services Used

- **ECS Fargate** - Serverless container orchestration
- **ECR** - Docker image registry
- **CodePipeline** - CI/CD workflow automation
- **CodeBuild** - Build and test automation
- **CodeDeploy** - Blue/green deployments
- **RDS** - Managed PostgreSQL database
- **Application Load Balancer** - Traffic distribution
- **CloudWatch** - Logs and monitoring
- **Secrets Manager** - Secure credential storage
- **IAM** - Access management

---

## Project Files

```
├── Dockerfile.backend              # Backend container config
├── Dockerfile.frontend             # Frontend container config  
├── buildspec.yml                   # CodeBuild build instructions
├── appspec.yml                     # CodeDeploy configuration
├── task-definition-backend.json    # ECS backend task definition
├── task-definition-frontend.json   # ECS frontend task definition
├── .dockerignore                   # Docker build exclusions
├── src/                           # Backend Node.js code
├── frontend/                      # React frontend code
└── prisma/                        # Database schema
```

---

## Quick Start (Local Testing)

Test Docker builds before deploying to AWS:

```bash
# Clone the repo
git clone https://github.com/GitHer-Muna/aws-ecs-fargate-cicd-pipeline.git
cd aws-ecs-fargate-cicd-pipeline

# Build backend image
docker build -f Dockerfile.backend -t cloudcare-backend:test .

# Build frontend image
docker build -f Dockerfile.frontend -t cloudcare-frontend:test .

# Verify images
docker images | grep cloudcare
```

---

## AWS Setup Guide

Follow the complete step-by-step tutorial in [BLOG.md](BLOG.md)

**Summary:**
1. Create ECR repositories
2. Set up RDS PostgreSQL
3. Create ECS cluster and services
4. Configure Application Load Balancer
5. Store secrets in Secrets Manager
6. Create CodeBuild project
7. Set up CodePipeline
8. Push code and watch auto-deployment!

**Time needed:** 3-4 hours  
**Cost:** Free tier eligible (~$10-15/month if you exceed limits)

---

## What This Demonstrates

**Docker Skills:**
- Multi-stage builds for optimized images
- Container security (non-root users)
- Health checks
- Production-ready configurations

**AWS Skills:**
- ECS Fargate (serverless containers)
- Container orchestration
- Load balancing
- Database management (RDS)
- Secrets management
- IAM roles and policies

**CI/CD Skills:**
- Automated build pipelines
- Blue/green deployments
- Zero-downtime updates
- Infrastructure as code concepts

**DevOps Best Practices:**
- Automated deployments
- Container logging (CloudWatch)
- Health monitoring
- Security scanning
- Cost optimization

---

## Application Stack

The deployed application is **CloudCare** - a ticketing system with:

**Backend:**
- Node.js 18 + TypeScript + Express
- PostgreSQL + Prisma ORM  
- JWT authentication
- REST API

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS
- Nginx web server

---

## Documentation

- **[BLOG.md](BLOG.md)** - Complete step-by-step tutorial for Medium
- **[DEPLOY.md](DEPLOY.md)** - Original CloudCare deployment guide
- **[docs/API.md](docs/API.md)** - API documentation

---

## Cost Breakdown

**Free Tier Eligible:**
- ECS Fargate: First 20 GB-hours free per month
- ECR: 500 MB storage free
- CodeBuild: 100 minutes/month free
- ALB: Partial free tier

**Estimated Monthly Cost (beyond free tier):**
- ~$10-15 for small workloads
- ~$30-50 for moderate usage

**Cost Saving Tips:**
- Stop services when not in use
- Use t3.micro for RDS
- Delete old ECR images
- Set up billing alerts

---

## Next Level Improvements

Want to make this even more impressive? Try:

- [ ] Add Terraform/CloudFormation for Infrastructure as Code
- [ ] Implement auto-scaling policies
- [ ] Set up multi-AZ deployment for high availability
- [ ] Add CloudFront CDN for global performance
- [ ] Integrate AWS WAF for security
- [ ] Set up Prometheus + Grafana dashboards
- [ ] Implement canary deployments
- [ ] Add SSL/TLS with ACM
- [ ] Custom domain with Route 53
- [ ] Automated testing in pipeline

---

## Troubleshooting

**Build fails:**
- Check CloudWatch logs in CodeBuild
- Verify Dockerfile syntax
- Ensure all dependencies are in package.json

**Deployment fails:**
- Check ECS service events
- Verify security group rules
- Check task definition configuration
- Review CloudWatch container logs

**Application not accessible:**
- Verify target group health checks
- Check security group inbound rules
- Ensure ALB listener is configured correctly
- Verify DNS propagation

---

## Contributing

This is a learning project. Feel free to fork and experiment!

---

## License

MIT License - Free to use for learning and portfolio projects.

---

## Author

Built by an aspiring DevOps engineer as a hands-on learning project. Perfect for:
- Job applications
- Portfolio demonstrations
- Learning AWS services
- Understanding CI/CD pipelines

**Looking for DevOps opportunities!** Connect with me:
- GitHub: [@GitHer-Muna](https://github.com/GitHer-Muna)
- LinkedIn: [Your LinkedIn]
- Blog: [Your Medium]

---

*Made with ☕ and lots of AWS documentation reading*
