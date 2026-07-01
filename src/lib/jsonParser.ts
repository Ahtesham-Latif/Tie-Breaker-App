export function parsePartialJson(jsonString: string): any {
  if (!jsonString) return {};
  
  let cleanStr = jsonString.replace(/```json|```/g, '').trim();
  const firstBrace = cleanStr.search(/[\{\[]/);
  if (firstBrace !== -1) {
    cleanStr = cleanStr.substring(firstBrace);
  }
  
  try { return JSON.parse(cleanStr); } catch (e) { /* Expected */ }

  let inString = false;
  let escapeNext = false;
  let stack: string[] = [];
  
  // State Machine to track open brackets/braces using a stack
  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\') { escapeNext = true; } 
    else if (char === '"') { inString = !inString; } 
    else if (!inString) {
      if (char === '[') stack.push('[');
      else if (char === '{') stack.push('{');
      else if (char === ']') stack.pop();
      else if (char === '}') stack.pop();
    }
  }

  let fixedStr = cleanStr;
  if (inString) fixedStr += '"'; // Close string
  fixedStr = fixedStr.replace(/,\s*$/, ''); // Remove trailing comma
  
  // Close unclosed structures in reverse order
  while (stack.length > 0) {
    const open = stack.pop();
    if (open === '[') fixedStr += ']';
    else if (open === '{') fixedStr += '}';
  }

  try {
    return JSON.parse(fixedStr);
  } catch {
    return {}; // Ultimate fallback
  }
}
