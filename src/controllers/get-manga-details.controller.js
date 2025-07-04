import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Manga } from "../models/manga.models.js";
import { Chapter } from "../models/chapter.models.js";


const getMangaDetails = asyncHandler(async function (req, res) {
  const { slug } = req.params;
console.log(mangaSlug)
  try {
    //   validiation
    const manga = await Manga.findOne({ slug  });
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
  const { slug } = req.params;
console.log(mangaSlug)
  try {
    //   validiation
    const manga = await Manga.findOne({ slug  });
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

export { getMangaDetails ,getMangaChapter };
