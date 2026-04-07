$ResourceGroup = "complaint-cms-rg"
$Location = "centralindia"
$AcrName = "complaintcmsacr01"
$PostgresName = "complaintcmspostgres01"
$ContainerAppsEnv = "complaintcms-env"
$BackendAppName = "complaintcms-backend"
$FrontendAppName = "complaintcms-frontend"
$StorageName = "complaintcmsstore01"
$PostgresAdminUser = "complaintadmin"

Write-Host "Creating resource group..."
az group create --name $ResourceGroup --location $Location

Write-Host "Creating container registry..."
az acr create --resource-group $ResourceGroup --name $AcrName --sku Basic

Write-Host "Creating PostgreSQL flexible server..."
az postgres flexible-server create `
  --resource-group $ResourceGroup `
  --name $PostgresName `
  --location $Location `
  --admin-user $PostgresAdminUser `
  --admin-password "<hari>" `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --yes

Write-Host "Creating storage account..."
az storage account create --resource-group $ResourceGroup --name $StorageName --location $Location --sku Standard_LRS

Write-Host "Creating container apps environment..."
az containerapp env create --resource-group $ResourceGroup --name $ContainerAppsEnv --location $Location

Write-Host "Logging in to ACR..."
az acr login --name $AcrName

Write-Host "Building backend image..."
docker build -t "$AcrName.azurecr.io/complaint-backend:latest" ./backend
docker push "$AcrName.azurecr.io/complaint-backend:latest"

Write-Host "Creating backend container app..."
az containerapp create `
  --resource-group $ResourceGroup `
  --name $BackendAppName `
  --environment $ContainerAppsEnv `
  --image "$AcrName.azurecr.io/complaint-backend:latest" `
  --target-port 8000 `
  --ingress external `
  --registry-server "$AcrName.azurecr.io"

Write-Host "Run migrations after the backend app is ready:"
Write-Host "az containerapp exec --resource-group $ResourceGroup --name $BackendAppName --command \"python manage.py migrate\""

Write-Host "Build the frontend image with the backend URL returned by Azure, then deploy it as $FrontendAppName."