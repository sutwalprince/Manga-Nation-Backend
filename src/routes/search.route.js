import { Router } from "express";
import { searchAllManga } from "../controllers/search.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";


const router = Router();

// unsecured routes
router.route("/").get(searchAllManga);


export default router;
