import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  description: string;
  author: mongoose.Schema.Types.ObjectId;
  category: string;
  price: number;
  stock: number;
  publishedDate: Date;
  isbn: string;
  coverImageUrl?: string;
  reviews?: mongoose.Schema.Types.ObjectId[];
  rating?: number;
}

const BookSchema: Schema = new Schema<IBook>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  publishedDate: { type: Date, required: true },
  coverImageUrl: { type: String },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  rating: { type: Number, default: 0 },
});

const book = mongoose.model<IBook>('Book', BookSchema);
export {book}