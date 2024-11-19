import { Request, Response, NextFunction } from 'express';
import Cart from '../model/cart';
import {Order} from '../model/order';
import createHttpError from 'http-errors';

export const addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, bookId, quantity, price } = req.body;

    try {
        // Check if the user already has a cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // If no cart exists, create a new one
            cart = await Cart.create({
                userId,
                items: [{ bookId, quantity, price }],
                totalPrice: quantity * price,
            });
        } else {
            // If cart exists, check if the book is already in the cart
            const existingItemIndex = cart.items.findIndex((item) => item.bookId.toString() === bookId);

            if (existingItemIndex >= 0) {
                // If the book already exists, update the quantity
                cart.items[existingItemIndex].quantity += quantity;
                cart.items[existingItemIndex].price = price;
            } else {
                // If the book is not in the cart, add it
                cart.items.push({ bookId, quantity, price });
            }

            // Update the total price
            cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
        }

        // Save the cart
        await cart.save();

        res.status(201).json({
            success: true,
            message: 'Item added to cart successfully',
            cart,
        });
    } catch (error) {
        next(createHttpError(500, 'Error adding item to cart'));
    }
};

export const updateItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, bookId, quantity } = req.body;

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return next(createHttpError(404, 'Cart not found'));
        }

        // Find the item in the cart
        const itemIndex = cart.items.findIndex((item) => item.bookId.toString() === bookId);

        if (itemIndex === -1) {
            return next(createHttpError(404, 'Item not found in the cart'));
        }

        // Update the quantity
        cart.items[itemIndex].quantity = quantity;

        // Recalculate the total price
        cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        // Save the updated cart
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item quantity updated successfully',
            cart,
        });
    } catch (error) {
        next(createHttpError(500, 'Error updating item quantity'));
    }
};

export const removeItemFromCart = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, bookId } = req.body;

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return next(createHttpError(404, 'Cart not found'));
        }

        // Find the index of the item in the cart
        const itemIndex = cart.items.findIndex((item) => item.bookId.toString() === bookId);

        if (itemIndex === -1) {
            return next(createHttpError(404, 'Item not found in the cart'));
        }

        // Remove the item from the cart
        cart.items.splice(itemIndex, 1);

        // Recalculate the total price
        cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        // Save the updated cart
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            cart,
        });
    } catch (error) {
        next(createHttpError(500, 'Error removing item from cart'));
    }
};

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId }).populate('items.bookId');

        if (!cart) {
            return next(createHttpError(404, 'Cart not found'));
        }

        res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            cart,
        });
    } catch (error) {
        next(createHttpError(500, 'Error retrieving cart'));
    }
};



export const checkoutCart = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, shippingAddress } = req.body;

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return next(createHttpError(404, 'Cart not found'));
        }

        // Create a new order
        const newOrder = await Order.create({
            userId,
            items: cart.items,
            totalAmount: cart.totalPrice,
            shippingAddress,
            status: 'pending',
            orderDate: new Date(),
        });

        // Save the order
        await newOrder.save();

        // Clear the cart after checkout
        await Cart.deleteOne({ userId });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: newOrder,
        });
    } catch (error) {
        next(createHttpError(500, 'Error during checkout'));
    }
};

