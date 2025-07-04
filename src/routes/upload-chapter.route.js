import { Router } from "express";
import { uploadMangaChapter } from "../controllers/upload-chapter.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";


const router = Router();

// unsecured routes

router
  .route("/upload-chapter/:mangaId")
  .post(upload.array("photos", 100), uploadMangaChapter);

// secured routes

// router.route("/update-user").post(verifyToken, updateAccountDetails);
// router
//   .route("/update-avatar")
//   .patch(verifyToken, upload.single("avatar"), updateUserAvatar);

// router
//   .route("/update-cover")
//   .patch(verifyToken, upload.single("coverImage"), updateUserCoverImage);

export default router;
