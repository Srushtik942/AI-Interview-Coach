const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
const {initializeDatabase} = require('./DB/db.connect');
initializeDatabase();
const PORT = 3000;
let  sessions = {};
const getQuestion = require('./Helper/AI_Helper_Function')
const generateFeedback = require('./Helper/Feedback')
const Summary = require('./Helper/Summary');
const authRoutes = require('./Auth/auth')


// middleware
app.use(express.json());
app.use(cors());

app.get('/',async(req,res)=>{

    res.send("Hello World!");
})


// login route

app.use('/auth',authRoutes);

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


app.post('/api/answer',async(req,res)=>{
    try{
      const  {previousQuestion, answer} = req.body;

      if(!previousQuestion || !answer){
        return res.status(404).json({error:"provide previous question and answer"})
      }

      const result = await generateFeedback(previousQuestion, answer)

       res.status(200).json({
        message: "Answer processed",
        feedback: result.feedback,
        nextQuestion: result.nextQuestion
      });

    }catch(error){
        res.status(500).json({message:"Internal Server Error",error: error.message});
    }
})

app.post('/api/end-session',async(req,res)=>{
    try{
        const {sessionId} = req.body;

        if(!sessionId){
            return res.status(404).json({error:"SessionId hasn't provided!"});
        }

    //    fetch the stored data
        const sessionData = sessions[sessionId];

        if (!sessionData) {
      return res.status(404).json({ error: "Session not found!" });
    }

        const result = await Summary(sessionId, sessionData)

 return res.status(200).json({
      message: "Session ended and evaluated",
      report: result
    });


    }catch(error){
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
})


app.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`);
})


