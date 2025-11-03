import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected`);
    } catch (error) {
        console.log(`Error connection to Database: ${error.message}`);
        process.exit(1);
    }
};
