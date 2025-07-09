import { Manga } from "../models/manga.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



// Controller (Manga)
const searchAllManga = asyncHandler(async (req, res) => {
  const { search = "", genre = "", status = "" } = req.query;

  console.log("Search Query:", search);
  const filter = {
    ...(search && { title: { $regex: search, $options: "i" } }),
    ...(genre && { genres: genre }),
    ...(status && { status }),
  };

  const mangas = await Manga.find(filter).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, mangas, "Fetched mangas"));
});

export {
    searchAllManga,
}
