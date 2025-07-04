import { Router } from "express";
import { getMangaDetails , getMangaChapter } from "../controllers/get-manga-details.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";


const router = Router();

// unsecured routes

router
  .route("/:slug")
  .get(getMangaDetails);

router
  .route("/:slug/:chapterId")
  .get(getMangaChapter);

export default router;
