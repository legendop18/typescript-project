import { NextFunction, Request, Response } from "express";
import { Review } from "../model/review";
import createHttpError from "http-errors";
import { book } from "../model/book";


const createreviews = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const { bookId, rating, comment } = req.body;
        const userId = req.user?.id; // Assuming `req.user` is populated by authentication middleware

        if (!userId) {
            throw createHttpError(401, "User not authenticated");
        }

        const Book = await book.findById(bookId);
        if (!Book) {
            throw createHttpError(404, "Book not found");
        }

        const existingReview = await Review.findOne({ userId, bookId });

         if (existingReview) {
             throw createHttpError(400, "You have already reviewed this book");
        }
        const review = await Review.create(
            {
                userId,
                bookId,
                rating,
                comment 
            }
        );

       Book.reviews?.push(review.id)

        // Optionally update the book's average rating
        const reviews = await Review.find({ bookId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        Book.rating = avgRating;
        
        await Book.save();

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review,
        });
    } catch (error) {
        next(error);
    }
}

 const bookallReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookId } = req.params;
  
      if (!bookId) {
        throw createHttpError(400, "Book ID is required");
      }
  
      const Book = await book.findById(bookId);
      if (!Book) {
        throw createHttpError(404, "Book not found");
      }
  
      // Fetch all reviews for the book
      const reviews = await Review.find({ bookId }).populate("userId", "name email");
  
      if (reviews.length === 0) {
        res.status(200).json({
          success: true,
          message: "No reviews found for this book",
        });
      }
  
      // Separate positive and negative reviews
      const positiveReviews = reviews.filter(review => review.rating >= 4); // Positive reviews
      const negativeReviews = reviews.filter(review => review.rating <= 2); // Negative reviews
  
      // Sorting logic:
      // Sort positive reviews by rating descending and date ascending
      const sortedPositiveReviews = positiveReviews.sort((a, b) => b.rating - a.rating || a.date.getTime() - b.date.getTime());
      
      // Sort negative reviews by rating ascending and date ascending
      const sortedNegativeReviews = negativeReviews.sort((a, b) => a.rating - b.rating || a.date.getTime() - b.date.getTime());
  
      // If no positive reviews exist, return a specific message or handle how you want
      if (positiveReviews.length === 0) {
        res.status(200).json({
          success: true,
          reviews: sortedNegativeReviews, // Show only negative reviews
        });
      }
  
      // If positive reviews exist, show positive first, followed by negative
      const allSortedReviews = [...sortedPositiveReviews, ...sortedNegativeReviews];
  
      res.status(200).json({
        success: true,
        reviews: allSortedReviews,
      });
    } catch (error) {
      next(error);
    }
  };
  


const deletereviews = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const { reviewId } = req.params;

        // Find the review by ID
        const review = await Review.findById(reviewId);
        if (!review) {
            throw createHttpError(404, "Review not found");
        }

        // Remove the review from the Book's reviews array
        await book.findByIdAndUpdate(review.bookId, {
            $pull: { reviews: review._id },
        });

        // Delete the review
        await review.deleteOne();

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}


export {createreviews,bookallReviews,deletereviews}

