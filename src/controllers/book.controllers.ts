import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { Author } from "../model/author";
import { book } from "../model/book";
import { deleteFromCloudinary ,Folders,uploadtocloudinary } from "../utils/cloudinary";
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
        
        // if field fill or not
        if (!authorname || !authorbio || !authorbirthdate) {
            throw createHttpError(404,"All author fields are required")
        }

        
        // find the author
        let author = await Author.findOne({ authorname})
       
         
        // if author doesn't exist then create new author
        if(!author){
             author = await Author.create({
             authorname,
             authorbio,
             authorbirthdate
            });

            await author.save()
        }

        const existingBook = await book.findOne({ title, author: author._id });
        if (existingBook) {
            throw createHttpError(409,"Book with this title and author already exists")
        }
        
        let coverImageUrl: string | undefined;
        let pdfUrls: string | undefined;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        // Process cover image if it exists
        if (req.files && 'coverImage' in req.files && Array.isArray(req.files.coverImage)) {
            const coverImage = req.files.coverImage[0].path;
            const uploadImage = await uploadtocloudinary(coverImage, Folders.coverImage);
            coverImageUrl = uploadImage?.secure_url;
        }

        // Process PDF if it exists
        if (req.files && 'pdfurl' in req.files && Array.isArray(req.files.pdfurl)) {
            const pdf = req.files.pdfurl[0].path;
            const uploadPdf = await uploadtocloudinary(pdf, Folders.pdfurl);
            pdfUrls = uploadPdf?.secure_url;
        }

            console.log(pdfUrls)
           
            
        if(!title || !description ||!category||!price ||!stock|| !publishedDate ||!coverImageUrl || !pdfUrls  ){
            throw createHttpError(404,"ALL field are required!!")
        }
        //create book
        const Book = await book.create({
            title,
            description,
            category,
            price,
            stock,
            publishedDate,
            coverImage : coverImageUrl,
            pdfurl : pdfUrls,
            author : author?.id
            
        });

        await Book.save()

        // ddd the book to the author's list of books
        author?.books?.push(Book.id)
        await author?.save();

        // send response 
        res.status(201).json({
            success:true,
            message:"Book Created Successfully"
        })
    } catch (error) {
        console.log("create book error",error);

        // Delete temporary files only if there was an error
        if (req.files && (req.files as any).coverImage) {
            await fs.promises.unlink((req.files as any).coverImage[0].path).catch(unlinkError =>
                console.error("Failed to delete temporary cover image file", unlinkError)
            );
        }
        if (req.files && (req.files as any).pdfurl) {
            await fs.promises.unlink((req.files as any).pdfurl[0].path).catch(unlinkError =>
                console.error("Failed to delete temporary PDF file", unlinkError)
            );
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

        if(!Books){
            throw createHttpError(400,"book not found")
        }

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
    const Book = await book.findById(bookId)
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


        if (req.files && 'coverImage' in req.files && Array.isArray(req.files.coverImage)) {
            const coverImage = req.files.coverImage[0].path;
            const uploadImage = await uploadtocloudinary(coverImage, Folders.coverImage);
            updateData.pdfurl= uploadImage?.secure_url;
        }

        // Process PDF if it exists
        if (req.files && 'pdfurl' in req.files && Array.isArray(req.files.pdfurl)) {
            const pdf = req.files.pdf[0].path;
            const uploadPdf = await uploadtocloudinary(pdf, Folders.pdfurl);
            updateData.pdfurl = uploadPdf?.secure_url;
        }

        // Find the book by ID and update with new data
        const updatedBook = await book.findByIdAndUpdate(
            bookId,
            updateData,
            { new: true} // Options: return updated book 
        ) //.populate("author", "name bio birthDate"); // Optionally populate author fields

        console.log();
        
        // response 

        res.status(200).json({
            success: true,
            message: "Book updated successfully",
            book: updatedBook
        });
    } catch (error) {
        console.error("Error in updateBook:", error);
        // Delete temporary files only if there was an error
        if (req.files && (req.files as any).coverImage) {
            await fs.promises.unlink((req.files as any).coverImage[0].path).catch(unlinkError =>
                console.error("Failed to delete temporary cover image file", unlinkError)
            );
        }
        if (req.files && (req.files as any).pdfurl) {
            await fs.promises.unlink((req.files as any).pdfurl[0].path).catch(unlinkError =>
                console.error("Failed to delete temporary PDF file", unlinkError)
            );
        }
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