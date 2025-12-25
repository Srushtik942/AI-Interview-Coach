const axios = require('axios');
const { model } = require('mongoose');
require('dotenv/config');

const API_URL= 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';
const API_KEY = process.env.API_KEY;


if(!API_KEY){
    console.log("Plese set api key in .env");
    process.exit(1);
}


const SYSTEM_PROMPT = `
You are an AI assistant acting as an interview coach.
Evaluate the candidate based on the entire interview session.

- Return JSON ONLY


SCHEMA (use EXACT keys):
{
  "score": number,
  "summary": "string - 2 to 3 sentences summarizing performance",
  "tips": ["string", "string", "string"]
}

WHERE:
- score = 0 to 10, decimals allowed
- tips = actionable suggestions for improvement
`


async function Summary(sessionId, sessions) {
    if(!sessions || !sessions.history){
        throw new Error("Session not found")
    }

    const USER_PROMPT = `Evaluate this interview.
    ${JSON.stringify(sessions.history, null, 2)}

     Generate JSON summary as instructed.
    `

    const res = await axios.post(
        API_URL,
        {
            model: MODEL,
            messages:[
                {role: "system", content: SYSTEM_PROMPT},
                {role: "user", content: USER_PROMPT}

            ]
        },
        {
            headers:{
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            }
        }
    );

      let content = res.data?.choices?.[0]?.message?.content || "{}";

      try{
        return JSON.parse(content);
      }catch(e){
        return { summary: "Model failed to return valid JSON" };
      }
}

module.exports = Summary;