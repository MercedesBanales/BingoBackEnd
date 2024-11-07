import mongoose from 'mongoose';

const uri = "mongodb://localhost:27017/bingo_db";

export const connectToMongo = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB with Mongoose');
  } catch (error) {
    console.error('Error when trying to connect to MongoDB:', error);
    throw error;
  }
};