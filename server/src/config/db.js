import mongoose from 'mongoose';

let isConnectedToMongo = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_faq_chatbot';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnectedToMongo = true;
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    isConnectedToMongo = false;
    console.log('⚠️ MongoDB connection unavailable. Switching to In-Memory DB Store mode for seamless execution.');
  }
};

export const getMongoStatus = () => isConnectedToMongo;
