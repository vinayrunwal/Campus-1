import fs from 'fs';

let envStr = fs.readFileSync('.env', 'utf-8');
let match = envStr.match(/VITE_GEMINI_API_KEY="?([^"\n]+)"?/);
if (!match) {
  console.error("No API key in .env");
  process.exit(1);
}
let apiKey = match[1];

async function listModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.error) {
    console.error("Error from API:", data.error);
    return;
  }
  for(let model of data.models) {
    console.log(model.name, "supportedMethods:", model.supportedGenerationMethods);
  }
}
listModels();
