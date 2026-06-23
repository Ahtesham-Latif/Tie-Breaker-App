# Azure Portal Action Plan

Follow this checklist exclusively within the **Azure Portal (portal.azure.com)** to prepare your environment before triggering the GitHub deployment.

## Step 1: Prepare Your App Service
If you haven't already created a new App Service (Web App), do that first (choose Node.js 22 LTS as the runtime, and Linux as the OS).

1. Navigate to your **App Service** in the Azure Portal.
2. In the top toolbar of your App Service Overview page, click **Get publish profile**. 
   *(Save this file; you will copy its contents into your GitHub Secrets later).*

## Step 2: Configure Environment Variables
Your App Service needs to know exactly where to send requests for the AI Agent.

1. On the left sidebar of your App Service, scroll down to **Settings** and click **Environment variables** (or **Configuration** depending on your portal view).
2. Under the **App settings** tab, click **+ Add**.
3. Set the **Name** to: `FOUNDRY_ENDPOINT`
4. Set the **Value** to your exact endpoint URL (e.g., `https://bladerunner...services.ai.azure.com/api/projects/...`).
5. Click **Apply**, and then click **Apply/Save** at the bottom of the page to confirm the changes.

## Step 3: Enable Managed Identity
This step gives your App Service a secure, invisible "user account" within Azure so it doesn't need passwords to talk to your AI Foundry.

1. On the left sidebar of your App Service, under **Settings**, click **Identity**.
2. Make sure you are on the **System assigned** tab.
3. Change the **Status** toggle to **On**.
4. Click **Save** and confirm the prompt. Azure will generate an Object ID for your app.

## Step 4: Grant Permissions to the AI Project
Now you must tell your AI Project that your App Service's new identity is allowed to access it.

1. Use the top search bar in the Azure Portal to search for your **Azure AI Project** (or Azure AI Foundry resource) and click on it.
2. On the left sidebar, click **Access control (IAM)**.
3. Click the **+ Add** button at the top, then select **Add role assignment**.
4. In the list of roles, search for and select **Azure AI Developer** (or **Cognitive Services User**). Click **Next**.
5. Under "Assign access to", select the **Managed identity** radio button.
6. Click the **+ Select members** link. 
7. In the flyout panel, select your subscription, choose **App Service** from the Managed identity dropdown, and click on the name of your specific App Service. Click **Select**.
8. Click **Review + assign** at the bottom of the page.

---
**Status Check:** Once you have completed these 4 steps in the Azure Portal, your cloud environment is 100% ready. You can now configure your GitHub Secrets and push your code!
