import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
    gameId: {
      type: String,
      required: true, 
    },
    playerId: {
      type: String,
      required: true, 
    },
    card: {
      type: [[Number]],  
      required: true,
    },
  });

export const Card = mongoose.model('Card', cardSchema);
  