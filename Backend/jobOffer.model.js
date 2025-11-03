import mongoose from "mongoose";


const candidateSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    file:{
        type:String,
        required:true,
    },
    optionalFile:{
        type:String,
    }
});

const jobOfferSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    deadline:{
        type:Date,
        required:true,
    },
    candidates:[candidateSchema],
}, {timestamps:true});

export const JobOffer = mongoose.model("JobOffer", jobOfferSchema);