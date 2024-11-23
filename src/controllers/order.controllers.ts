import { NextFunction, Request, Response } from "express";
import { Order } from "../model/order";
import razorpayinstance from "../utils/razorpay";
import createHttpError from "http-errors";
import { book } from "../model/book";


const createorder = async (req:Request,res:Response,next:NextFunction)=>{
    
  const { userId, items, shippingAddress } = req.body;

  try {
      if (!userId || !items || items.length === 0 || !shippingAddress) {
          return next(createHttpError(400, 'User ID, items, and shipping address are required'));
      }

      // Check if books exist and have enough stock
      let totalPrice = 0;

      for (const item of items) {
          const Book = await book.findById(item.bookId);
          if (!Book) {
              throw createHttpError(404,`Book not found for ID: ${item.bookId}`)
          }

          if (Book.stock < item.quantity) {
            throw createHttpError(404,`Not enough stock for book: ${Book.title}`)
          }

          // Add to total price
          totalPrice += item.price * item.quantity;

          // Deduct the stock of the book
          Book.stock -= item.quantity;
          await Book.save();
      }

      const options ={
        amount:totalPrice * 100,
        currency:"INR",
        receipt:""
      }
      
      const razorpayorder = await  razorpayinstance.orders.create(options)

      // Create the order
      const newOrder = new Order({
          userId,
          items,
          totalAmount: totalPrice,
          shippingAddress,
          status: 'pending', // Initially set to 'pending'
          orderDate: new Date(),
          
      });

      // Save the order to the database
      await newOrder.save();

      res.status(201).json({
          success: true,
          message: 'Order placed successfully',
          order: newOrder,
      });
  } catch (error) {
      next(createHttpError(500, 'Error creating direct order'));
  }
    
}

const updateorder = async (req:Request,res:Response,next:NextFunction)=>{
  const { orderId, status } = req.body; // Get the order ID and new status from the request body

    try {
        // Validate the status
        if (!['pending', 'shipped', 'delivered', 'canceled'].includes(status)) {
            throw createHttpError(404,'Invalid status')
        }

        // Find the order by ID
        const order = await Order.findById(orderId);

        if (!order) {
          throw createHttpError(404,'Order not found')
        }

        // Update the status
        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order,
        });
    } catch (error) {
        console.log("Error in updateorder");
        
        next(error)
    }
}
const cancelorder = async (req:Request,res:Response,next:NextFunction)=>{
  const { orderId } = req.params; // Get the order ID from URL params

    try {
        // Find the order by ID
        const order = await Order.findById(orderId);

        if (!order) {
          throw createHttpError(404,'Order not found')
        }

        // Only allow deletion if the order is pending or has not been shipped/delivered
        if (order.status !== 'pending') {
            throw createHttpError(400,'Cannot cancel an order that is already shipped or delivered')

        }

        // Delete the order
        await order.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Order canceled successfully',
        });
    } catch (error) {
        next(error);
        console.log('Error deleting order');
        
    }
}

 const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { userId, status } = req.query;

      // Construct the query based on the userId and status filter (if provided)
      const query: any = {};
      if (userId) query.userId = userId;
      if (status) query.status = status;

      // Fetch all orders and sort by status (pending first) and order date (most recent first)
      const orders = await Order.find(query)
          .populate("userId", "name email") // Populate user details
          .populate("items.bookId", "title price ") // Populate book details (title, price, )
          .sort({ 
              status: 'asc',  // 'pending' will come first because it's alphabetically before others
              orderDate: -1   // Sort by order date (most recent first)
          });

      // Send the response with the fetched orders
      res.status(200).json({
          success: true,
          orders,
      });
  } catch (error) {
      next(error); // Pass the error to error handling middleware
  }
};




export {createorder,updateorder,cancelorder,getAllOrders}








