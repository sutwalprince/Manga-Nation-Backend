import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Manga } from "../models/manga.models.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    } else {
      throw new ApiError(401, "Token verification failed: " + error.message);
    }
  }
});

export const verifyMangaOwner = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Manga slug is required");
  }

  // const id = new mongoose.Types.ObjectId(videoId);

  try {
    const manga = await Manga.findOne({ slug });
    if (!manga) {
      throw new ApiError(404, "Manga not found");
    }
    if (manga.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Forbidden: Not the manga owner");
    }
    req.manga = manga; // optional, only if next handler needs it
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized user " + error.message);
  }
});

export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Admin access only");
  }
  next();
});
