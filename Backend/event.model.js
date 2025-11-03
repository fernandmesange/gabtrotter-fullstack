import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
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
    location:{
        type:String
    }
});

const eventSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    },
    startDate:{
        type:Date,
        required:true,
    },
    endDate:{
        type:Date,
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    isFinance:{
        type:Boolean,
        default:false,
    },
    financeName:{
        type:String,
        
    },
    image:{
        type:String,
        required:true,
    },
    isFree:{
        type:Boolean,
        default:false,
    },
    price:{
        type:Number,
        
    },
    availablePlaces:{
        type:Number,
        default:0,
    },
    maximumPlaces:{
        type:Number,
        required:true,
    },
    conditions:{
        type:Array,
        default:[]
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    isAvailable:{
        type:Boolean,
        default:false,
    },
    open:{
        type:Boolean,
        default:false,
    },
    participants:[participantSchema],

}, {timestamps:true});

export const Event = mongoose.model("Event", eventSchema);