import mongoose from "mongoose";


const chaptersSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    file:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
        enum:['lesson','evaluation', 'exercise'],
    },
    isLocked:{
        type:Boolean,
        default:true,
    }
},{timestamps:true});


const coursesSchema = new mongoose.Schema({
    trainerId:{
        type:String,
        required:true
    }
    ,title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true
    },
   chapters:[chaptersSchema],
   isValidate:{
    type:Boolean,
    default:false
    },
   views:{
    type:Number,
    default:0
   },
   subscribers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
   }],

}, {timestamps:true});

export const Courses = mongoose.model("Courses", coursesSchema);