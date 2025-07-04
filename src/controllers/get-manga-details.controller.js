import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Manga } from "../models/manga.models.js";
import { Chapter } from "../models/chapter.models.js";

const getAllManga = asyncHandler(async function (req, res) {
 
  try {
    // get all manga
    const manga = await Manga.find().sort({ createdAt: -1 });

    if (!manga) {
      throw new ApiError(500, "manga not found " + error.message);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, manga, "User registered successfully"));
  } catch (error) {
    throw new ApiError(500, "something went wrong " + error.message);
  }
});
const getMangaDetails = asyncHandler(async function (req, res) {
  const { slug } = req.params;
  try {
    //   validiation
    const manga = await Manga.findOne({ slug });
    if (!manga) {
      throw new ApiError(500, "manga not found " + error.message);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, manga, "User registered successfully"));
  } catch (error) {
    throw new ApiError(500, "something went wrong " + error.message);
  }
});

const getMangaChapter = asyncHandler(async function (req, res) {
  const { slug, chapterId } = req.params;
  console.log({slug});
  try {
    //   validiation
    const manga = await Manga.findOne({ slug } );
    if (!manga) {
      throw new ApiError(500, "manga not found " + error.message);
    }
    if (manga.chapters.includes(chapterId) === false) {
      throw new ApiError(404, "chapter not found in this manga");
    }
    const chapter = await Chapter.findById(chapterId);

    return res
      .status(201)
      .json(new ApiResponse(201, chapter, "User registered successfully"));
  } catch (error) {
    throw new ApiError(500, "something went wrong " + error.message);
  }
});

export { getMangaDetails, getMangaChapter , getAllManga };
