import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";
import * as restaurantService from "../services/restaurant.services.js";

interface AuthUser {
  _id: Types.ObjectId;
  role: string;
}

// create restaurant controller
export const _createRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as AuthUser;

    const restaurant = await restaurantService.createRestaurant(
      user._id,
      req.body
    );

    res.status(201).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};


// update restaurant controller
export const _updateRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as AuthUser;
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ success: false, message: "Invalid or missing id." });
    }

    const restaurant = await restaurantService.updateRestaurant(
      user._id,
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};


// change state of isOpen
export const _updateRestaurantIsOpen = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as AuthUser;
    const { id } = req.params;
    const { isOpen } = req.body;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ success: false, message: "Invalid or missing id." });
    }

    if (typeof isOpen !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isOpen must be a boolean." });
    }

    const restaurant = await restaurantService.updateRestaurantIsOpen(
      user._id,
      id,
      isOpen
    );

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};
