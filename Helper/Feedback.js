const axios = require('axios');
require('dotenv/config');

const API_URL= 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';
const API_KEY = process.env.API_KEY;

if(!API_KEY){
    console.log("Plese set api key in .env");
    process.exit(1);
}

const SYSTEM_PROMPT = `You are an AI assistant acting as an interview coach.
Give Feedback for answers.


Use exactly this schema:

{
  "feedback": "string - the feedback ",
  "nextQuestion": "string - HR or Technical",
}

Rules:
- Output valid JSON only.
- Keep field names exactly as above
`

async function generateFeedback(previousQuestion, answer) {
     const USER_PROMPT = `
  The previous question was: "${previousQuestion}"
  Candidate's answer: "${answer}"

  Evaluate the answer, give feedback, then generate the next relevant interview question.
  `;

  const res = await axios.post(
    API_URL,
    {
        model: MODEL,
        messages:[
            {role:"system", content: SYSTEM_PROMPT},
            {role:"user", content: USER_PROMPT},
        ],
    },
    {
        headers:{
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
    }
  );

  const content = res.data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

module.exports = generateFeedback;