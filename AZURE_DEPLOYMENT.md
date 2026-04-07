# Azure Deployment Guide

This project is ready to deploy to Azure with containers. The recommended production setup is:

- Azure Container Registry for images
- Azure Container Apps for the frontend and backend containers
- Azure Database for PostgreSQL Flexible Server for the database
- Azure Storage Account if you want complaint image uploads to persist outside the container filesystem

## Concrete values used in this guide

These are the exact resource names used by the deployment script in [azure_deploy.ps1](azure_deploy.ps1):

- Resource group: `complaint-cms-rg`
- Location: `centralindia`
- Container registry: `complaintcmsacr01`
- PostgreSQL server: `complaintcmspostgres01`
- Container Apps environment: `complaintcms-env`
- Backend app: `complaintcms-backend`
- Frontend app: `complaintcms-frontend`
- Storage account: `complaintcmsstore01`

Azure assigns the final app hostnames after creation. Get them with:

```bash
az containerapp show --resource-group complaint-cms-rg --name complaintcms-backend --query properties.configuration.ingress.fqdn -o tsv
az containerapp show --resource-group complaint-cms-rg --name complaintcms-frontend --query properties.configuration.ingress.fqdn -o tsv
```

## 1. Prepare Azure resources

Create a resource group, registry, database, and container app environment:

```bash
az group create --name complaint-cms-rg --location centralindia
az acr create --resource-group complaint-cms-rg --name complaintcmsacr01 --sku Basic
az postgres flexible-server create --resource-group complaint-cms-rg --name complaintcmspostgres01 --location centralindia --admin-user complaintadmin --admin-password "<strong-password>" --sku-name Standard_B1ms --tier Burstable --yes
az storage account create --resource-group complaint-cms-rg --name complaintcmsstore01 --location centralindia --sku Standard_LRS
az containerapp env create --resource-group complaint-cms-rg --name complaintcms-env --location centralindia
```

## 2. Build the backend image

Set the backend environment variables in Azure Container Apps:

- `DEBUG=False`
- `SECRET_KEY=<long-random-secret>`
- `ALLOWED_HOSTS=<backend-app-domain>`
- `CORS_ALLOW_ALL_ORIGINS=False`
- `CORS_ALLOWED_ORIGINS=https://<frontend-app-domain>`
- `CSRF_TRUSTED_ORIGINS=https://<backend-app-domain>,https://<frontend-app-domain>`
- `DB_ENGINE=postgresql`
- `DB_NAME=complaint_db`
- `DB_USER=complaintadmin`
- `DB_PASSWORD=<postgres-password>`
- `DB_HOST=complaintcmspostgres01.postgres.database.azure.com`
- `DB_PORT=5432`

Build and push the backend image:

```bash
az acr login --name complaintcmsacr01
docker build -t complaintcmsacr01.azurecr.io/complaint-backend:latest ./backend
docker push complaintcmsacr01.azurecr.io/complaint-backend:latest
```

Run the backend container app:

```bash
az containerapp create \
  --resource-group complaint-cms-rg \
  --name complaintcms-backend \
  --environment complaintcms-env \
  --image complaintcmsacr01.azurecr.io/complaint-backend:latest \
  --target-port 8000 \
  --ingress external \
  --registry-server complaintcmsacr01.azurecr.io
```

After the app is up, run migrations once:

```bash
az containerapp exec --resource-group complaint-cms-rg --name complaintcms-backend --command "python manage.py migrate"
```

## 3. Build the frontend image

The frontend image is built with Nginx and serves the React production bundle.

Build it with the deployed backend URL:

```bash
docker build \
  --build-arg REACT_APP_API_BASE_URL=https://<backend-app-domain>/api \
  -t complaintcmsacr01.azurecr.io/complaint-frontend:latest \
  ./frontend
docker push complaintcmsacr01.azurecr.io/complaint-frontend:latest
```

Deploy it as a second container app:

```bash
az containerapp create \
  --resource-group complaint-cms-rg \
  --name complaintcms-frontend \
  --environment complaintcms-env \
  --image complaintcmsacr01.azurecr.io/complaint-frontend:latest \
  --target-port 80 \
  --ingress external \
  --registry-server complaintcmsacr01.azurecr.io
```

## 4. Important production note

Complaint image uploads currently use the container filesystem. That works for local Docker, but it is not durable in Azure Container Apps. For production, connect `MEDIA_ROOT` to Azure Blob Storage or an Azure Files mount before relying on uploaded images.

## 5. Local validation before Azure

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
docker compose up --build
```

If you want, I can also add Azure Blob Storage support for complaint images so uploads persist correctly in production.