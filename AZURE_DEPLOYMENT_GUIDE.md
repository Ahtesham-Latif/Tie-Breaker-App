# Azure Deployment Guide for TieBreaker

This guide covers how to deploy the TieBreaker application to a new Azure App Service, properly connecting it to your Azure AI Foundry (Melinda Agent) using securely managed identities.

## 1. Update the GitHub Workflow
1. Open the file `.github/workflows/main_tie-breaker.yml` in your editor.
2. Scroll to the bottom to the `deploy` step.
3. Change the `app-name` property to the exact name of your new Azure App Service.
4. Note the name of the `publish-profile` secret (e.g., `AZUREAPPSERVICE_PUBLISHPROFILE_NEW`). You will need this name in the next step.

## 2. Configure GitHub Secrets
1. Go to your GitHub repository in the browser.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. **Add the Publish Profile:**
   - Create a new Repository Secret matching the name from your workflow file (e.g., `AZUREAPPSERVICE_PUBLISHPROFILE_NEW`).
   - Paste the contents of your publish profile (you can download this from your new Azure App Service overview page).
4. **Add the Foundry Endpoint:**
   - Create another new Repository Secret named `FOUNDRY_ENDPOINT`.
   - Paste your Azure Agent endpoint URL (the exact same URL found in your local `.env` file).
   - *(Note: You can safely delete the old `OPENROUTER_API_KEY` secret).*

## 3. Configure Azure App Service
1. Log into the Azure Portal and go to your new App Service.
2. **Set Environment Variables:**
   - Go to **Settings** > **Environment variables** (or **Configuration**).
   - Add a new Application Setting named `FOUNDRY_ENDPOINT`.
   - Paste your Azure Agent endpoint URL as the value. Save your changes.
3. **Enable Managed Identity:**
   - Go to **Settings** > **Identity**.
   - Under the **System assigned** tab, toggle the Status to **On**.
   - Save your changes. Azure will now create a unique identity for your App Service.

## 4. Grant Azure AI Access (IAM)
Your App Service now has an identity, but it needs permission to talk to the AI Foundry.
1. In the Azure Portal, navigate to your **Azure AI Project / Foundry Resource**.
2. Go to **Access control (IAM)** on the left sidebar.
3. Click **Add** > **Add role assignment**.
4. Search for and select the **Azure AI Developer** (or **Cognitive Services User**) role. Click Next.
5. Under "Assign access to", select **Managed identity**.
6. Click **+ Select members**, choose your subscription, and select the App Service you just created.
7. Review and assign the role.

## 5. Push and Deploy!
1. Commit your changes locally (including this guide and the modified `.github/workflows/main_tie-breaker.yml`).
2. Push your changes to the `main` branch: `git push origin main`.
3. Go to your GitHub repository's **Actions** tab to watch your application build and deploy to the new Azure endpoint!
