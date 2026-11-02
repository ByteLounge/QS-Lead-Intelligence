const { loadEnv } = require('./load-env');

loadEnv();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment or .env.local');
  process.exit(1);
}

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log('API Response status:', res.status);
    if (data.models) {
      console.log('Available models:');
      data.models
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .forEach((m) => console.log(' - ' + m.name));
    } else {
      console.log('Data:', data);
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();
