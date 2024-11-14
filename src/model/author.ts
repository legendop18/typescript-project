import mongoose, { Schema, Document } from "mongoose";

export interface IAuthor extends Document {
  _id: any;
  authorname: string;
  authorbio: string;
  authorbirthdate: Date;
  books?: mongoose.Schema.Types.ObjectId[];
}

const AuthorSchema = new Schema({
  authorname: { type: String, required: true },
  authorbio: { type: String, required: true },
  authorbirthdate: { type: Date, required: true },
  books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
});

const Author = mongoose.model<IAuthor>("Author", AuthorSchema);

export { Author };
