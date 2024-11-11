import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { Author } from "../model/author";
import { book } from "../model/book";
import {  uploadtocloudinary } from "../utils/cloudinary";




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
            const author = await Author.create({
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
const getAuthorById = async(req:Request,res:Response,next:NextFunction)=>{
    
}


export {createbook,getallbook}