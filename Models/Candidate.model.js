const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true
    }
},
{
    timestamps: true
}
);

const Candidate = mongoose.model("Candidate",CandidateSchema);
module.exports = Candidate;