import { Router } from "express";
import {
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
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import { get } from "http";

const router = Router();

// unsecured routes
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshAccessToken);

// secured routes
router.route("/logout").post(logoutUser);
router.route("/change-password").put(verifyToken, changeCurrentPassword);
router.route("/current-user").get(verifyToken, getCurrentUser);
router.route("/my-mangas").get(verifyToken, getMyMangas);

router.route("/update-user").put(verifyToken, updateAccountDetails);
router
  .route("/update-avatar")
  .put(verifyToken, upload.single("avatar"), updateUserAvatar);

router.route("/update-read-history").post(verifyToken, updateReadHistory);
router.route("/favorites/:mangaId").post(verifyToken, addToFavorites);
router.route("/favorites/:mangaId").delete(verifyToken, removeFromFavorites);
router.route("/favorites").get(verifyToken, getFavoriteMangas);

export default router;
