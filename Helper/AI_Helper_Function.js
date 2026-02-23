const axios = require('axios');
require('dotenv/config')

const API_URL= 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';
const API_KEY = process.env.API_KEY;

if(!API_KEY){
    console.log("Plese set api key in .env");
    process.exit(1);
}


const SYSTEM_PROMPT = `
You are an AI assistant acting as an interview coach.
Respond with JSON only. No prose, markdown or backticks.

Use exactly this schema:

{
  "question": "string - the interview question",
  "category": "string - HR or Technical",
  "difficulty": "string - easy, medium, hard"
}

Rules:
- Output valid JSON only.
- Keep field names exactly as above.
`


async function getQuestion(role, experience,category) {
    const USER_PROMPT = `Generate one ${category} interview question for ${experience} year experience ${role} developer.`;

    const res = await axios.post(
        API_URL,
        {
            model: MODEL,
            messages: [
                {role:'system', content: SYSTEM_PROMPT},
                {role: 'user',content:USER_PROMPT}
            ]
        },
        {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const content = res.data?.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content);
}

module.exports = getQuestion;