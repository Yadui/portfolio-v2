## The Deployment Pipeline That Pays for Itself

Manual deployments are a tax. Every manual step is a potential error, a context switch, and a reason deployments slow down as the team grows. CI/CD pipelines convert that tax into a fixed one-time investment.

This is the GitHub Actions pipeline we use for deploying Next.js + FastAPI applications to Azure App Service — with secrets managed via Azure Key Vault, environment configuration via GitHub Environments, and zero-downtime slot swaps.

## The Overall Pipeline Structure

```yaml
# .github/workflows/deploy.yml

name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

  build-and-push:
    needs: test
    runs-on: ubuntu-latest

  deploy-staging:
    needs: build-and-push
    environment: staging
    runs-on: ubuntu-latest

  deploy-production:
    needs: deploy-staging
    environment: production
    runs-on: ubuntu-latest
```

The key design decision: separate jobs for test, build, staging deploy, and production deploy — each requiring the previous to succeed, with manual approval gates on production.

## Authentication: OIDC Instead of Service Principal Secrets

[!INFO] The old pattern — create a service principal, store the JSON credentials as a GitHub secret — works but requires rotating secrets and gives broad access. The modern pattern uses **OpenID Connect (OIDC)** to mint short-lived tokens on demand with no stored secrets.

```yaml
permissions:
  id-token: write   # Required for OIDC
  contents: read

jobs:
  deploy:
    steps:
      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

Azure configuration (one-time setup):
```bash
az ad app federated-credential create \
  --id $APP_OBJECT_ID \
  --parameters '{
    "name": "github-actions-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:yourorg/yourrepo:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

## Building and Pushing to Azure Container Registry

```yaml
  build-and-push:
    runs-on: ubuntu-latest
    needs: test
    outputs:
      image-tag: ${{ steps.meta.outputs.version }}

    steps:
      - uses: actions/checkout@v4

      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: ACR Login
        run: az acr login --name ${{ secrets.ACR_NAME }}

      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.ACR_NAME }}.azurecr.io/myapp
          tags: type=sha,prefix=,format=short

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

The `cache-from: type=gha` lines enable GitHub Actions layer caching — Docker build times drop from 3–4 minutes to 30–45 seconds on warm cache.

## Zero-Downtime Deployment with Slot Swaps

Azure App Service deployment slots let you deploy to a staging slot, warm it up, then swap it into production atomically:

```yaml
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    needs: build-and-push

    steps:
      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to staging slot
        uses: azure/webapps-deploy@v3
        with:
          app-name: myapp-prod
          slot-name: staging
          images: ${{ secrets.ACR_NAME }}.azurecr.io/myapp:${{ needs.build-and-push.outputs.image-tag }}

      - name: Smoke test staging
        run: |
          sleep 30
          curl --fail https://myapp-prod-staging.azurewebsites.net/health \
            || (echo "Smoke test failed" && exit 1)

  deploy-production:
    runs-on: ubuntu-latest
    environment: production   # Requires manual approval in GitHub
    needs: deploy-staging

    steps:
      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Swap staging to production
        run: |
          az webapp deployment slot swap \
            --resource-group rg-prod \
            --name myapp-prod \
            --slot staging \
            --target-slot production
```

## Environment Variables and Secrets Strategy

Never put secrets in YAML files. The hierarchy:

**Non-sensitive configuration** → App Service Application Settings:
```bash
az webapp config appsettings set \
  --resource-group rg-prod \
  --name myapp-prod \
  --slot staging \
  --settings \
    NODE_ENV=production \
    NEXT_PUBLIC_API_URL=https://api.myapp.com \
    LOG_LEVEL=info
```

**Secrets** → Azure Key Vault references:
```bash
az webapp config appsettings set \
  --name myapp-prod \
  --resource-group rg-prod \
  --settings DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://myvault.vault.azure.net/secrets/database-url)"
```

[!TIP] Key Vault references auto-rotate: when the secret value changes in Key Vault, App Service picks up the new value on the next restart without any pipeline changes.

## The Complete Picture

```
git push main
  │
  ├─▶ test job (unit + integration tests)
  │
  ├─▶ build-and-push (Docker build → ACR, with layer caching)
  │
  ├─▶ deploy-staging (staging slot, smoke test)
  │
  └─▶ deploy-production (manual approval → slot swap, zero downtime)
```

From `git push` to production-ready container: 4–6 minutes. From manual approval to live traffic: 2 minutes. Rollback (swap back): 90 seconds.
