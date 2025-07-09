import { Router } from "express";
import { addNewManga } from "../controllers/add-manga.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = Router();

// unsecured routes

router
  .route("/add-manga")
  .post( verifyToken , upload.single("coverImage"), addNewManga);

// secured routes

// router.route("/update-user").post(verifyToken, updateAccountDetails);
// router
//   .route("/update-avatar")
//   .patch(verifyToken, upload.single("avatar"), updateUserAvatar);

// router
//   .route("/update-cover")
//   .patch(verifyToken, upload.single("coverImage"), updateUserCoverImage);

export default router;
