import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true,
    },
    subject:{
        type: String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    content:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        default:null,
    },
}, {timestamps:true});

export const Report = mongoose.model("Report", reportSchema);