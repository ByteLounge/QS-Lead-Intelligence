const { GoogleGenerativeAI } = require('@google/generative-ai');
const { loadEnv } = require('./load-env');

loadEnv();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment or .env.local');
  process.exit(1);
}
const modelName = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
  console.log('Testing Google Gemini API connectivity...');
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Explain in 15 words what Queenstown Labs does for logistics clients.');
    console.log('✓ Gemini Response:');
    console.log(result.response.text());
    console.log('\nGoogle Gemini API is fully operational!');
  } catch (err) {
    console.error('Gemini API verification error:', err);
    process.exit(1);
  }
}

testGemini();
