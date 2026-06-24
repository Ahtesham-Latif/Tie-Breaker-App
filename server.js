import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';
// Import removed for AzureCliCredential as it's now dynamically imported using DefaultAzureCredential

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize a simple in-memory cache
const analysisCache = new Map();

// Ensure the endpoint is defined
const foundryEndpoint = process.env.FOUNDRY_ENDPOINT;
if (!foundryEndpoint) {
  console.error('⚠️  CRITICAL: FOUNDRY_ENDPOINT is not defined in the environment.');
}

app.use(express.json());

// Trust the Azure Load Balancer to provide correct IP addresses for the rate limiter
app.set('trust proxy', 1);

// Rate limiting configuration: 5 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
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
      return res.status(400).json({ error: 'Please provide both a decision and an analysis type so I can help you! (Error Code: ERR-01)' });
    }

    if (!foundryEndpoint) {
      return res.status(500).json({ error: 'My connection to the AI engine is temporarily unavailable. Please try again later. (Error Code: ERR-02)' });
    }

    // Cache key based on input
    const cacheKey = JSON.stringify({ decision, type, factors, useWebSearch, contextData, myCase });
    
    const cachedResponse = analysisCache.get(cacheKey);
    if (cachedResponse) {
      console.log('Serving from cache for:', decision);
      return res.json(cachedResponse);
    }

    // 1. Authenticate using Azure's Default Credentials (supports Managed Identity in App Service and Azure CLI locally)
    const { DefaultAzureCredential } = await import("@azure/identity");
    const credential = new DefaultAzureCredential();

    // 2. Request a scoped access token specifically for Azure AI services
    const tokenResponse = await credential.getToken("https://ai.azure.com");
    if (!tokenResponse) {
      throw new Error("Failed to authenticate with Azure AI services. (Error Code: ERR-03)");
    }
    const token = tokenResponse.token;

    // 3. Build the prompt input
    let messageContent = `Decision: ${decision}\nMode: ${type}`;
    
    // Explicitly command the agent on whether to use the web search tool
    if (useWebSearch) {
      messageContent += `\n[CRITICAL INSTRUCTION]: Deep Research is ON. You MUST use your Web Search tool to find the most accurate, real-time data and pricing before answering.`;
    } else {
      messageContent += `\n[CRITICAL INSTRUCTION]: Deep Research is OFF. Do NOT use your Web Search tool. Rely strictly on your internal knowledge base.`;
    }

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
      throw new Error(`The AI service is currently experiencing issues (${response.status}). Please try again shortly. (Error Code: ERR-04)`);
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
        error: 'I could not process that request. Please ensure your topic is clear and try again. (Error Code: ERR-05)'
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
      const responsePayload = { content: JSON.stringify(result) };
      
      // Save to cache
      analysisCache.set(cacheKey, responsePayload);
      if (analysisCache.size > 100) {
        const firstKey = analysisCache.keys().next().value;
        analysisCache.delete(firstKey);
      }

      return res.json(responsePayload);
    } catch (parseError) {
      console.error("Failed to parse agent JSON:", sanitized);
      throw new Error("I had trouble formatting the AI's response. Please try clicking Analyze again! (Error Code: ERR-06)");
    }

  } catch (error) {
    console.error('❌ Analysis error details:', error);
    // If the error already has an ERR- code, pass it through, otherwise wrap it in ERR-07
    const errorMsg = error.message?.includes('ERR-') 
      ? error.message 
      : 'An unexpected internal error occurred. Please try again in a moment! (Error Code: ERR-07)';
    res.status(500).json({ error: errorMsg });
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