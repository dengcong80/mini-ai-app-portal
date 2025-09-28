const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Add delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const cache = new Map();
const callOpenRouter = async (messages, max_tokens = 1000, retries = 3) => {
    //console.log("🎯 Calling OpenRouter URL:", API_URL); 
  
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          API_URL,
          {
            model: "x-ai/grok-4-fast:free",
            messages,
            temperature: 0.3,
            max_tokens
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'Mini AI App Portal'
            },
            timeout: 60000 // Increase timeout to 60 seconds
          }
        );
        return response.data.choices[0].message.content.trim();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (error.response?.status === 429) {
          // 429 error: Too many requests
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
         // console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`);
          
          if (attempt < retries) {
            await delay(waitTime);
            continue;
          }
        }
        
        if (attempt === retries) {
          throw new Error(`OpenRouter API failed after ${retries} attempts: ${error.message}`);
        }
      }
    }
};

exports.extractRAOS = async (description) => {
   // add cache check
   const cacheKey = description.toLowerCase().trim();
   if (cache.has(cacheKey)) {
    // console.log('Using cached result');
     return cache.get(cacheKey);
   }


  const prompt = `
You are a JSON-only API. Do not explain. Do not apologize. Only output valid JSON.
You are a requirements analyst. Extract structured app behaviors in RAOS format from the user's description.

User description: "${description}"

Respond ONLY in valid JSON format with this structure:
{
  "appName": "string",
  "entities": ["string"],
  "roles": ["string"],
  "features": ["string"],
  "raos": [
    {
      "role": "string",
      "action": "string",
      "object": "string",
      "supplementary": "string"
    }
  ]
}

Rules:
- Role: specific role name (e.g., "Admin", not "user who manages").
- Action:must be a specific, indivisible verb. Ambiguous terms such as "manage," "operate," or "process" are prohibited. Do not use the role name itself as an action.
- Object:must be an entity or data item in the system, not a composite concept.
- Supplementary: according to each entity,generate reasonable boundary conditions, business rules, or exception handling mechanisms based on the context and common business logic. Generic placeholders such as "Additional constraints..." are prohibited.

Output valid JSON only. No other text. No markdown.
`;

  const content = await callOpenRouter([{ role: "user", content: prompt }], 800);
  // Clean possible markdown
  const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();

  const result = JSON.parse(jsonStr);
  
  // add cache storage
  cache.set(cacheKey, result);
  return result;
};

exports.generateMockHTML = async (appName, raos) => {
  const raosJsonStr = JSON.stringify(raos, null, 2);
  const prompt = `
You are a senior frontend developer. Generate a clean, responsive all english mock UI in pure HTML + inline CSS (no external libraries) based on the app behaviors below.

App Name: ${appName}
Behaviors (RAOS):
${raosJsonStr}

Requirements:
- Group UI by Role,all roles are in the raos.
- the UI functions should cover all the raos functions,and all entities CRUD operation.
- For each role's behavior, create appropriate UI:
  - "create X" → form with inputs and submit button
  - "view X" → table or list
  - "edit X" → editable fields
  - "delete X" → red button
- Show supplementary as small italic note below each block.
- Use modern design: cards, padding, clear headings.
- Use inline styles only (no <style> tag, no classes).
- NO JavaScript.
- Output ONLY HTML code starting with <!DOCTYPE html>.
`;

  const html = await callOpenRouter([{ role: "user", content: prompt }], 20000);
  return html.replace(/```html\n?|\n?```/g, '').trim();
};
