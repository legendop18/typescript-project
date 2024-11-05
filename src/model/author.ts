import mongoose, { Schema, Document } from "mongoose";

export interface IAuthor extends Document {
  name: string;
  bio: string;
  birthDate: Date;
  books?: mongoose.Schema.Types.ObjectId[];
}

const AuthorSchema = new Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  birthDate: { type: Date, required: true },
  books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
});

const Author = mongoose.model<IAuthor>("Author", AuthorSchema);

export { Author };
