const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldModelStr = 'model: "gemini-3.6-flash",';
const newModelStr = 'model: "gemini-2.5-flash",';
code = code.replace(oldModelStr, newModelStr);

const promptStr = 'The total price of selected items must be less than or equal to the total budget.';
const newPromptStr = 'CRITICAL RULE: You MUST use the EXACT prices provided in the "Available Dishes" array. Do NOT hallucinate prices. The `total` field MUST be exactly the mathematical sum of (price * quantity) for all selected items, and this total MUST be less than or equal to the total budget of ₹${budget * people}.';
code = code.replace(promptStr, newPromptStr);

fs.writeFileSync('server.ts', code);
console.log('patched server.ts');
