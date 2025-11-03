import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    fullname:{
        type:String,
        required:true,
    },
    role:{
        type:String, //Beneficiary , Agent , Supervisor , Admin
        required:true,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    mobileCode:{
        type:String,
        required:false
    },
    subscribeCourses:{
        type:[String],
        required: true,
    },
    resetPasswordToken:String,
    resetPasswordExpiresAt:Date,
    verificationToken:String,
    verificationTokenExpiresAt:Date,

}, {timestamps:true});

export const User = mongoose.model("User", userSchema);