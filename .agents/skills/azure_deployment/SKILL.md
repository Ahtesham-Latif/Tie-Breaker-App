---
name: Azure Node.js Deployment via GitHub Actions
description: Best practices and exact steps for deploying a Node.js + Vite application to Azure App Service (Linux) using GitHub Actions and Azure AI Foundry.
---

# Azure App Service Deployment (Node.js)

This skill outlines the flawless, best-practice path to deploy a Node.js application to Azure App Service (Linux) while securely connecting to an Azure AI Foundry agent via Managed Identity.

## 1. Cloud Infrastructure Setup
* **App Service Plan:** Always choose a dedicated tier (e.g., **Basic B1**) for production workloads. Free (F1) and Shared (D1) tiers have strict 60-minute daily CPU quotas that will forcefully shut down the application (Resulting in a `403 Stopped` error).
* **Region:** Ensure the selected region has available capacity for the B1 tier.

## 2. Authentication & Managed Identity (Passwordless)
Never use hardcoded API keys for Azure services in production.
1. **Code:** Use `DefaultAzureCredential` from `@azure/identity` in the Node.js backend. This seamlessly uses the Azure CLI locally and switches to Managed Identity in the cloud.
2. **Enable Identity:** In the Azure App Service portal, go to **Settings > Identity** and enable **System assigned**.
3. **IAM Permissions:** In the target Azure AI Project/Foundry resource, go to **Access control (IAM)** and assign the **Cognitive Services OpenAI User** (or Azure AI Developer) role to the App Service's Managed Identity.

## 3. Environment Variables
* Configure environment variables (like `FOUNDRY_ENDPOINT`) directly in the Azure Portal under **Settings > Environment variables**.
* **Crucial:** Variables are loaded into memory exactly once when the Node.js process starts. If a variable is added or changed, you **must** explicitly click **Restart** on the App Service Overview page to force Node.js to read the new value.

## 4. GitHub Actions CI/CD Pipeline
The safest deployment strategy avoids conflicting build engines (GitHub vs. Azure Oryx). Let GitHub do 100% of the building and packaging.

### Workflow Best Practices:
1. GitHub runs `npm install`.
2. GitHub runs the frontend build (e.g., `npm run build`).
3. GitHub uploads an artifact containing the compiled output (`dist`), backend files (`server.js`), and **crucially**, the `node_modules` folder.
   * *Why?* If `node_modules` is omitted, Azure will attempt to build the app itself. Azure's Oryx engine automatically executes `npm run build`, which will crash if the raw source files (`index.html`, etc.) were not uploaded.
4. Use `azure/webapps-deploy@v3` with a Publish Profile stored as a GitHub Repository Secret.

### Example Workflow Artifact Configuration:
```yaml
      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: |
            dist
            server.js
            package.json
            package-lock.json
            node_modules
```

## 5. Summary Checklist for a Fresh Deployment
- [ ] Create Azure App Service (Basic B1, Linux, Node LTS).
- [ ] Enable System Assigned Managed Identity.
- [ ] Grant IAM Roles on connected Azure resources.
- [ ] Add App Settings/Environment Variables in Azure (and ensure no trailing spaces).
- [ ] Download Publish Profile from Azure.
- [ ] Save Publish Profile text as a GitHub Secret.
- [ ] Push code to trigger GitHub Actions deployment.
