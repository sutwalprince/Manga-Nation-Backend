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

const uploadMangaChapter = asyncHandler(async function (req, res) {
  const { chapterNumber, title } = req.body;
  const { mangaId } = req.params;

  try {
    const mangaSlug = new mongoose.Types.ObjectId(mangaId);
    //   validiation
    if ([chapterNumber, title].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required ");
    }

    console.log(req.files[0]);
    // avatar = await uploadOnCloudinary(avatarLocalPath);
    const pages = await Promise.all(
      req.files.map(async (image) => {
        const result = await uploadOnCloudinary(image?.path);
        return result.url;
      })
    );

    const newChapter = new Chapter({
      mangaSlug,
      chapterNumber,
      title,
      pages,
    });
    await newChapter.save();

    return res
      .status(201)
      .json(new ApiResponse(201, newChapter, "User registered successfully"));
  } catch (error) {
    // if (avatar) await deleteFromCloudinary(avatar.public_id);
    // if (coverImage) await deleteFromCloudinary(coverImage.public_id);
    throw new ApiError(500, "User not created " + error.message);
  }
});

export { uploadMangaChapter };
