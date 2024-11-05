import mongoose, { Schema  , Document } from "mongoose";

export interface IReview extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    bookId: mongoose.Schema.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }
  
  const ReviewSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
  });
  
const Review = mongoose.model<IReview>('Review', ReviewSchema);

export {Review}
  