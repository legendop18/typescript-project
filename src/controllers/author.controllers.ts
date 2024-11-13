import { NextFunction, Request, Response } from "express";
import { Author } from "../model/author";
import createHttpError from "http-errors";


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





export {getallauthor}



