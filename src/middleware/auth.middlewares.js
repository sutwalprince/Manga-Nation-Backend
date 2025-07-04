import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";


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
      throw new ApiError(401, "Unauthorized user");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(
      401,
      "SOMETHING WENT WRONG DURING TOKEN CHECKING" + error.message
    );
  }
});

export const verifyVideoOwner = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(401, "video not found");
  }
  const id = new mongoose.Types.ObjectId(videoId);

  try {
    const video = await Video.findById(id);

    console.log(video.owner.toString())
    console.log(req.user._id.toString())
    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(401, "Unauthorized user");
    }

    next();
  } catch (error) {
    throw new ApiError(
      401,
      "Unauthorized user " + error.message
    );
  }
});

export const verifyCommentOwner = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(401, "video not found");
  }
  
  const id = new mongoose.Types.ObjectId(commentId);

  try {
    const comment = await Comment.findById(id);

    if (comment.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(401, "Unauthorized user");
    }

    next();
  } catch (error) {
    throw new ApiError(
      401,
      "Unauthorized user " + error.message
    );
  }
});

export const verifyPlaylistOwner = asyncHandler(async (req, res, next) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(401, "playlist not found");
  }
  
  const id = new mongoose.Types.ObjectId(playlistId);

  try {
    const playlist = await Playlist.findById(id);

    if (playlist.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(401, "Unauthorized user");
    }

    next();
  } catch (error) {
    throw new ApiError(
      401,
      "Unauthorized user " + error.message
    );
  }
});