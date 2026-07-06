# Microservices App — DevOps Practice Project

React frontend + two Node.js/Express microservices for practising the full DevOps stack.

## Stack

| Service | Tech | Port |
|---|---|---|
| Frontend | React + Vite + Nginx | 3000 |
| User Service | Node.js + Express + PostgreSQL | 3001 |
| Product Service | Node.js + Express + PostgreSQL | 3002 |

## Run Locally

```bash
docker compose up -d
```

Open http://localhost:3000

## Services

- **Users** — create and view users
- **Products** — create and view products (validates user via REST call to user-service)
- **Health** — live status of both services

## API Endpoints

### User Service (http://localhost:3001)
| Method | Path | Action |
|---|---|---|
| GET | /health | Health check |
| GET | /ready | Readiness check |
| GET | /api/users | List users |
| GET | /api/users/:id | Get user |
| POST | /api/users | Create user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Product Service (http://localhost:3002)
| Method | Path | Action |
|---|---|---|
| GET | /health | Health check |
| GET | /ready | Readiness check |
| GET | /api/products | List products |
| POST | /api/products | Create product (validates owner via user-service) |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

## Run Tests

```bash
cd user-service && npm install && npm test
cd product-service && npm install && npm test
```

## DevOps Practice Checklist

- [ ] Run locally with Docker Compose ← start here
- [ ] Write Kubernetes manifests for all services
- [ ] Set up GitHub Actions CI/CD pipeline
- [ ] Provision AWS infrastructure with Terraform (EKS, ECR, RDS)
- [ ] Configure servers with Ansible
- [ ] Add monitoring with Prometheus + Grafana
