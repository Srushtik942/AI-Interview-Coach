const jwt = require('jsonwebtoken');
const JWT_SECRET = 'JWT_SECRET_KEY';

function verifyToken(req,res,next){
    const authHeader = req.headers["authorization"];

    if(!authHeader){
        return res.status(401).json({message:"Accedd denied."});
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();

    }catch(error){
     res.status(401).json({message:"Invalid Token"})
    }
}

module.exports = verifyToken;