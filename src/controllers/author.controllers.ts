import { NextFunction, Request, Response } from "express";
import { Author } from "../model/author";
import { book } from "../model/book";
import createHttpError from "http-errors";
import { deleteFromCloudinary } from "../utils/cloudinary";


const getallauthor = async(req:Request, res:Response , next:NextFunction)=>{
    try {
        // Optional search by author name
        const searchQuery = req.query.search || "";
        const filter = searchQuery
            ? { name: new RegExp(searchQuery as string, "i") } // Case-insensitive regex for name search
            : {};

        // Query all authors with optional filtering
        const authors = await Author.find(filter);

        
        if(!authors){
            throw createHttpError(400,"book not found")
        }
        // Return response with authors list
        res.status(200).json({
            success: true,
            authors,
        });
    } catch (error) {
        console.error("Error in getAllAuthors:", error);
        next(error); // Pass error to error handler
    }

};

const getauthorbyid = async (req:Request, res:Response,next:NextFunction)=>{
    try {
        const  authorId  = req.params.authorId

        
        // Check if authorId is provided
        if (!authorId) {
            throw createHttpError(400, "Author ID is required");
        }

        // Find the author by ID and populate their books
        const author = await Author.findById(authorId)
        
        // Check if the author exists
        if (!author) {
            throw createHttpError(404, "Author not found");
        }

        // Respond with author data
        res.status(200).json({
            success: true,
            author,
        });
    } catch (error) {
        console.error("Error in getAuthorById:", error);
        next(error); // Pass error to error handler
    }


}

const updateauthor = async (req:Request, res:Response ,next:NextFunction)=>{
    try {
        const  authorId  = req.params.authorId; // Get author ID from route parameters
        const updateData = req.body; // Updated data from request body

        // Check if author ID is provided
        if (!authorId) {
            throw createHttpError(400, "Author ID is required");
        }

        // Find the author by ID and apply updates
        const updatedAuthor = await Author.findByIdAndUpdate(
            authorId,
            updateData,
            { new: true} // Return updated author 
        );

        // Check if author exists
        if (!updatedAuthor) {
            throw createHttpError(404, "Author not found");
        }

        // Send the updated author as response
        res.status(200).json({
            success: true,
            message: "Author updated successfully",
            author: updatedAuthor
        });
    } catch (error) {
        console.error("Error in updateAuthor:", error);
        next(error); // Pass error to the error handler middleware
    }
}

const deleteauthor = async(req:Request,res:Response,next:NextFunction)=>{
    
    
        try {
            const { authorId } = req.params; // Extract author ID from route parameters
    
            // Check if the author exists
            const author = await Author.findById(authorId);
            if (!author) {
                return next(createHttpError(404, "Author not found"));
            }

        
            const Book = await book.findById(authorId)

            console.log(Book);
            
            
            let coverImageUrl = Book?.coverImage;

        // If there is a cover image URL, delete it from Cloudinary
            if (coverImageUrl) {
                const publicId = coverImageUrl.split("/").pop()?.split(".")[0];  // Extract public ID from URL
            if (publicId) {
                await deleteFromCloudinary(publicId);  // Call utility function to delete the image
                }
            }
    
            // Option 1: Delete books associated with the author
            await book.deleteMany({ author: authorId });
    
            // Option 2: If you don't want to delete the books but just remove the association, uncomment the following:
            // await Book.updateMany({ author: authorId }, { $unset: { author: "" } });
    
            // Delete the author document
            await author.deleteOne();
    
            // Respond with success message
            res.status(200).json({
                success: true,
                message: "Author and associated books deleted successfully",
            });
        } catch (error) {
            console.error("Error in deleteAuthor:", error);
            next(error); // Pass error to the error handler
        }
    };
    


export {getallauthor ,getauthorbyid,updateauthor,deleteauthor}



