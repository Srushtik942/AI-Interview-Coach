const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
const PORT = 3000;
let  sessions = {};
const getQuestion = require('./Helper/AI_Helper_Function')
// middleware
app.use(express.json());
app.use(cors());

app.get('/',async(req,res)=>{

    res.send("Hello World!");
})

app.post('/api/start-session',async(req,res)=>{
    try{
        const {role, experience, category} = req.body;

        if(!role || !experience || !category){
            return res.status(400).json({error:"Please provide role or experience"});
        }

        // function calling

        const question = await getQuestion(role, experience,category);

        // generate session id
        const sessionId = uuidv4();

        sessions[sessionId] = {
            role,
            experience,
            category,
            history: [question],
        }

         res.status(200).json({
      sessionId,
      question: question.question,

    });


    }catch(error){
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
})

app.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`);
})


