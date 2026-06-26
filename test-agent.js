const tests = [
  {
    name: "Test 1 — Standard comparison, no search",
    payload: {
      decision: "Angular vs Svelte",
      type: "comparison",
      useWebSearch: false
    }
  },
  {
    name: "Test 2 — Pros-cons, no search",
    payload: {
      decision: "Remote Work vs Commuting to Office",
      type: "pros-cons",
      useWebSearch: false,
      myCase: "Mid-level engineer in Karachi, wants better work-life balance"
    }
  },
  {
    name: "Test 3 — SWOT, no search",
    payload: {
      decision: "Coding Bootcamp vs Self-Taught",
      type: "swot",
      useWebSearch: false,
      myCase: "25 year old transitioning from marketing, limited budget"
    }
  },
  {
    name: "Test 4 — Verdict with My Case, no search",
    payload: {
      decision: "PostgreSQL vs MongoDB",
      type: "verdict",
      useWebSearch: false,
      myCase: "Building a relational CRM system with lots of structured data"
    }
  },
  {
    name: "Test 5 — Deep search, comparison",
    payload: {
      decision: "Stripe vs PayPal",
      type: "comparison",
      factors: ["Setup burden", "Monthly cost", "Payment gateways"],
      useWebSearch: true,
      myCase: "E-commerce founder in Islamabad, need global payments"
    }
  }
];

async function runBattery() {
  console.log("🚀 Starting Test Battery with Rotated Scenarios (5 tests)\n");
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n===========================================`);
    console.log(`▶️  ${test.name}`);
    console.log(`===========================================`);
    
    const startTime = Date.now();
    let finalResult = null;
    
    try {
      const response = await fetch('http://localhost:8080/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.payload)
      });
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // It's a cached JSON response!
        const json = await response.json();
        if (json.error) throw new Error(json.error);
        finalResult = json.structuredData || JSON.parse(json.content);
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Completed (from cache) in ${totalTime}s`);
        console.log(`   Preview of result:`, Object.keys(finalResult));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      // Parse SSE
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamLeftover = "";
      let pingCount = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunkText = streamLeftover + decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');
        streamLeftover = lines.pop() || "";
        
        for (let line of lines) {
          line = line.trim();
          if (!line) continue;
          
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.status === 'thinking') {
              pingCount++;
            } else if (parsed.status === 'error') {
              throw new Error(parsed.error);
            } else if (parsed.status === 'complete') {
              finalResult = JSON.parse(parsed.content);
            }
          }
        }
      }
      
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (finalResult) {
        console.log(`✅ Completed in ${totalTime}s (received ${pingCount} thinking pings)`);
        if (finalResult.entities) {
          console.log(`   Preview of result entities: ${JSON.stringify(finalResult.entities)}`);
        } else {
          console.log(`   Preview of result:`, Object.keys(finalResult));
        }
      } else {
        console.log(`❌ Stream finished but no complete payload was found (Time: ${totalTime}s)`);
      }
      
    } catch (err) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`❌ Failed in ${totalTime}s: ${err.message}`);
    }
  }
  
  console.log(`\n\n🎉 Test Battery Finished!`);
}

runBattery();
