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




// import routes
// import healthCheckRouter from './routes/healthcheck.route.js'
// import userRouter from './routes/user.routes.js'
// import videoRouter from './routes/video.route.js'
// import commentRouter from './routes/comment.route.js'
// import playlistRouter from './routes/playlist.route.js'
import uploadMangaChapterRouter from './routes/upload-chapter.route.js'
import addNewMangaRouter from './routes/add-manga.route.js'
import readMangaRouter from './routes/read-manga.route.js'


import { errorHandler } from './middlewares/error.middlewares.js'

// routes
// app.use("/api/v1/healthcheck" , healthCheckRouter)
// app.use("/api/v1/users" , userRouter)
// app.use("/api/v1/v" , videoRouter)
// app.use("/api/v1/v/comment" , commentRouter)
// app.use("/api/v1/v/playlist" , playlistRouter)
app.use("/api/v1/manga" , uploadMangaChapterRouter)
app.use("/api/v1/manga/new" , addNewMangaRouter)
app.use("/api/v1/manga/read" , readMangaRouter)



app.use(errorHandler)
export {app}