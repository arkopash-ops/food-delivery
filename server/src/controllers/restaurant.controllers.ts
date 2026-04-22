import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";
import * as restaurantService from "../services/restaurant.services.js";
import { uploadCloudinary } from "../middleware/uploadCloudinary.middleware.js";

interface AuthUser {
  _id: Types.ObjectId;
  role: string;
}

// list of restaurant
export const _listRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurants = await restaurantService.listRestaurants();

    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// get restaurant by manager
export const _getMyRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as AuthUser;

    const restaurant = await restaurantService.getMyRestaurant(user._id);

    if (!restaurant) {
      return res.status(200).json({
        success: true,
        restaurant: null,
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};


// create restaurant controller
export const _createRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as AuthUser;

    let imageUrl: string | undefined;
    if (req.file && req.file.buffer) {
      const result = await uploadCloudinary(
        req.file.buffer,
        "restaurants"
      );
      imageUrl = result.secure_url;
    }

    let address = req.body.address;
    if (typeof address === "string") {
      address = JSON.parse(address);
    }

    const restaurant = await restaurantService.createRestaurant(user._id, {
      ...req.body,
      address,
      image: imageUrl,
    });

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
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing id." });
    }

    let imageUrl: string | undefined;
    if (req.file && req.file.buffer) {
      const result = await uploadCloudinary(
        req.file.buffer,
        "restaurants"
      );
      imageUrl = result.secure_url;
    }

    let address = req.body.address;
    if (typeof address === "string") {
      address = JSON.parse(address);
    }

    const updateData = {
      ...req.body,
      address,
      ...(imageUrl ? { image: imageUrl } : {}),
    };

    const restaurant = await restaurantService.updateRestaurant(
      user._id,
      id,
      updateData
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

// MenuItems by Restaurent
export const _getRestaurantWithMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ success: false, message: "Invalid or missing id." });
    }

    const data = await restaurantService.getRestaurantWithMenu(id);

    res.status(200).json({
      success: true,
      restaurant: data.restaurant,
      items: data.items,
    });
  } catch (error) {
    next(error);
  }
};
