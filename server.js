import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';
// Import removed for AzureCliCredential as it's now dynamically imported using DefaultAzureCredential

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the endpoint is defined
const foundryEndpoint = process.env.FOUNDRY_ENDPOINT;
if (!foundryEndpoint) {
  console.error('⚠️  CRITICAL: FOUNDRY_ENDPOINT is not defined in the environment.');
}

app.use(express.json());

// Rate limiting configuration: 50 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiter to all API routes
app.use('/api/', limiter);

// 1. Serve the static files from the Vite build folder
app.use(express.static(path.join(__dirname, 'dist')));

// 2. API Endpoint for Analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { decision, type, factors, useWebSearch, contextData, myCase } = req.body;

    if (!decision || !type) {
      return res.status(400).json({ error: 'Missing decision or analysis type' });
    }

    if (!foundryEndpoint) {
      return res.status(500).json({ error: "Missing Foundry Agent configuration on server setup" });
    }

    // 1. Authenticate using Azure's Default Credentials (supports Managed Identity in App Service and Azure CLI locally)
    const { DefaultAzureCredential } = await import("@azure/identity");
    const credential = new DefaultAzureCredential();

    // 2. Request a scoped access token specifically for Azure AI services
    const tokenResponse = await credential.getToken("https://ai.azure.com");
    if (!tokenResponse) {
      throw new Error("Failed to get Azure CLI authentication token.");
    }
    const token = tokenResponse.token;

    // 3. Build the prompt input
    let messageContent = `Decision: ${decision}\nMode: ${type}`;
    
    if (factors && factors.length > 0) {
      messageContent += `\nFactors: ${factors.join(", ")}`;
    }

    if (myCase && myCase.trim().length > 0) {
      messageContent += `\nMy Case: ${myCase.trim()}`;
    }

    if (contextData && Object.keys(contextData).length > 0) {
      messageContent += `\n\n### Thread Memory / Context (Use this for the Verdict)\n`;
      if (contextData.comparison) messageContent += `Comparison Data: ${JSON.stringify(contextData.comparison)}\n`;
      if (contextData.prosCons) messageContent += `Pros & Cons Data: ${JSON.stringify(contextData.prosCons)}\n`;
      if (contextData.swot) messageContent += `SWOT Data: ${JSON.stringify(contextData.swot)}\n`;
    }

    // 4. Executing the Agent Call via raw fetch
    const response = await fetch(
      `${foundryEndpoint}?api-version=2025-05-15-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Injects the secure Azure token
        },
        body: JSON.stringify({
          input: messageContent
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Azure Agent responded with status ${response.status}: ${errText}`);
    }

    // 5. Parsing the Complex Azure Response
    const data = await response.json();

    // Find the specific object in the array that is the actual 'message'
    const messageOutput = data.output?.find((o) => o.type === 'message');

    // Extract the text (handling different object structures Azure might return)
    const raw = messageOutput?.content?.[0]?.text;
    const textContent = typeof raw === 'object' ? raw?.value : raw;

    // Safety Check: If there's no text, Azure's safety guardrails likely blocked the request
    if (!textContent) {
      return res.status(400).json({
        error: 'Request blocked by safety guardrails. Please enter a valid topic.'
      });
    }

    // 6. JSON Sanitization Pipeline
    // Strip out Markdown formatting (e.g., ```json ... ```)
    const cleanJson = textContent.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1").trim();

    // Aggressive sanitization using Regex
    let sanitized = cleanJson
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Removes hidden control characters that break JSON
      .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')        // Fixes invalid backslash escapes
      .replace(/([^\\])'|^'/g, '$1\\"')             // Fixes unescaped single quotes
      .trim();

    // Intercept comparison response to map the object back to an array for the frontend
    if (type === "comparison") {
      try {
        const parsed = JSON.parse(sanitized);
        if (parsed.factors && parsed.comparison) {
          parsed.comparison.forEach(opt => {
            const mappedValues = [];
            // Normalize the AI output keys for loose matching
            const normalizedValues = {};
            for (const key in opt.values) {
              const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              normalizedValues[cleanKey] = opt.values[key];
            }

            parsed.factors.forEach(f => {
              const cleanFactor = f.toLowerCase().replace(/[^a-z0-9]/g, '');
              const val = normalizedValues[cleanFactor] || opt.values[f];
              mappedValues.push(val || "Data missing");
            });
            opt.values = mappedValues;
          });
          sanitized = JSON.stringify(parsed);
        }
      } catch (e) {
        console.error("Failed to intercept and map comparison values:", e);
        // We will just let it pass through to the frontend to handle or throw json error
      }
    }

    // Make sure it's valid JSON before sending to UI
    try {
      const result = JSON.parse(sanitized);
      return res.json({ content: JSON.stringify(result) });
    } catch (parseError) {
      console.error("Failed to parse agent JSON:", sanitized);
      throw new Error("Agent returned invalid JSON.");
    }

  } catch (error) {
    console.error('❌ Analysis error details:', error);
    res.status(500).json({ error: error.message || 'The AI engine encountered an internal error.' });
  }
});

// 2. Handle React routing (send all requests to index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 3. Azure uses a dynamic PORT provided via environment variables
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`The TieBreaker is live on port ${PORT}`);
});