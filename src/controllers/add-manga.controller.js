import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Manga } from "../models/manga.models.js";
import { Chapter } from "../models/chapter.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const addNewManga = asyncHandler(async function (req, res) {
  const {
    title,
    slug,
    description,
    genres,
    authors,
    status = "Ongoing",
  } = req.body;

  console.log(req.file);
  const coverImageLocalPath = req.file.path;

  //   validiation
  if (
    [slug, description, genres, authors, status, title].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required ");
  }

  const result = await uploadOnCloudinary(coverImageLocalPath);
  const coverImage = result.url;

  try {
    // await newManga.save();
    const newManga = await Manga.create({
      title,
      slug,
      description,
      genres,
      authors,
      status,
      coverImage,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, newManga, "Manga added successfully"));
  } catch (error) {
    // if (avatar) await deleteFromCloudinary(avatar.public_id);
    // if (coverImage) await deleteFromCloudinary(coverImage.public_id);
    throw new ApiError(500, "manga not created " + error.message);
  }
});

export { addNewManga };
