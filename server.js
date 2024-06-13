import "dotenv/config"
import http from "http"
import path from "path"
import cors from "cors"
import cookieParser from "cookie-parser"
import express from "express"
import { config } from "./config/index.js"
import { setupAsyncLocalStorage } from "./middlewares/setupAls.middleware.js"
import { boardRoutes } from "./api/board/board.routes.js"
import { userRoutes } from "./api/user/user.routes.js"
import { authRoutes } from "./api/auth/auth.routes.js"
import { setupSocketAPI } from "./services/socket.service.js"
// Google integration
import session from "express-session"
import passport from "passport"
import MongoStore from "connect-mongo"
import "./passport.js"

const app = express()
const server = http.createServer(app)

const corsOptions = {
  origin: ["http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}

const sessionOptions = {
  secret: "secret_session",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: config.dbURL, collectionName: "sessions" }),
}

app.use(cors(corsOptions))
app.use(express.static("public"))
app.use(express.json())
app.use(cookieParser())

// Google session
app.use(session(sessionOptions))
app.use(passport.initialize())
app.use(passport.session())

app.all("*", setupAsyncLocalStorage)

app.use("/api/board", boardRoutes)
app.use("/api/user", userRoutes)
app.use("/api/auth", authRoutes)
app.get("/", (req, res) => res.send("Hello there"))

setupSocketAPI(server)

app.get("/**", (req, res) => {
  res.sendFile(path.resolve("public/index.html"))
})

const port = process.env.PORT || 3030
server.listen(port, () => console.log(`Server listening on port http://127.0.0.1:${port} ${process.env["DB_NAME"]}`))
