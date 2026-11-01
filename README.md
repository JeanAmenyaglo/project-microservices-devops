
# Microservices DevOps Capstone Project

A production-grade microservices application deployed on AWS EKS with full CI/CD automation, observability, and security scanning.

## Architecture

```
Browser
    ↓
AWS Load Balancer
    ↓
React Frontend (port 3000)
    ├── GET /api/users    → User Service (port 3001) → PostgreSQL (users_db)
    └── GET /api/products → Product Service (port 3002) → PostgreSQL (products_db)
                                    ↓
                            validates owner via REST → User Service
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Application | Node.js, Express, React, Vite |
| Containerization | Docker, Docker Compose |
| Container Registry | AWS ECR (Elastic Container Registry) |
| Orchestration | Kubernetes (AWS EKS) |
| Infrastructure | Terraform (IaC) |
| CI/CD | GitHub Actions + OIDC |
| Observability | Prometheus + Grafana |
| Security | Trivy image scanning, Helmet.js, non-root containers |
| Database | PostgreSQL (AWS RDS) |
| Cloud | AWS (ca-central-1) |

## Project Structure

```
microservices-app/
├── user-service/          # Node.js REST API for user management
├── product-service/       # Node.js REST API for product management
├── frontend/              # React + Vite frontend
├── infrastructure/        # Terraform IaC
│   └── modules/
│       ├── vpc/           # VPC, subnets, NAT gateways
│       ├── eks/           # EKS cluster and node groups
│       ├── ecr/           # Container registries
│       └── rds/           # PostgreSQL databases
├── k8s/                   # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   ├── servicemonitor.yaml
│   └── alertrule.yaml
└── .github/
    └── workflows/
        └── ci-cd.yml      # GitHub Actions pipeline
```

## Running Locally

### Prerequisites
- Node.js 20+
- Docker Desktop
- PostgreSQL

### Development Mode
```bash
# Start all services
cd user-service && npm install && npm run dev
cd product-service && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### Docker Compose
```bash
docker compose up --build
```

Access the app at `http://localhost:3000`

## Infrastructure Provisioning

### Prerequisites
- AWS CLI configured
- Terraform installed

### Deploy
```bash
cd infrastructure
terraform init
terraform plan -var="db_username=postgres" -var="db_password=<password>"
terraform apply -var="db_username=postgres" -var="db_password=<password>"
```

### Destroy
```bash
# Delete ECR images first
aws ecr delete-repository --repository-name microservices-app-user-service --force --region ca-central-1
aws ecr delete-repository --repository-name microservices-app-product-service --force --region ca-central-1
aws ecr delete-repository --repository-name microservices-app-frontend --force --region ca-central-1

# Delete load balancers created by Kubernetes
aws elbv2 describe-load-balancers --region ca-central-1 --query "LoadBalancers[*].LoadBalancerArn" --output text

# Then destroy
terraform destroy -var="db_username=postgres" -var="db_password=<password>"
```

## CI/CD Pipeline

The GitHub Actions pipeline runs automatically on every push to `main`:

```
Push to main
    ↓
Job 1: Run Tests
    → npm test on user-service and product-service
    ↓
Job 2: Build and Push Images
    → Authenticate to AWS via OIDC (no stored credentials)
    → Build Docker images tagged with git commit SHA
    → Scan images with Trivy for vulnerabilities
    → Push to AWS ECR
    ↓
Job 3: Deploy to EKS
    → Configure kubectl
    → Update image tags in deployment manifests
    → Apply Kubernetes manifests
    → Verify rollout completes successfully
```

### OIDC Authentication
No AWS credentials are stored in GitHub. GitHub Actions authenticates to AWS using OpenID Connect (OIDC) — GitHub proves its identity to AWS and receives temporary credentials that expire after each job.

## Kubernetes Resources

| Resource | Description |
|----------|-------------|
| Namespace | `production` — isolates all app resources |
| ConfigMap | Non-sensitive config (DB host, ports, service URLs) |
| Secret | Sensitive config (DB password) — never committed to git |
| Deployment | 2 replicas per service with rolling update strategy |
| Service | ClusterIP for backends, LoadBalancer for frontend |
| HPA | Auto-scales pods based on CPU utilization (70% threshold) |
| ServiceMonitor | Prometheus scrapes /metrics endpoint every 15s |
| PrometheusRule | Alerts for high error rate, pod crashes, high memory |

## Observability

### Metrics
Services expose Prometheus metrics at `/metrics`:
- `http_requests_total` — total requests by method, route, status code
- `http_request_duration_seconds` — request latency histogram
- Default Node.js and process metrics

### Accessing Grafana
```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3001:80
```
Open `http://localhost:3001` (admin/admin123)

### Alerts
- **ServiceHighErrorRate** — fires when 5xx error rate exceeds 10%
- **PodCrashLooping** — fires when pods restart unexpectedly
- **HighMemoryUsage** — fires when memory exceeds 80% of limit

## Security

- **No hardcoded secrets** — all sensitive values in environment variables
- **OIDC authentication** — no long-lived AWS credentials stored in GitHub
- **Non-root containers** — all services run as non-root user
- **Image scanning** — Trivy scans every image in the pipeline
- **Immutable ECR tags** — images cannot be overwritten once pushed
- **Helmet.js** — HTTP security headers on all API endpoints
- **Private subnets** — databases and worker nodes not publicly accessible
- **SSL/TLS** — all database connections use SSL encryption

## API Endpoints

### User Service (port 3001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Liveness probe |
| GET | /ready | Readiness probe |
| GET | /metrics | Prometheus metrics |
| GET | /api/users | List all users |
| POST | /api/users | Create user |
| GET | /api/users/:id | Get user by ID |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Product Service (port 3002)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Liveness probe |
| GET | /ready | Readiness probe |
| GET | /metrics | Prometheus metrics |
| GET | /api/products | List all products |
| POST | /api/products | Create product |
| GET | /api/products/:id | Get product by ID |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

## Author

Jean Amenyaglo  
Software Development Student — NAIT (graduating April 2027)  
Master's in Digital Transformation and Innovation — University of Ottawa

LinkedIn: [linkedin.com/in/jeanamenyaglo](https://linkedin.com/in/jeanamenyaglo)

Updating the readme