import mongoose from "mongoose";
import { type } from "os";

const answerSchema = new mongoose.Schema({
    answer: {
        type: String,
        required: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const contactAnswerSchema = new mongoose.Schema({
    from:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    subject:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
    },
    status:{
        type:Boolean,
        default:false,
    },
    answer: [answerSchema],
}, {timestamps:true});

export const ContactAnswer = mongoose.model("ContactAnswer", contactAnswerSchema);