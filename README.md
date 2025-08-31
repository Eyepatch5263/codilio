
# Codilio - Code As You Go

![codilio screenshot](https://res.cloudinary.com/dvnrlqqpq/image/upload/v1738501757/Screenshot_2025-02-02_183854_pebwwy.png)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)
- [Deployment & DevSecOps](#deployment--devsecops)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## Introduction

Codilio is a modern SaaS platform for code execution and sharing. Users can run code in JavaScript for free and unlock 9 more languages with a small fee. The platform provides a rich profile, snippet sharing, starring, and commenting system, all with a focus on security and scalability.

---

## Features

- **Free JavaScript code execution**
- **Premium access to 9 more languages** (Python, C++, Go, Java, etc.)
- **Profile dashboard**: Track code runs, favorite language, saved snippets, and stats
- **Snippet sharing**: Share code with others via unique links
- **Star & save**: Star snippets for quick access
- **Commenting**: Discuss and review code snippets
- **Pro subscription**: Unlocks premium features via LemonSqueezy integration
- **Secure authentication**: Clerk integration for user auth
- **Real-time database**: Convex for fast, reactive data
- **Responsive UI**: Built with Next.js, TailwindCSS, and Monaco Editor

---

## Architecture

**Frontend:**
- Next.js (React) with App Router
- TailwindCSS for styling
- Monaco Editor for code editing
- Clerk for authentication

**Backend/Serverless:**
- Convex for real-time database, queries, and mutations
- Convex functions for business logic (code execution, snippet management, comments, stars, etc.)
- LemonSqueezy for payment and subscription management

**DevSecOps & Deployment:**
- Docker for containerization
- Kubernetes manifests for scalable deployment
- Jenkins CI/CD pipelines for build, test, security, and deployment
- Trivy and OWASP Dependency Check for security scanning
- SonarQube for code quality analysis
- DigitalOcean for cloud infrastructure (via Terraform)

---

## Folder Structure

```
codilio/
├── src/                # Frontend (Next.js, components, pages, hooks, store, types)
├── convex/             # Convex functions, schema, and backend logic
├── public/             # Static assets (images, icons)
├── kubernetes/         # K8s manifests (deployment, service, secrets)
├── terraform/          # Infrastructure as Code (DigitalOcean, firewall, droplet)
├── gitops/             # GitOps Jenkinsfile for CD
├── Jenkinsfile         # Main CI/CD pipeline
├── Dockerfile          # Docker build instructions
├── docker-compose.yml  # Local Docker orchestration
└── ...
```

---

## Tech Stack

- **Frontend:** Next.js, React, TailwindCSS, Monaco Editor, Clerk
- **Backend:** Convex (serverless DB & functions), LemonSqueezy (payments)
- **DevSecOps:** Docker, Kubernetes, Jenkins, Trivy, OWASP, SonarQube
- **Cloud:** DigitalOcean (via Terraform)

---

## Local Setup

### Prerequisites
- Node.js 20+
- npm
- Docker (for containerized setup)

### Git Installation
```sh
git clone https://github.com/Eyepatch5263/codilio.git
cd codilio
npm install
npm run dev
# App runs at http://localhost:3000
```

### Docker Installation
```sh
git clone https://github.com/Eyepatch5263/codilio.git
cd codilio
docker compose up
# App runs at http://localhost:3000
```

---

## Deployment & DevSecOps

### CI/CD Pipeline (Jenkins)
- **Stages:**
   - Validate parameters
   - Workspace cleanup
   - Clone code
   - Trivy filesystem scan (container security)
   - OWASP Dependency Check (dependency vulnerabilities)
   - SonarQube code analysis & quality gate
   - Build Docker image
   - Push to Docker Hub
   - Deploy via Docker Compose (local) or Kubernetes (cloud)
   - Trigger GitOps pipeline for CD

### GitOps & Kubernetes
- `gitops/Jenkinsfile` updates K8s manifests with new image tags and pushes to repo
- `kubernetes/` contains:
   - `codilio-deployment.yml`: Deployment & Service for app
   - `secrets.yml`: K8s secrets for environment variables

### Infrastructure as Code (Terraform)
- `terraform/` provisions DigitalOcean droplets, firewall, and SSH keys
- Secure by default: only required ports open, SSH key-based access

### Security
- Trivy: Container vulnerability scanning
- OWASP: Dependency vulnerability scanning
- SonarQube: Code quality and security analysis
- Clerk: Secure authentication
- K8s secrets: All sensitive data via secrets, not in code

---

## Environment Variables

Set these in `.env.local` (for local) or in K8s secrets (for production):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `CLERK_WEBHOOK_SECRET`
- `LEMON_SQUEEZY_WEBHOOK_SECRET`

---

## Contributing

1. Fork the repo & create a feature branch
2. Make your changes (with tests if possible)
3. Open a PR with a clear description
4. Ensure all CI checks pass

---

## License

MIT
