import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express() 

app.use(
    cors({
        origin : process.env.CORS_ORIGIN ,
        credentials : true
    })
)

// common middleware
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({ extended:true ,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())





import uploadMangaChapterRouter from './routes/upload-chapter.route.js'
import addNewMangaRouter from './routes/add-manga.route.js'
import readMangaRouter from './routes/read-manga.route.js'
import userRouter from './routes/user.route.js'
import searchMangaRouter from './routes/search.route.js'


import { errorHandler } from './middlewares/error.middlewares.js'


app.use("/api/v1/manga" , uploadMangaChapterRouter)
app.use("/api/v1/manga/new" , addNewMangaRouter)
app.use("/api/v1/manga/read" , readMangaRouter)
app.use("/api/v1/search" , searchMangaRouter)

app.use("/api/v1/users" , userRouter )


app.use(errorHandler)
export {app}