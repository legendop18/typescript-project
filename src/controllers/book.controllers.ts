import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { Author } from "../model/author";
import { book } from "../model/book";
import { deleteFromCloudinary ,uploadtocloudinary } from "../utils/cloudinary";
import fs from 'fs'



// const BookSchema= new Schema<IBook>({
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     author: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
//     category: { type: String, required: true },
//     price: { type: Number, required: true },
//     stock: { type: Number, required: true },
//     publishedDate: { type: Date, required: true },
//     coverImageUrl: { type: String },
//     reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
//     rating: { type: Number, default: 0 },
//   });
  

const createbook = async (req:Request,res:Response,next:NextFunction) =>{
    const {title,description,authorname,authorbio,authorbirthdate,category,price,stock,publishedDate} = req.body

    
    
    try {


        

        if (!authorname || !authorbio || !authorbirthdate) {
            throw createHttpError(404,"All author fields are required")
        }

        if(!authorname){
            throw createHttpError(400,"Author name is required")
        }

        
        

        let author = await Author.findOne({ authorname})
         console.log(author);
         
        // if author doesn't exist then create new author
        if(!author){
             author = await Author.create({
             authorname,
             authorbio,
             authorbirthdate
            });

            await author.save()
        }

        
        
        const coverImage = req.file?.path as string


        if(!coverImage){
            throw createHttpError(400,"upload the coverimage")
        }


        const uploadcoverimage = await uploadtocloudinary(coverImage)

        
        const Book = await book.create({
            title,
            description,
            category,
            price,
            stock,
            publishedDate,
            coverImage : uploadcoverimage?.url,
            author : author?.id
            
        });

        await Book.save()

        author?.books?.push(Book.id)
        await author?.save();

        res.status(201).json({
            success:true,
            message:"Book Created Successfully"
        })
    } catch (error) {
        console.log("create book error",error);


        if (req.file?.path) {
            fs.promises.unlink(req.file.path)
                .then(() => console.log("Temporary file deleted"))
                .catch((unlinkError) => console.log("Failed to delete temporary file", unlinkError));
        }

        next(error)   
    }


};

const getallbook = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const searchquery = req.query.search || ""
        const sortfield = req.query.sort || "title"
        const sortorder = req.query.order ==="desc" ? -1:1 //default sort in ascending order

        //bulid the search filter for title , category
        const filter = {
             $or:[
                {title :new RegExp(searchquery as string || "i")},
                {category :new RegExp(searchquery as string || "i")}
             ]
        };
        
        // Query the database with sorting...
        const Books = await book.find(filter)
        .sort({[sortfield as string]:sortorder})

        //Send the filtered and sorted books as a response
        res.status(201).json({
            success:true,
            message:"book retrieved successfully",
            Books
        })

    } catch (error) {
        console.log("getallbook error",error);
        next(error)
        
    };




}
const getbookById = async(req:Request,res:Response,next:NextFunction)=>{
    const bookId = req.params.bookId;

    console.log(bookId)

    if(!bookId){
       throw createHttpError(400,"book id is required")
    };

    //find the book by id and 
    const Book = book.findById(bookId)
    .populate("author")

    //if the book is found 
    if(!Book){
        throw createHttpError(404,"book not found")
    }


    //send response 
    res.status(201).json({
        success:true,
        Book
    })
}

const updatebook = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const { bookId } = req.params;  // Get book ID from route parameters
        const updateData = req.body;  // Updated data from the request body

        
        //if the book found
        if(!bookId ){
            throw createHttpError(404,"Book Id is required")
        };

        const bookToUpdate = await book.findById(bookId);
        if (!bookToUpdate) {
            return next(createHttpError(404, "Book not found"));
        }


        if(req.file?.path){
            const uploadimage = await uploadtocloudinary(req.file.path)
            updateData.coverImage = uploadimage?.secure_url
        }

        // Find the book by ID and update with new data
        const updatedBook = await book.findByIdAndUpdate(
            bookId,
            updateData,
            { new: true} // Options: return updated book 
        ).populate("author", "name bio birthDate"); // Optionally populate author fields

        
        // response 

        res.status(200).json({
            success: true,
            message: "Book updated successfully",
            book: updatedBook
        });
    } catch (error) {
        console.error("Error in updateBook:", error);
        next(error); // Pass error to error handler middleware
    }
}

const deletebook = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const { bookId } = req.params; // Get book ID from route parameters


        //if the book found
        if(!bookId ){
            throw createHttpError(404,"book Id is required")
        };

        const Book = await book.findById(bookId);
        if (!Book) {
            throw createHttpError(404, "Book not found");
        }


        const coverImageUrl = Book.coverImage;

        // If there is a cover image URL, delete it from Cloudinary
        if (coverImageUrl) {
            const publicId = coverImageUrl.split("/").pop()?.split(".")[0];  // Extract public ID from URL
            if (publicId) {
                await deleteFromCloudinary(publicId);  // Call utility function to delete the image
            }
        }

        // Find and delete the book by ID
        const deletedBook = await book.findByIdAndDelete(bookId);

       

        res.status(200).json({
            success: true,
            message: "Book deleted successfully",
            deletedBook
        });
    } catch (error) {
        console.error("Error in deleteBook:", error);
        next(error); // Pass error to error handler middleware
    }

}

// const searchbook = async(req:Request,res:Response,next:NextFunction)=>{

// }


export {createbook,getallbook,getbookById,updatebook,deletebook}