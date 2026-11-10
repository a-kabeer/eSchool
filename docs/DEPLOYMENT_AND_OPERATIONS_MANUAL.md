# eSchool Production Deployment & Operations Manual

**System**: eSchool Enterprise Modernization Architecture  
**Target Environment**: Production Linux (Ubuntu 22.04 / 24.04 LTS / Debian 12)  
**Architecture Pattern**: Modular Monolith (ASP.NET Core .NET 10 LTS + PostgreSQL 16 + React 19 / Vite + Redis 7.2)  
**Security & Compliance**: Multi-Tenant Isolation, Double-Entry GL Invariants, Pakistani Statutory Compliance (FBR u/s 149 & EOBI)

---

## 1. System Architecture & Topology

The modernized eSchool architecture follows a high-performance **Modular Monolith** pattern containerized with multi-stage Docker builds.

```
                           +---------------------------+
                           |  Internet / Cloudflare    |
                           +-------------+-------------+
                                         |
                                         v (HTTPS / 443)
                           +---------------------------+
                           |  Nginx Reverse Proxy &    |
                           |  SSL Termination Engine   |
                           +-------------+-------------+
                                         |
            +----------------------------+----------------------------+
            |                                                         |
            v (/api/*, /hubs/*)                                       v (/* static)
+-------------------------------+                         +-------------------------------+
|     eschool-api (.NET 10)     |                         |     eschool-web (React/Vite)  |
| - Identity Module             |                         | - MaterialM Theme Tokens      |
| - Academics & SIS Module      |                         | - Multi-Campus Switcher       |
| - Fee Billing & POS Counter   |                         | - Double-Entry Ledger UI      |
| - Double-Entry GL Engine      |                         | - Laser Scanner Counter       |
| - Attendance Hub & Workers    |                         | - A4 3-Part Bank Challan      |
| - HR & FBR/EOBI Payroll       |                         | - SignalR Live Client         |
+---------------+---------------+                         +-------------------------------+
                |
    +-----------+-----------+
    |                       |
    v                       v
+------------------+    +------------------+
| eschool-postgres |    |  eschool-redis   |
| (PostgreSQL 16)  |    | (Redis 7.2)      |
| - Multi-Tenant   |    | - SignalR Scale  |
|   Query Filters  |    |   Out Backplane  |
| - Row Level Sec  |    | - Distributed    |
| - WAL Archiving  |    |   Cache & Locks  |
+------------------+    +------------------+
```

---

## 2. Infrastructure & Hardware Prerequisites

### 2.1 Recommended Server Sizing

| Sizing Tier | Active Students | Concurrent Users | CPU Cores | RAM | Storage (NVMe SSD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Small (1-2 Campuses)** | Up to 1,500 | 50 - 100 | 4 vCPU | 8 GB | 80 GB |
| **Medium (3-6 Campuses)** | 1,500 - 8,000 | 100 - 500 | 8 vCPU | 16 GB | 200 GB |
| **Enterprise (> 6 Campuses)** | 8,000 - 30,000 | 500 - 2,500 | 16 vCPU | 32 GB | 500 GB (RAID 10) |

### 2.2 Host OS Prerequisites

```bash
# Update OS packages
sudo apt update && sudo apt upgrade -y

# Install Docker CE and Docker Compose plugin
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install operational utilities
sudo apt install -y htop iotop ufw jq git postgresql-client
```

---

## 3. Production Multi-Stage Container Setup

The deployment is managed through `docker-compose.yml` orchestrating four unified containers:

### 3.1 Docker Compose Configuration (`docker-compose.yml`)

```yaml
services:
  eschool-postgres:
    image: postgres:16-alpine
    container_name: eschool-postgres
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-eschool_db}
      POSTGRES_USER: ${POSTGRES_USER:-eschool_admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups/db:/backups
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-eschool_admin} -d ${POSTGRES_DB:-eschool_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  eschool-redis:
    image: redis:7.2-alpine
    container_name: eschool-redis
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"

  eschool-api:
    build:
      context: .
      dockerfile: src/eSchool.WebAPI/Dockerfile
    container_name: eschool-api
    restart: always
    environment:
      ConnectionStrings__DefaultConnection: "Host=eschool-postgres;Database=${POSTGRES_DB:-eschool_db};Username=${POSTGRES_USER:-eschool_admin};Password=${POSTGRES_PASSWORD}"
      ConnectionStrings__Redis: "eschool-redis:6379,password=${REDIS_PASSWORD}"
      ASPNETCORE_ENVIRONMENT: "Production"
      ASPNETCORE_URLS: "http://+:5000"
    depends_on:
      eschool-postgres:
        condition: service_healthy
      eschool-redis:
        condition: service_started
    ports:
      - "127.0.0.1:5000:5000"

  eschool-web:
    build:
      context: ./src/eSchool.Client
      dockerfile: Dockerfile
    container_name: eschool-web
    restart: always
    ports:
      - "127.0.0.1:3000:80"
    depends_on:
      - eschool-api

volumes:
  postgres_data:
  redis_data:
```

### 3.2 Environment Secrets File (`.env.production`)

```bash
# PostgreSQL Credentials
POSTGRES_DB=eschool_production
POSTGRES_USER=eschool_master
POSTGRES_PASSWORD=A_Very_Strong_Postgres_Password_2026!

# Redis Cache Credentials
REDIS_PASSWORD=A_Very_Strong_Redis_Password_2026!

# JWT Secret (Min 256 bits)
JWT_SECRET=eschool_super_secret_signing_key_for_production_jwt_tokens_2026!
JWT_ISSUER=https://api.eschool.com.pk
JWT_AUDIENCE=https://eschool.com.pk

# SMS Gateway Configuration (Telenor / Jazz / Zong Bulk SMS)
SMS_API_GATEWAY_URL=https://bulksms.pakistan.com/api/v3/send
SMS_API_KEY=YOUR_PROD_SMS_KEY
SMS_SENDER_ID=eSchool
```

---

## 4. Database Provisioning & Migration Pipeline

### 4.1 Running EF Core Database Migrations

Apply the latest database migrations automatically via EF Core CLI:

```bash
# Set connection string to production database
export ConnectionStrings__DefaultConnection="Host=127.0.0.1;Database=eschool_production;Username=eschool_master;Password=A_Very_Strong_Postgres_Password_2026!"

# Apply migrations
dotnet ef database update --project src/Shared/eSchool.Infrastructure --startup-project src/eSchool.WebAPI
```

### 4.2 Legacy MySQL ETL Migration

When transitioning an existing school from legacy PHP/MySQL `demo.eschool.com.pk`:

```bash
# 1. Run the audited migration tool
python scripts/migrate-legacy-eschool.py --output-sql scripts/migrated-data.sql

# 2. Execute transactional migration into PostgreSQL 16
psql -h 127.0.0.1 -U eschool_master -d eschool_production -f scripts/migrated-data.sql
```

The script guarantees:
- All student B-Forms and CNICs match regex `\d{5}-\d{7}-\d`.
- All legacy integer campus IDs map to verified UUID multi-tenant keys.
- Double-entry invariants are enforced: $\sum \text{Debit} = \sum \text{Credit}$.

---

## 5. Nginx Reverse Proxy & SSL Hardening

Deploy the following configuration in `/etc/nginx/sites-available/eschool.conf`:

```nginx
# Rate Limiting Zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

server {
    listen 80;
    server_name eschool.com.pk demo.eschool.com.pk;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name eschool.com.pk demo.eschool.com.pk;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/eschool.com.pk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eschool.com.pk/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend Single Page Application (React / Vite)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend REST API
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Authentication Endpoint Strict Rate Limit
    location /api/v1/auth/login {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SignalR Real-Time WebSockets
    location /hubs/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

---

## 6. Real-Time SignalR & Background Services Monitoring

The application includes two background workers operating via `System.Threading.Channels`:

1. **`InvoiceBatchBackgroundService`**:
   - Handles automated mass fee challan generation on the 1st of every calendar month.
   - Computes tuition, lab dues, sibling concessions, prior arrears, and late surcharges.
2. **`NotificationDispatchWorker`**:
   - Dispatches real-time SMS alerts to parents when students are marked Absent / Late.
   - Emits live updates across SignalR (`/hubs/attendance`, `/hubs/counter`, `/hubs/notifications`).

### Checking Worker Logs in Production

```bash
# View live API logs filtered by background services
docker logs -f eschool-api | grep -E "InvoiceBatch|NotificationDispatch|SignalR"
```

---

## 7. Disaster Recovery & Automated Backups

### 7.1 Automated Daily PostgreSQL Dump Script (`scripts/backup-db.sh`)

```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups/postgresql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="eschool_backup_${TIMESTAMP}.sql.gz"

mkdir -p ${BACKUP_DIR}

# Execute compressed pg_dump
docker exec eschool-postgres pg_dump -U eschool_master eschool_production | gzip > "${BACKUP_DIR}/${FILENAME}"

# Retain last 30 daily backups locally
find ${BACKUP_DIR} -type f -name "eschool_backup_*.sql.gz" -mtime +30 -exec rm -f {} \;

echo "[$(date)] Successfully generated: ${FILENAME}"
```

### 7.2 Restoration Runbook

```bash
# 1. Uncompress and restore database
gunzip -c /backups/postgresql/eschool_backup_20261110_000000.sql.gz | docker exec -i eschool-postgres psql -U eschool_master -d eschool_production

# 2. Verify table records and multi-tenancy
docker exec -i eschool-postgres psql -U eschool_master -d eschool_production -c 'SELECT "SchoolId", count(*) FROM "Students" GROUP BY "SchoolId";'
```

---

## 8. Operational Runbooks & Common Tasks

### 8.1 Adding a New Campus / Branch
1. Insert new record in `Schools` table with unique code (e.g. `PES-01` for Peshawar).
2. Assign GL Chart of Accounts branch prefix (e.g. `10-04-XXXX`).
3. Add campus entry to `src/eSchool.Client/src/context/CampusContext.tsx` or fetch dynamically via `/api/v1/campuses`.

### 8.2 Monthly Fee Challan Generation Runbook
1. Admin opens `/apps/invoices` or triggers batch via `POST /api/v1/billing/invoices/generate-batch`.
2. System enqueues student list into `InvoiceBatchBackgroundService`.
3. Printable A4 3-part bank challans are generated with 1D Code128 barcodes.
4. Challans can be bulk-printed via the frontend Print Challan modal.

### 8.3 Monthly Payroll & FBR Section 149 Withholding Tax
1. On the 28th of each month, the Accountant opens `/hr/payroll`.
2. Inspects gross allowances (Basic, House Rent, Medical, Conveyance).
3. The system automatically computes statutory deductions:
   - FBR Section 149 Salary Tax Slab.
   - EOBI Employee Contribution (PKR 1,300).
4. Accountant clicks **"Disburse & Post BPV"**:
   - Posts a balanced Bank Payment Voucher (`BPV`) to the General Ledger.
   - Debits `500101` (Salaries Expense).
   - Credits `200301` (FBR Tax Payable), `200302` (EOBI Payable), and `100102` (Bank Account).
5. Generates formal salary slips with digital signature stamps.

---

## 9. Verification & Healthcheck Matrix

| Service | Check URL / Command | Expected Output | Status |
| :--- | :--- | :--- | :--- |
| **API Health** | `GET http://localhost:5000/api/v1/campuses` | HTTP 200 OK, JSON array of campuses | Active |
| **SignalR Counter** | `WSS /hubs/counter` | HTTP 101 Switching Protocols | Connected |
| **SignalR Attendance**| `WSS /hubs/attendance` | HTTP 101 Switching Protocols | Connected |
| **Web Frontend** | `GET http://localhost:3000` | HTTP 200 OK, HTML MaterialM SPA | Serving |
| **PostgreSQL 16** | `pg_isready -h localhost -p 5432` | `localhost:5432 - accepting connections` | Healthy |
| **Redis 7.2** | `redis-cli ping` | `PONG` | Healthy |
