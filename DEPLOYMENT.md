# Deployment Guide - Reminder-Card 🚀

This project is fully Dockerized, allowing for various deployment methods. Choose the one that best fits your needs.

## Option 1: Self-Hosted VPS (Docker Compose)
*Recommended for: Low cost, full control, and learning DevOps.*

1.  **Get a VPS**: (e.g., DigitalOcean Droplet, AWS EC2, Hetzner)
2.  **Install Docker & Docker Compose** on the server.
3.  **Clone this repository** to the server.
4.  **Configure Environment Variables**:
    Create `.env` (backend) and `.env.local` (frontend) files as per the README.
5.  **Launch**:
    ```bash
    docker compose up -d --build
    ```
6.  **Reverse Proxy**: Use Nginx or Caddy to handle SSL (HTTPS) and route traffic to ports 3000 and 8080.

---

## Option 2: Managed Platforms (Render / Railway)
*Recommended for: Speed and simplicity. Best for portfolio showcase.*

### For the Backend (Go + Postgres)
1.  Connect your GitHub repo to **Render** or **Railway**.
2.  Create a **PostgreSQL Database** service.
3.  Create a **Web Service** from the `backend/` directory.
    - Set the Build Command/Environment to Docker.
    - Configure the necessary environment variables (`DB_HOST`, `DB_USER`, etc.).

### For the Frontend (Next.js)
1.  Create a **Web Service** from the `frontend/` directory.
2.  Set Build Argument: `NEXT_PUBLIC_API_URL` (pointing to your live backend).

---

## Option 3: Automated CD (GitHub Actions)
The project already includes GitHub Actions to build and push Docker images to the **GitHub Container Registry (GHCR)**.

To automate deployment:
1.  Add a `deploy` job to your GitHub Actions.
2.  Use SSH to trigger a pull and restart on your server:
    ```bash
    docker compose pull
    docker compose up -d
    ```

> [!IMPORTANT]
> Always use GitHub Secrets for sensitive information like passwords and JWT secrets.
