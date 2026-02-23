const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcrypt');
const Candidate = require('../Models/Candidate.model');
const verifyToken = require('../Middleware/Verify');


const JWT_SECRET = 'JWT_SECRET_KEY'

// sign up

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const exists = await Candidate.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Candidate({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: "Signup Successful", user });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});



// Login
router.post('/login',async(req,res)=>{
    try{
        const {email, password} = req.body;

        const user = await Candidate.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        // verify password

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({message:"Incorrect Password"});
        }


        // generate token
        const token =  jwt.sign({id:user._id, email: user.email}, JWT_SECRET, {expiresIn:'24h'});

        return res.status(200).json({message:"Login Successful",token});


    }catch(error){
        res.status(500).json({message:"Internal Server Error!"});
    }
})

// protected route

router.get('/profile',verifyToken,async(req,res)=>{
     try {
    const user = await Candidate.findById(req.user.id).select("-password"); // exclude password
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
})



module.exports = router