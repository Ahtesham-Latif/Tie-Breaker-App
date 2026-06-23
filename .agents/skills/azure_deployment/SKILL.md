---
name: azure-nodejs-deployment-via-github-actions
description: Best practices and exact steps for deploying a Node.js + Vite application to Azure App Service (Linux) using GitHub Actions and Azure AI Foundry.
---

# Azure App Service Deployment (Node.js)

This skill outlines the flawless, best-practice path to deploy a Node.js application to Azure App Service (Linux) while securely connecting to an Azure AI Foundry agent via Managed Identity.

## 1. Cloud Infrastructure Setup
* **App Service Plan:** Always choose a dedicated tier (e.g., **Basic B1**) for production. Free (F1) tiers have strict 60-minute daily CPU quotas that will forcefully shut down the application (Resulting in a `403 Stopped` error).

## 2. Authentication & Managed Identity (Passwordless)
1. **Code:** Use `DefaultAzureCredential` from `@azure/identity` in the Node.js backend.
2. **Enable Identity:** In the Azure App Service portal, go to **Settings > Identity** and enable **System assigned**.
3. **IAM Permissions:** In the target Azure AI Project, go to **Access control (IAM)** and assign the **Azure AI Developer** role to the App Service's Managed Identity. *(Note: `Cognitive Services OpenAI User` is not sufficient for Azure Foundry Orchestration Agents).*

## 3. Environment Variables & App Settings
* Configure variables directly in the Azure Portal under **Settings > Environment variables**.
* Ensure there are no leading/trailing spaces in values (e.g., URL endpoints), which will crash `fetch()` operations.
* **Crucial:** Variables are loaded into memory exactly once when the Node.js process starts. If a variable is added or changed, you **must** explicitly click **Restart** on the App Service Overview page.
* To trust the Azure Load Balancer (required for `express-rate-limit`), ensure the Express app has `app.set('trust proxy', 1);`.

## 4. GitHub Actions CI/CD Pipeline
The safest deployment strategy avoids conflicting build engines (GitHub vs. Azure Oryx). Let GitHub do 100% of the building and packaging.

### Workflow Best Practices:
1. GitHub runs `npm install` and the frontend build (`npm run build`).
2. GitHub uploads an artifact containing the compiled output (`dist`), backend files (`server.js`), and **crucially**, the `node_modules` folder.
   * *Why?* If `node_modules` is omitted, Azure's Oryx engine attempts to build the app itself by executing `npm run build`, which will crash because the raw source files (`index.html`) were not uploaded.
3. Use `azure/webapps-deploy@v3` with a Publish Profile stored as a GitHub Secret.
