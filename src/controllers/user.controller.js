import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Manga } from "../models/manga.models.js";
import { Chapter } from "../models/chapter.models.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "error occured at generate access and refresh token" + error.message
    );
  }
};

const registerUser = asyncHandler(async function (req, res) {
  const { fullName, email, username, password } = req.body;

  //   validiation
  if (
    [fullName, username, password, email].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required ");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }], //username is also unique
  });

  if (existedUser) {
    throw new ApiError(400, "User with username or email already exists.");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing.");
  }
  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  } catch (error) {
    throw new ApiError(500, "Error uploading avatar.");
  }

  try {
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user.");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    if (avatar) await deleteFromCloudinary(avatar.public_id);
    throw new ApiError(500, "User not created " + error.message);
  }
});

const loginUser = asyncHandler(async function (req, res) {
  // get data from body

  const { emailOrUsername, password } = req.body;

  // validation
  if (!emailOrUsername) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username: emailOrUsername }, { email: emailOrUsername }], //username is also unique
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // vaidate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(402, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(402, "Something went wrong ");
  }

  // option for cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  // if (!req.user?._id) {
  //   throw new ApiError(401, "Unauthorized");
  // }

  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(402, "Refresh Token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(402, "Invalid refreh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(402, "Refresh Token is expired");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "user logged in successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, `Something went wrong: ${error.message}`);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(404, "Wrong password entered");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user details"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName } = req.body;

  if (!fullName) {
    throw new ApiError(402, "Fullname or email is required");
  }
  const userId = req.user._id;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fullName,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "data updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(404, "File is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(404, "Something went wrong while uploading");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});

const getMyMangas = asyncHandler(async (req, res) => {
  try {
    const mangas = await Manga.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    return res
      .status(200)
      .json(new ApiResponse(404, mangas, "Your mangas fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while fetching mangas: " + error.message
    );
  }
});

const updateReadHistory = asyncHandler(async (req, res) => {
  const { mangaId, chapterId } = req.body;
  const userId = req.user._id;

  console.log("sddsdsdsdsdsd");
  if (!mangaId || !chapterId) {
    throw new ApiError(400, "Manga ID and Chapter ID are required");
  }

  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }
  const chapterNumber = chapter.chapterNumber;

  console.log("Updating read history for user:", userId);
  console.log("Manga ID:", mangaId);

  const user = await User.findById(userId);

  const index = user.readHistory.findIndex((entry) => {
    console.log("Checking entry:", entry);
    console.log("Entry Manga ID:", entry.manga.toString());
    console.log("Manga ID:", mangaId);
    return entry.manga.toString() === mangaId.toString();
  });

  if (index !== -1) {
    // Update existing entry
    user.readHistory[index].lastReadChapter = chapterId;
    user.readHistory[index].lastReadChapterNumber = chapterNumber;
    user.readHistory[index].updatedAt = Date.now();
    console.log("Updated existing read history entry:");
  } else {
    // Add new entry
    console.log("Updated existing read :");
    user.readHistory.push({
      manga: mangaId,
      lastReadChapter: chapterId,
      lastReadChapterNumber: chapterNumber,
    });
  }

  await user.save({ validateBeforeSave: false });
  console.log("read history updated successfully");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Reading progress updated"));
});

// favorites manga

const addToFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { mangaId } = req.params;

  if (!user.favorites.includes(mangaId)) {
    user.favorites.push(mangaId);
    await user.save();
  }

  res
    .status(200)
    .json(new ApiResponse(200, user.favorites, "Added to favorites"));
});

// remove from favorites
const removeFromFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { mangaId } = req.params;

  user.favorites = user.favorites.filter(
    (favorite) => favorite.toString() !== mangaId
  );
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, user.favorites, "Removed from favorites"));
});

// get favorite mangas
const getFavoriteMangas = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user.favorites, "Favorite mangas fetched"));
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getMyMangas,
  updateReadHistory,
  addToFavorites,
  removeFromFavorites,
  getFavoriteMangas,
};
